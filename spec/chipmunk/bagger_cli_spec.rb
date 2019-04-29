
# frozen_string_literal: true

require "spec_helper"
require "chipmunk/bagger_cli"

RSpec.describe Chipmunk::BaggerCLI do
  describe "#initialize" do
    it "accepts audio with a source path" do
      expect(described_class.new(["audio", "foo", "-s", "/foo/bar", "/baz/quux"])).not_to be_nil
    end

    it "accepts digital w/o source path" do
      expect(described_class.new(["digital", "foo", "/path/to/output"])).not_to be_nil
    end

    it "does not accept an undefined content type" do
      expect { described_class.new(["garbage", "foo", "/path/to/output"]) }.to raise_exception(ArgumentError)
    end

    it "raises an exception with 2 args" do
      expect { described_class.new(["foo", "/path/to/output"]) }.to raise_exception(ArgumentError)
    end

    it "raises an exception with 1 arg" do
      expect { described_class.new(["foo"]) }.to raise_exception(ArgumentError)
    end

    it "raises an exception with no args" do
      expect { described_class.new([]) }.to raise_exception(ArgumentError)
    end
  end

  describe "#bagger" do
    it "can make an audio bagger" do
      expect(described_class.new(["audio", "foo", "-s", "foo", "bar"]).bagger).to be_a(Chipmunk::Bagger::Audio)
    end

    it "can make a digital bagger" do
      expect(described_class.new(["digital", "foo", "bar"]).bagger).to be_a(Chipmunk::Bagger::Digital)
    end

    it "can make a video bagger" do
      expect(described_class.new(["video", "foo", "-s", "foo", "bar"]).bagger).to be_a(Chipmunk::Bagger::Video)
    end

    it "can make a audio bagger with local metadata" do
      expect(described_class.new(["audio", "foo", "-s", "foo", "bar",
                                  "--metadata-type", "MARC",
                                  "--metadata-path", "/somewhere/whatever.xml",
                                  "--metadata-url", "http://foo.bar/whatever.xml"]).bagger).to be_a_kind_of(Chipmunk::Bagger::AudioLocalMetadata)
    end
  end

  describe "#run" do
    it "raises a RuntimeError if the source path is specified and the destination directory exists" do
      allow(File).to receive(:exist?).with("dest_path/data").and_return(true)
      expect { described_class.new(["audio", "ext_id", "-s", "src_path", "dest_path"]).run }
        .to raise_exception(RuntimeError, /won't overwrite/)
    end

    it "calls check_bag and make_bag on the bagger" do
      cli = described_class.new(["digital", "foo", "bar"])
      expect(cli.bagger).to receive(:check_bag)
      expect(cli.bagger).to receive(:make_bag)

      cli.run
    end

    context "when bagging some fake audio" do
      let(:bagger) { described_class.new(["-s", source, "audio", id, destination]) }
      let(:source) { "#{temporary_directory}/source" }
      let(:destination) { "#{temporary_directory}/destination" }
      let(:id) { "fake_id" }
      let(:temporary_directory) { "tmp_test_dir" }
      let(:files) do
        {
          '00000001.wav' => 'first',
          '00000002.wav' => 'second',
          '00000003.wav' => 'third',
          'mets.xml' => 'invalid mets',
        }
      end

      before(:each) do
        `mkdir '#{temporary_directory}'`
        `mkdir '#{source}'`
        `mkdir '#{destination}'`

        files.each do |filename, contents|
          File.open("#{source}/#{filename}", 'w') { |f| f.write(contents) }
        end
      end

      after(:each) do
        `rm -r '#{temporary_directory}'`
      end

      context "when make_bag fails" do
        before(:each) do
          allow_any_instance_of(Chipmunk::Bagger::Audio).to receive(:make_bag).and_wrap_original do |m, *args|
            begin
              m.call(*args)
            rescue
            end

            raise 'carefully inserted error'
          end
        end

        it 'raises the error we gave it' do
          expect{ bagger.run }.to raise_error('carefully inserted error')
        end

        it 'moves the files back' do
          begin
            bagger.run
          rescue
          end

          files.keys.each do |filename|
            expect(File.exist? "#{source}/#{filename}").to be true
          end
        end

        context "and we can't move the files back" do
          before(:each) do
            allow(FileUtils).to receive(:mkdir_p).and_call_original
            allow(FileUtils).to receive(:mkdir_p).with(/#{source}/) do
              raise "can't move the files if we can't mkdir"
            end
          end

          it 'raises the error we gave it' do
            expect{ bagger.run }.to raise_error('carefully inserted error')
          end

          it "warns the user that it couldn't move the files" do
            expect do
              bagger.run
            rescue
            end.to output(/#{destination}/).to_stderr
          end
        end
      end
    end
  end
end

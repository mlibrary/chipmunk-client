
# frozen_string_literal: true

require "spec_helper"
require "chipmunk/bagger_cli"

RSpec.describe Chipmunk::Bagger do

  context "when make_bag fails" do

    class BrokenBagger < Chipmunk::Bagger
      def make_bag
        move_files_to_bag
        bag.manifest!
        raise 'injected error'
      end
    end

    let(:source) { "#{temporary_directory}/source" }
    let(:destination) { "#{temporary_directory}/destination" }
    let(:id) { "fake_id" }
    let(:temporary_directory) { "tmp_test_dir" }

    let(:bagger) do
      BrokenBagger.new(content_type: 'junk',
                       external_id: id,
                       src_path: source,
                       bag_path: destination)
    end

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


    it 'raises the error we gave it' do
      expect{ bagger.run }.to raise_error('injected error')
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
        expect { bagger.run }.to output.to_stderr.and raise_error('injected error')
      end

      it "warns the user that it couldn't move the files" do
        expect { bagger.run }.to raise_error.and output(/#{destination}/).to_stderr
      end
    end
  end
end

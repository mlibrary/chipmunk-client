require "spec_helper"
require "chipmunk/check/video"
require "chipmunk/status"

RSpec.describe Chipmunk::Check::Video do
  let(:shell) { double(:shell, run: Chipmunk::Status.success) }
  let(:external_id) { "external_id" }
  let(:src_path) { "src_path" }
  let(:bagger) { double(:bagger, external_id: external_id, src_path: src_path) }
  let(:check) { described_class.new(bagger, shell: shell) }

  describe "#check" do
    it "calls the script" do
      bin = Chipmunk.root/Chipmunk.config.validate.external.video
      expect(shell).to receive(:run)
        .with(a_string_matching(/^#{bin} #{external_id} #{src_path}/))
      check.run
    end

    context "when the script runs successfully" do
      let(:shell) { double(:shell, run: Chipmunk::Status.success) }

      it "returns no errors" do
        expect(check.run).to eql([])
      end
    end

    context "when the script runs unsuccessfully" do
      let(:errors) { "err1\nerr2\nerr3\n" }
      let(:shell) { double(:shell, run: Chipmunk::Status.failure(errors)) }

      it "returns an array of errors" do
        expect(check.run).to match_array(["err1", "err2", "err3"])
      end

    end
  end

end


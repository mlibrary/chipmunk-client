# frozen_string_literal: true

require "spec_helper"
require "chipmunk/bagger/video"

RSpec.describe Chipmunk::Bagger::Video do
  include_context "fixture data"
  let(:fixture_data) { good_data_path }
  let(:external_id) { "39015083611155" }
  let(:fake_uuid) { "fakeuuid" }
  let(:good_data_path) { fixture("video", "upload", "good", "data") }
  let(:bag_data) { File.join(@bag_path, "data") }
  let(:bagger) do
    described_class.new(
      content_type: 'video',
      external_id: external_id,
      src_path: @src_path,
      bag_path: @bag_path
    )
  end

  it_behaves_like "a bagger", "video"

  describe "#checks" do
    it do
      expect(bagger.checks.map{|check| check.class.to_s}).to contain_exactly(
        "Chipmunk::Check::BagExists",
        "Chipmunk::Check::Video",
        "Chipmunk::Check::ChipmunkInfo",
      )
    end
  end

  context "with stubbed Chipmunk::Bag" do
    include_context "stubbed Chipmunk::Bag"

    ["metadata.yaml", "miam-39015083611155-001.mov", "mipm-39015083611155-001.mov", "mitn-39015083611155-001_1.jpg",
     "mitn-39015083611155-001_2.jpg", "mitn-39015083611155-001_3.jpg", "mitn-39015083611155-001_4.jpg", "mitn-39015083611155-001_5.jpg"].each do |file|
       it "moves #{file} to the data dir" do
         expect(bag).to receive(:add_file_by_moving).with(file, File.join(@src_path, file))
         bagger.make_bag
       end
     end

    it "adds the expected metadata tags" do
      expect(bag).to receive(:write_chipmunk_info).with(
        "External-Identifier" => external_id,
        "Chipmunk-Content-Type" => "video",
        "Bag-ID" => fake_uuid
      )

      bagger.make_bag
    end
  end

end

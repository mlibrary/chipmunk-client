# frozen_string_literal: true

require "spec_helper"
require "chipmunk/bagger/video"

RSpec.describe Chipmunk::Bagger::Video do
  include_context "fixture data"
  let(:external_id) { "12345" }
  let(:fake_uuid) { "fakeuuid" }
  let(:good_data_path) { fixture("video", "upload", "good", "data") }
  let(:bag_data) { File.join(@bag_path, "data") }

  it_behaves_like "a bagger", "video"

  context "with stubbed Chipmunk::Bag" do
    include_context "stubbed Chipmunk::Bag"
    let(:fixture_data) { good_data_path }

    ["metadata.yaml", "miam0001.mov", "mipm0001.mov", "tn0001_1.jpg",
     "tn0001_2.jpg", "tn0001_3.jpg", "tn0001_4.jpg", "tn0001_5.jpg"].each do |file|
       it "moves #{file} to the data dir" do
         expect(bag).to receive(:add_file_by_moving).with(file, File.join(@src_path, file))
         make_bag("video")
       end
     end

    it "adds the expected metadata tags" do
      expect(bag).to receive(:write_chipmunk_info).with(
        "External-Identifier" => external_id,
        "Chipmunk-Content-Type" => "video",
        "Bag-ID" => fake_uuid
      )

      make_bag("video")
    end
  end

end

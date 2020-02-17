require "spec_helper"
require "chipmunk/check/os_metadata"

RSpec.describe Chipmunk::Check::OsMetadata do
  let(:bad_bagger)  { double('Bagger', bag_path: fixture("os_metadata")) }
  let(:good_bagger) { double('Bagger', bag_path: fixture("test_bag/data")) }

  it "rejects directories with OS/desktop metadata files" do
    check = described_class.new(bad_bagger)
    expect(check.run.first).to match(/must be removed/)
  end

  it "passes directories without OS/desktop metadata files" do
    check = described_class.new(good_bagger)
    expect(check.run).to be_empty
  end
end

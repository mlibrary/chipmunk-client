require "spec_helper"
require "chipmunk/config"
require "pathname"

RSpec.describe Chipmunk::Config do
  describe "#root" do
    it "returns the root path of the project" do
      expect(Chipmunk.root/"spec"/"chipmunk"/"config_spec.rb")
        .to eql(Pathname.new(__FILE__).expand_path)
    end
  end

  describe "#config" do
    it "loads the config" do
      expect(Chipmunk.config.validate.external.has_key?(:video)).to be true
    end
  end
end

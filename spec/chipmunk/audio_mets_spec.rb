# frozen_string_literal: true

require "spec_helper"
require "chipmunk/audio_mets"

RSpec.describe Chipmunk::AudioMETS do
  describe "#marcxml_url" do
    subject { described_class.new(File.open(mets_path)).marcxml_url }

    context "when mets.xml has a link to a marc record in mirlyn" do
      let(:mets_path) { fixture("audio", "upload", "good", "data", "mets.xml") }
      it { is_expected.to match(/^https:\/\/mirlyn.lib.umich.edu\/.*\.xml/) }
    end

    context "when mets.xml doesn't have a MARC record" do
      let(:mets_path) { fixture("audio", "mets-nomarc.xml") }
      it do
        expect { subject }.to raise_error(Chipmunk::MetadataError, /MARC/)
      end
    end

    context "when mets.xml links to a 'search' catalog record" do
      let(:mets_path) { fixture("audio", "mets-search.xml") }
      it "resolves to a mirlyn URL for marcxml" do
        expect(subject).to match(/^https:\/\/mirlyn.lib.umich.edu\/.*\.xml/)
      end
    end

    context "when MARC link isn't to mirlyn" do
      let(:mets_path) { fixture("audio", "mets-nonmirlyn.xml") }
      it do
        expect { subject }.to raise_error(Chipmunk::MetadataError,
          /does not match mirlyn/)
      end
    end
  end
end

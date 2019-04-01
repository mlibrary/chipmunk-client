# frozen_string_literal: true

require "spec_helper"
require "chipmunk/status_cli"

RSpec.describe Chipmunk::StatusCLI do
  let(:client_factory) { double(:factory) }

  describe "#initialize" do
    it "creates a client with the default config" do
      expect(client_factory).to receive(:new)
      described_class.new(%w[-i an_id], client_factory: client_factory)
    end

    it "accepts a -c option with an overriding config" do
      described_class.new(%w[-c spec/support/fixtures/other_config.yml -i foo])
      expect(Chipmunk.config.api_key).to eq("overriden_api_key")
    end
  end

  describe "#bags" do
    let(:bags) { described_class.new(args, client_factory: client_factory).bags }
    let(:client_factory) { double(:client_factory, new: client) }
    let(:client) { double(:client) }
    let(:argf) { nil }

    before(:each) do
      allow(ARGF).to receive(:read).and_return(argf) unless argf.nil?
    end

    context "when given no stdin and no arguments" do
      let(:args) { [] }

      it("has no tested behavior but I expect it will hang") { }
    end

    context "when given `-i id`" do
      let(:args) { %w[-i id] }

      it { expect(bags).to eq %w[id] }

      context 'with stdin of "another id\n"' do
        let(:argf) { "another id\n" }

        it { expect(bags).to eq %w[id] }
      end
    end

    context "when given `-i id1 -i id2`" do
      let(:args) { %w[-i id1 -i id2] }

      it { expect(bags).to eq %w[id1 id2] }
    end

    context "when given ``" do
      let(:args) { [] }
      let(:argf) { "id1\nid2\n" }

      it "reads from ARGF line by line" do
        expect(bags).to eq %w[id1 id2]
      end

      context "and ARGF contains no ids" do
        let(:argf) { '' }

        it { expect{ bags }.to raise_error(ArgumentError) }
      end

      context "and ARGF has ids and a blank line" do
        let(:argf) { "id 1\nid 2\n\nid 3\n" }

        it "ignores the blank line" do
          expect(bags).to eq ["id 1", "id 2", "id 3"]
        end
      end
    end

    context "when given `-i cli_id path_to_file`" do
      let(:args) { %w[-i cli_id path_to_file] }
      let(:argf) { "file_id" }

      it "reads the `-i` id as well as checking ARGF" do
        expect(bags).to eq %w[cli_id file_id]
      end
    end
  end

  describe "#run" do
    let(:run) { described_class.new(args, client_factory: client_factory).run }
    let(:client_factory) { double(:client_factory, new: client) }
    let(:client) { double(:client, get: bag_hash) }
    let(:bag_hash) { {} }
    let(:bags) { %w[bag1 bag2] }

    let(:args) do
      [].tap do |a|
        bags.each do |bag|
          a << '-i'
          a << bag
        end
      end
    end

    it "queries /v1/bags/id for each bag" do
      bags.each do |bag|
        expect(client).to receive(:get).with("/v1/bags/#{bag}")
      end

      run
    end

    context 'when the id 404s' do
      let(:bags) { ['bad_bag'] }
      let(:bag_hash) { { 'status' => 404, 'error' => 'Not Found' } }

      it "outputs not_found" do
        expect{ run }.to output(/bad_bag\tnot_found/).to_stdout
      end
    end

    context 'when the bag is stored' do
      let(:bags) { ['existing_bag'] }
      let(:bag_hash) { { 'stored' => true } }

      it "outputs done" do
        expect{ run }.to output(/existing_bag\tdone/).to_stdout
      end
    end

    context 'when the bag is not stored' do
      let(:bags) { ['known_bag'] }
      let(:bag_hash) { { 'stored' => false } }

      it "outputs not_stored" do
        expect{ run }.to output(/known_bag\tnot_stored/).to_stdout
      end
    end
  end
end

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

        it "should exit 1 and output usage and the error to stderr" do
          status = 0

          expect do
            bags
          rescue SystemExit => e
            status = e.status
          end.to output(/Usage:.*ArgumentError/m).to_stderr

          expect(status).to eq 1
        end
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

    context "when given `path_to_a_file_that_does_not_exist`" do
      let(:args) { ['path_to_a_file_that_does_not_exist'] }

      before(:each) do
        allow(ARGF).to receive(:read).and_raise(Errno::ENOENT.new(
          "No such file or directory @ rb_sysopen - #{args[0]}"
        ))
      end

      it "should exit 1 and output usage and the error to stderr" do
        status = 0

        expect do
          bags
        rescue SystemExit => e
          status = e.status
        end.to output(/Usage:.*Errno::ENOENT.*#{args[0]}/m).to_stderr

        expect(status).to eq 1
      end
    end
  end

  describe "#run" do
    let(:run) { described_class.new(args, client_factory: client_factory).run }
    let(:client_factory) { double(:client_factory, new: client) }
    let(:client) { double(:client) }
    let(:bag_hash) { {} }
    let(:bags) { %w[bag1 bag2] }
    let(:queue_array) { [] }

    let(:args) do
      [].tap do |a|
        bags.each do |bag|
          a << '-i'
          a << bag
        end
      end
    end

    before(:each) do
      allow(client).to receive(:get).with(%r{^/v1/bags})
                                    .and_return(bag_hash)
      allow(client).to receive(:get).with(%r{^/v1/queue})
                                    .and_return(queue_array)
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

      it 'queries /v1/queue?package=known_bag' do
        expect(client).to receive(:get).with('/v1/queue?package=known_bag')
        run
      end

      context 'when there are no queue objects' do
        let(:queue_array) { [] }

        it "outputs not_loaded" do
          expect{ run }.to output(/known_bag\tnot_loaded/).to_stdout
        end
      end

      context 'when the only queue object is pending' do
        let(:queue_array) { [{ "status" => "PENDING" }] }

        it "outputs pending" do
          expect{ run }.to output(/known_bag\tpending/).to_stdout
        end
      end

      context 'when the only queue object is done' do
        let(:queue_array) { [{ "status" => "DONE" }] }

        it "outputs storing" do
          expect{ run }.to output(/known_bag\tstoring/).to_stdout
        end
      end

      context 'when the only queue object is failed' do
        let(:queue_array) { [{ "status" => "FAILED", "error" => "error\tmessage" }] }

        it "outputs failed with error message" do
          expect{ run }.to output(/known_bag\tfailed: "error\\tmessage"/).to_stdout
        end
      end

      context 'when the only queue object has an unrecognized status' do
        let(:queue_array) { [{ "status" => "something new and weird" }] }

        it "outputs unrecognized_status with status" do
          # My thinking here is that, should new statuses ever be added
          # for any reason, this will make it easy to debug.
          expect{ run }.to output(/known_bag\tunrecognized_status: "something new and weird"/).to_stdout
        end
      end

      context "there's a newer pending object and an older failed object" do
        let(:queue_array) do
          [
            {
              "updated_at" => "2019-01-01 16:00:00 UTC",
              "status" => "FAILED",
              "error" => "problem",
            },

            {
              "updated_at" => "2019-01-01 17:00:00 UTC",
              "status" => "PENDING",
            },
          ]
        end

        it "only cares about the newer one" do
          expect{ run }.to output(/known_bag\tpending/).to_stdout
        end
      end

      context "there's an older pending object and a newer failed object" do
        let(:queue_array) do
          [
            {
              "updated_at" => "2019-01-01 18:00:00 UTC",
              "status" => "FAILED",
              "error" => "problem",
            },

            {
              "updated_at" => "2019-01-01 17:00:00 UTC",
              "status" => "PENDING",
            },
          ]
        end

        it "only cares about the newer one" do
          expect{ run }.to output(/known_bag\tfailed/).to_stdout
        end
      end

      context "there are five failed queues" do
        let(:queue_array) do
          [
            {
              "updated_at" => "2019-01-01 10:00:00 UTC",
              "status" => "FAILED",
              "error" => "first",
            },

            {
              "updated_at" => "2019-01-02 10:00:00 UTC",
              "status" => "FAILED",
              "error" => "second",
            },

            {
              "updated_at" => "2019-01-03 10:00:00 UTC",
              "status" => "FAILED",
              "error" => "third",
            },

            {
              "updated_at" => "2019-01-04 10:00:00 UTC",
              "status" => "FAILED",
              "error" => "fourth",
            },

            {
              "updated_at" => "2019-01-05 10:00:00 UTC",
              "status" => "FAILED",
              "error" => "fifth",
            },
          ]
        end

        it "only cares about the newest one" do
          expect{ run }.to output(/known_bag\tfailed: "fifth"/).to_stdout
        end
      end

      context "two failed queues have different timezones" do
        let(:queue_array) do
          [
            {
              "updated_at" => "2019-01-01 10:00:00 UTC",
              "status" => "FAILED",
              "error" => "first",
            },

            {
              "updated_at" => "2019-01-01 08:00:00 EDT",
              "status" => "FAILED",
              "error" => "second",
            },
          ]
        end

        it "accounts for the timezone when comparing" do
          expect{ run }.to output(/known_bag\tfailed: "second"/).to_stdout
        end
      end
    end
  end
end

# frozen_string_literal: true

require "optparse"
require "chipmunk/client"
require "chipmunk"

module Chipmunk
  class StatusCLI
    attr_reader :bags

    def initialize(args, client_factory: Client)
      parse_options(args)
      @client = client_factory.new
    end

    def run
      bags.each do |bag|
        output_bag_status(bag)
      end
    end

    private

    attr_reader :client, :config

    USAGE = "Usage: #{$PROGRAM_NAME} [options] [id_file1] [id_file2...]"

    def parse_options(args)
      @bags = []

      OptionParser.new do |opts|
        opts.banner = USAGE

        opts.on("-c CONFIG", "--config", "Configuration file") do |c|
          Chipmunk.add_config(c)
        end

        opts.on("-i ID", "--id", "External volume id") do |id|
          @bags << id
        end
      end.parse!(args)

      read_bags_from_argf if bags.empty? || ! args.empty?

      raise ArgumentError, USAGE if bags.empty?
    end

    def read_bags_from_argf
      @bags += ARGF.read
                   .lines
                   .map{ |l| l.strip }
                   .delete_if{ |l| l.empty? }
    end

    def output_bag_status(bag)
      response = client.get("/v1/bags/#{bag}")

      if response.has_key? 'stored'
        if response['stored']
          puts "#{bag}\tdone"
        else
          puts "#{bag}\tnot_stored"
        end
      else
        puts "#{bag}\tnot_found"
      end
    end
  end
end

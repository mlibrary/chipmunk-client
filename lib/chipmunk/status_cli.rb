# frozen_string_literal: true

require "optparse"
require "json"
require "date"
require "chipmunk/client"
require "chipmunk"

module Chipmunk
  class StatusCLI
    attr_reader :bags

    def initialize(args, client_factory: Client)
      validate_options(args)
      @client = client_factory.new
    end

    def run
      bags.each do |bag|
        puts "#{bag}\t#{status(bag)}"
      end
    end

    private

    attr_reader :client, :config

    USAGE = "Usage: #{$PROGRAM_NAME} [-h] [-c CONFIG] [-i ID]... [FILE]..."
    SUMMARY = "Get the status for each package id in each file"

    PARAMETER_HELP = <<~HELP
      When FILE is '-', read standard input. With no FILE or ID, read '-'.
    HELP

    GENERAL_HELP = <<~HELP
      Output will be two columns, separated by tabs. Column 1 will
      contain the bag id; column 2, the status. Here are all the
      statuses this could return:

          done:       This is valid, stored, and accessible.
          storing:    This is valid and processed but not yet stored.
          pending:    This is loaded but not yet processed.
          failed:     This is loaded, and it failed to process.
          not_loaded: I know the id, but you haven't loaded the bag yet.
          not_found:  You haven't told me about this yet.

      Some of these (e.g. 'failed') may have additional relevant
      messages. If they do, they'll come afterward wrapped in a json
      string. For example output might look like this:

          $ ingest_status -i id1 -i id2 -i id3 -i id4
          id1     done
          id2     done
          id3     failed: "A helpful error message from the server"
          id4     pending
    HELP

    def validate_options(args)
      parse_options(args)
    rescue StandardError => error
      error_out(error)
    end

    def error_out(error)
      warn USAGE
      warn "#{$PROGRAM_NAME}: error: #{error.class} #{error}"
      exit 1
    end

    def parse_options(args)
      @bags = []
      option_parser.parse!(args)
      read_bags_from_argf if bags.empty? || args.size > 0
      raise ArgumentError.new('expected at least 1 bag id') if bags.empty?
    end

    def read_bags_from_argf
      @bags += ARGF.read.lines.map{ |l| l.strip }.delete_if{ |l| l.empty? }
    rescue Interrupt
      # If the user ctrl-Cs during this read, it's probably because this
      # script is hanging, which is probably because the user forgot to
      # provide any input of any kind. In that case, such hanging is
      # expected. While not a great UX, we can at least improve it by
      # not punishing the user with a ruby stack trace.
      warn USAGE
      exit 130
    end

    def option_parser
      OptionParser.new do |opts|
        add_topmost_help(opts)
        add_optional_parameters(opts)
        add_parameter_help(opts)
      end
    end

    def add_topmost_help(opts)
      opts.banner = USAGE
      opts.separator SUMMARY
    end

    def add_parameter_help(opts)
      opts.separator ""
      opts.separator PARAMETER_HELP
      opts.separator ""
      opts.separator GENERAL_HELP
    end

    def add_optional_parameters(opts)
      opts.separator ""
      opts.separator "Optional parameters:"

      add_help_parameter(opts)
      add_config_parameter(opts)
      add_id_parameter(opts)
    end

    def add_help_parameter(opts)
      opts.on("-h", "--help", "Display this message and exit") do
        puts opts
        exit
      end
    end

    def add_config_parameter(opts)
      opts.on("-c CONFIG", "--config", "Configuration file") do |c|
        Chipmunk.add_config(c)
      end
    end

    def add_id_parameter(opts)
      opts.on("-i ID", "--id", "External volume id") do |id|
        bags << id
      end
    end

    def status(bag)
      BagStatus.new(client, bag)
    end
  end

  private

  class BagStatus
    def initialize(client, bag)
      @client = client
      @bag = bag
    end

    def to_s
      status_message
    end

    private

    attr_reader :client, :bag

    def status_message
      if bag_is_found?
        status_of_found_bag
      else
        "not_found"
      end
    end

    def status_of_found_bag
      if bag_is_stored?
        "done"
      else
        status_of_known_but_unstored_bag
      end
    end

    def status_of_known_but_unstored_bag
      if bag_has_never_been_loaded?
        "not_loaded"
      else
        status_of_queued_but_unstored_bag
      end
    end

    def status_of_queued_but_unstored_bag
      case latest_queue_object['status']
      when 'PENDING'
        "pending"
      when 'DONE'
        "storing"
      when 'FAILED'
        "failed: #{latest_queue_object['error'].to_json}"
      else
        "unrecognized_status: #{latest_queue_object['status'].to_json}"
      end
    end

    def bag_is_found?
      v1_bags_response.has_key? 'stored'
    end

    def bag_is_stored?
      v1_bags_response['stored'] == true
    end

    def bag_has_never_been_loaded?
      v1_queue_response.empty?
    end

    def v1_bags_response
      @v1_bags_response ||= client.get("/v1/bags/#{bag}")
    rescue RestClient::Exception => e
      @v1_bags_response = JSON.parse("#{e.response}")
    end

    def latest_queue_object
      @latest_queue_object ||= v1_queue_response.reduce do |x, y|
        DateTime.parse(x["updated_at"]) > DateTime.parse(y["updated_at"]) ? x : y
      end
    end

    def v1_queue_response
      @v1_queue_response ||= client.get("/v1/queue?package=#{bag}")
    end
  end
end

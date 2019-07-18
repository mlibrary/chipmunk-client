# frozen_string_literal: true

require "open3"
require "chipmunk/status"

module Chipmunk
  module Shell

    # A basic shell
    class Basic

      # Run the given command
      # @param command [String] The command to run
      # @param message [String] Optional message to be displayed. When this is not provided,
      #   the full command is displayed.
      # @return [Status]
      def run(command, message = nil)
        stdout, stderr, status = Open3.capture3(command)
        Status.new(status.success?, stdout, stderr)
      end
    end

  end
end

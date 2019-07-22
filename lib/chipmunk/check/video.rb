require "chipmunk/config"
require "chipmunk/check/base"
require "chipmunk/shell/basic"

module Chipmunk
  module Check

    # Validate the video files using the lightweight video validation script
    class Video < Base

      def initialize(bagger, shell: Shell::Basic.new)
        super(bagger)
        @shell = shell
      end

      def check
        status = shell.run(cmd)
        unless status.success?
          status.error.split("\n")
        end
      end

      private

      attr_reader :shell

      def bin
        @bin ||= Chipmunk.root/Chipmunk.config.validate.external.video
      end

      def cmd
        "#{bin} #{bagger.external_id} #{bagger.src_path}"
      end

    end
  end
end

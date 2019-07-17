require "chipmunk/check/base"

module Chipmunk
  module Check

    # A check to avoid overwriting an existing bag
    class BagExists < Base
      def initialize(bagger)
        @bagger = bagger
      end

      def check
        if src_path && File.exist?(bag_path)
          "Source path specified and #{bag_path} already exists; won't overwrite"
        end
      end

      private

      attr_reader :bagger

      def src_path
        bagger.src_path
      end

      def bag_path
        File.join(bagger.bag_path, "data")
      end

    end
  end
end

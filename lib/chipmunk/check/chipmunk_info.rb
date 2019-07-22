require "chipmunk/check/base"

module Chipmunk
  module Check

    # A check to avoid overwriting an existing chipmunk-info.txt file
    class ChipmunkInfo < Base
      def check
        if File.exist?(path)
          "chipmunk-info.txt already exists, won't overwrite"
        end
      end

      private

      def path
        File.join(bagger.bag_path, "chipmunk-info.txt")
      end

    end
  end
end

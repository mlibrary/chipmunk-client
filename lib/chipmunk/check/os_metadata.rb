require "chipmunk/check/base"

module Chipmunk
  module Check

    # A check for any straggling Thumbs.db, .DS_Store files, etc.
    class OsMetadata < Base
      def check
        os_files = Dir.glob("**/{Thumbs.db,.DS_Store,._*}", base: bagger.bag_path)
        if os_files.any?
          "The following desktop metadata files are present and must be removed: #{os_files}"
        end
      end
    end
  end
end

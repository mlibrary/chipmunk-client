# frozen_string_literal: true

require "find"
require "chipmunk/bagger"
require "chipmunk/check/video"

module Chipmunk
  class Bagger::Video < Bagger

    def initialize(content_type:, external_id:, bag_path:, src_path: nil)
      super(
        content_type: content_type,
        external_id: external_id,
        bag_path: bag_path,
        src_path: src_path
      )
    end

    # Moves data from src_path to bag_path/data, adds metadata, and generates
    # appropriate manifests
    def make_bag
      move_files_to_bag
      bag.write_chipmunk_info(common_tags)
      bag.manifest!
    end

    def checks
      super + [Check::Video.new(self)]
    end

  end
end

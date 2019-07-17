# frozen_string_literal: true

require "securerandom"
require "chipmunk/bag"

module Chipmunk
  class Bagger::Digital < Bagger

    def initialize(external_id:, bag_path:, src_path: nil)
      super(
        content_type: "digital",
        external_id: external_id,
        bag_path: bag_path,
        src_path: src_path
      )
    end

    # validates the bag at bag_path, adds chipmunk_info.txt, and updates the
    # manifest.
    def make_bag
      unless bag.valid?
        raise "Error validating bag:\n" + bag.errors.full_messages.join("\n")
      end

      bag.write_chipmunk_info(common_tags)
      bag.manifest!
    end

  end
end

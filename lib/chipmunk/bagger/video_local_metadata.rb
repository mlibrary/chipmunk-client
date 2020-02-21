# frozen_string_literal: true

require "chipmunk/bagger"
require "chipmunk/bagger/with_local_metadata"

module Chipmunk
  class Bagger::VideoLocalMetadata < Bagger::WithLocalMetadata
    def checks
      super + [Check::Video.new(self)]
    end
  end
end

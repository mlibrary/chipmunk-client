# frozen_string_literal: true

module Chipmunk
  class BagRsyncer
    def initialize(bag_path)
      @bag_path = bag_path.chomp("/")
    end

    def upload(dest)
      raise "rsync failed" unless
      system("rsync", "-rtvzP", "--delete", "--no-group",
             "--no-perms", "--chmod=ugo=rwX", "#{bag_path}/", dest)
    end

    private

    attr_accessor :bag_path
  end
end

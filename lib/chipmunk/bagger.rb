# frozen_string_literal: true

require "securerandom"
require "chipmunk/bag"
require "chipmunk/check/bag_exists"
require "chipmunk/check/chipmunk_info"

module Chipmunk
  class Bagger

    attr_accessor :content_type, :external_id, :bag_path
    attr_reader :src_path

    def initialize(content_type:, external_id:, bag_path:, src_path: nil)
      @content_type = content_type
      @external_id = external_id
      @bag_path = bag_path
      @src_path = File.join(src_path, "") if src_path
      @files = []
    end

    def run
      check_bag
      make_bag
    rescue
      move_files_out_of_bag
      raise
    end

    def check_bag
      errors = checks
        .map(&:run)
        .flatten
      raise RuntimeError, errors.join("\n") unless errors.empty?
    end

    def move_files_out_of_bag
      FileUtils.mkdir_p src_path
      @files.each do |relative_path, src_path|
        path = File.join(bag.data_dir, relative_path)
        FileUtils.mv path, src_path
      end
    rescue
      warn "Some of your files may still be in #{bag.data_dir}"
    end

    protected

    attr_writer :src_path

    def bag
      @bag ||= Bag.new bag_path
    end

    def common_tags
      {
        "External-Identifier"   => external_id,
        "Chipmunk-Content-Type" => content_type,
        "Bag-ID"                => bag_id
      }
    end

    def move_files_to_bag
      return unless src_path

      Find.find(src_path) do |file_to_add|
        # directories will automatically be created in the bag based on the files
        # added, so we don't need to explicitly add them to the bag
        next if File.directory?(file_to_add)

        # relative_path is the destination path within the bag (relative to data)
        # file_to_add is a resolvable path on disk to an actual file.
        relative_path = remove_prefix(src_path, file_to_add)
        bag.add_file_by_moving(relative_path, file_to_add)
        @files << [relative_path, file_to_add]
      end

      FileUtils.rmdir src_path if Dir.empty?(src_path)
    end

    def checks
      [
        Check::ChipmunkInfo.new(self),
        Check::BagExists.new(self)
      ]
    end

    private

    def remove_prefix(_prefix, file)
      file.sub(/^#{src_path}/, "")
    end

    def bag_id
      @bag_id ||= SecureRandom.uuid
    end

  end
end

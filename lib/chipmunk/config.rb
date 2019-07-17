require "pathname"
require "ettin"

module Chipmunk
  module Config
    def reset_config
      @config = nil
    end

    def root
      @root ||= Pathname.new(__dir__).parent.parent
    end

    def config
      @config_files ||= default_config_files
      @config ||= Ettin.for(@config_files)
    end

    def default_config_files
      Ettin.settings_files(root/"config", env)
    end

    def env
      @env ||= ENV["RACK_ENV"] || ENV["RAILS_ENV"] || ENV["CHIPMUNK_ENV"] || "development"
    end

    attr_writer :env

    def add_config(c)
      @config_files ||= default_config_files
      @config_files << c
    end
  end
end

Chipmunk.extend(Chipmunk::Config)

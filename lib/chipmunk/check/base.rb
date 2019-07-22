module Chipmunk
  module Check

    class Base
      def initialize(bagger)
        @bagger = bagger
      end

      def run
        [check].compact.flatten(1)
      end

      def check
        raise NotImplementedError
      end

      private

      attr_reader :bagger
    end

  end
end

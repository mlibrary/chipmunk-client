#!/bin/bash

if [ "$RUN_INTEGRATION" == "1" ]; then
  exec bin/validate_video.pl "$@"
else
  exit 0
fi

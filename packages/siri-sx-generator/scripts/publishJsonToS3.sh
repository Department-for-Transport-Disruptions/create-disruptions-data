#!/usr/bin/env bash

### Get the project root directory
cdd_root_folder_path=$(git rev-parse --show-toplevel)

stage_name=$(cat ${cdd_root_folder_path}/.sst/stage)

cd $cdd_root_folder_path/packages/siri-sx-generator

npm run s3-publish-json $stage_name
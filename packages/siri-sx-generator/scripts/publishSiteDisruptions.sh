#!/usr/bin/env bash

### Get the project root directory
cdd_root_folder_path=$(git rev-parse --show-toplevel)

stage_name=$(cat ${cdd_root_folder_path}/.sst/stage)
num_disruptions=$1

cd $cdd_root_folder_path/packages/siri-sx-generator

pnpm run dynamo-publish-site-disruptions $stage_name $num_disruptions
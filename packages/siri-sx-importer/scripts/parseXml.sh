#!/usr/bin/env bash

### Get the project root directory
cdd_root_folder_path=$(git rev-parse --show-toplevel)

cd $cdd_root_folder_path/packages/siri-sx-importer

npm run parse-xml
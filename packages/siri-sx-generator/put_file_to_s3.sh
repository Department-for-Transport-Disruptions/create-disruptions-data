#!/usr/bin/env bash

set -e

FILE_NAME=$1
BUCKET_NAME=$2
BUCKET_KEY=$3

aws s3 cp $FILE_NAME s3://$BUCKET_NAME/$BUCKET_KEY
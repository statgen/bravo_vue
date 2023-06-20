#!/usr/bin/env bash

# Script to facilitate manually deploying UI to staging or production.
#   Expected to be run after either `npm run build` or `npm run build_staging`. 
#   Copies files from dist/ directory to S3 bucket backing cloudfront dist.

# Get BUCKET_NAME from terraform output of bravo infrastructure provisioning.
PROFILE="${PROFILE:=statgen}"
BUCKET_NAME="$1"
S3BUCKET="s3://${BUCKET_NAME}"

if [ -z "$1" ]
then
  echo "Need to supply BUCKET_NAME as first argument"
  echo "Expectect usage:"
  echo "  ./push_to_s3.sh example_pet_vue_site"
fi

# Push all files to bucket
aws --profile ${PROFILE} s3 cp --recursive dist/ ${S3BUCKET}

# The following was to update the metadata for endpoints without .html
# Is required if building an app that doesn't have .html on the endpoints.
#   e.g. dist/variant instead of dist/variant.html
# Push files without extension and add metadata to inform content type
#   Required to be served out of CDN as html.

# for file in `fdfind -d 1 -t file -E '*.*' '.*' dist/`
# do
#   aws --profile ${PROFILE} s3 cp ${file} ${S3BUCKET} --content-type "text/html"
# done

#!/bin/bash

# exit when any command fails
set -e

gcloud config set project $PROJECT_ID
echo -n $OPENAI_API_KEY | gcloud secrets create openai-api-key --data-file=-

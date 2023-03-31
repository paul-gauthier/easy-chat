#!/bin/bash

# exit when any command fails
set -e

gcloud run deploy cloud-proxy \
  --image gcr.io/${PROJECT_ID}/cloud-proxy:latest \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars SECRET_PROJECT_ID=${PROJECT_ID},SECRET_NAME=openai-api-key,SECRET_VERSION=latest

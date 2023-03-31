#!/bin/bash

# exit when any command fails
set -e

docker build -t gcr.io/${PROJECT_ID}/cloud-proxy:latest .
docker push gcr.io/${PROJECT_ID}/cloud-proxy:latest

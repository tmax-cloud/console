#!/usr/bin/env bash

set -e

# This script pushes the docker image to Dockerhub "tmaxcloudck" repository

if [ -z "${DOCKER_TAG}" ]; then
    echo "Please provide DOCKER_TAG env var and try again."
    exit 1
fi

DOCKER_IMAGE=tmaxcloudck/hypercloud-console:${DOCKER_TAG}

docker build --rm=true -t "${DOCKER_IMAGE}" - < Dockerfile-jenkins
# docker tag DOCKER_IMAGE tmaxcloudck/hypercloud-console:latest
docker push "${DOCKER_IMAGE}"

echo "Pushed ${DOCKER_IMAGE}"
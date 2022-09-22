#!/usr/bin/env bash

set -e 
DOCKER_REGISTRY="docker.io"
DOCKER_IMAGE="tmaxcloudck/hypercloud-console"
MAJOR_VERSION="5"
MINOR_VERSION="2"
PATCH_VERSION="0"
HOTFIX_VERSION="0"

#build docker image 
docker build --rm=true -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION} -f ./Dockerfile .

docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION}

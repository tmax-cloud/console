#!/usr/bin/env bash

set -e 
DOCKER_REGISTRY="tmaxcloudck"
PRODUCT="hypercloud-console"
MAJOR_VERSION="gs"
MINOR_VERSION="1"
PATCH_VERSION="0"
HOTFIX_VERSION="4"

#build docker image 
docker build --rm=true -t ${DOCKER_REGISTRY}/${PRODUCT}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION} -f ./Dockerfile .

docker push ${DOCKER_REGISTRY}/${PRODUCT}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION}

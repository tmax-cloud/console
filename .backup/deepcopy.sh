#!/usr/bin/env bash
set -e

deepcopy-gen -v 2 -h boilerplate.txt --bounding-dirs . -i console/pkg/api/v1 -O generated_deepcopy

mv console/pkg/api/v1/generated_deepcopy.go ./pkg/api/v1

rm -rf console
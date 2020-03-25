#!/usr/bin/env bash

set -e

./script-release/build-backend-release.sh
./script-release/build-frontend-release.sh

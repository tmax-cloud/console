#!/usr/bin/env bash

set -e

pushd frontend
yarn install
yarn run exclude-ts-linux
yarn run build-linux

# download latest swagger file
curl -k --location --request GET 'https://192.168.6.196:6443/openapi/v2' --header 'Accept: application/json' --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiY2x1c3Rlci1hZG1pbiIsInRva2VuSWQiOiJ3b29AdG1heC5jby5rciIsImlzcyI6IlRtYXgtUHJvQXV0aC1XZWJIb29rIiwiaWQiOiJhZG1pbkB0bWF4LmNvLmtyIiwiZXhwIjoxNzQzMzAxNDM1fQ.ls9Cj1BX4NPJ3XxxHwcrGDzveaaqsauMo5L4e5BfUnE' > ../swagger/autocomplete--swagger.json
cp ../swagger/autocomplete--swagger.json ./public/dist/assets/

popd
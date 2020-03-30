#!/usr/bin/env bash

set -e

pushd frontend
yarn install
yarn run build

# download latest swagger file
curl -k --location --request GET 'https://192.168.6.196:6443/openapi/v2' --header 'Accept: application/json' --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUbWF4LVByb0F1dGgtV2ViSG9vayIsImlkIjoid3ltaW4tdG1heC5jby5rciIsImV4cCI6MTU4MzEyMTQ5M30.hjvrlaLDFuSjchJKarGKbuWOuafhsuCQgBDo-pqsZvg' > ../swagger/autocomplete--swagger.json
cp ../swagger/autocomplete--swagger.json ./public/dist/assets/

popd
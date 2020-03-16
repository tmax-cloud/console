#!/bin/bash -e

./bin/bridge \
    --listen=http://192.168.8.25:9000 \
    --base-address=http://192.168.8.25:9000 \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint=https://192.168.6.196:6443 \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --k8s-auth=bearer-token \
    --k8s-auth-bearer-token=@@ \
    --public-dir=./frontend/public/dist
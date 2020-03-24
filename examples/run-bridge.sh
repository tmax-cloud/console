#!/bin/bash -e

./bin/bridge \
    --listen=https://192.168.8.25:9000 \
    --base-address=https://192.168.8.25:9000 \
    --tls-cert-file=tls/tls.crt \
    --tls-key-file=tls/tls.key \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint=https://192.168.6.196:6443 \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --k8s-auth=bearer-token \
    --k8s-auth-bearer-token=@@ \
    --public-dir=./frontend/public/dist \
    --login-endpoint=http://192.168.6.211:28677/login \
    --logout-endpoint=http://192.168.6.211:28677/logout \
    --openapi-endpoint=https://192.168.6.196:6443/openapi \
    --prometheus-endpoint=http://192.168.6.215:9090/api \
    --release-mode=true \
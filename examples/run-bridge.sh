#!/bin/bash -e

### proxy endpoint들의 node port 정보를 받아오려면 아래 주석처리된 두 줄을 차례로 실행하세요.
# : <<'END'
# ssh root@192.168.6.196
# PORT_ARR=($(kubectl get svc -A | grep -E "hypercloud4-operator-service|prometheus-k8s|grafana|kiali|tracing" | grep -v "kiali-operator" | awk '{print $6}' | awk 'match($0, /:.*\//){print substr($0,RSTART+1,RLENGTH-2)}')); printf "\n\n\nhypercloud_port = ${PORT_ARR[0]}\nkiali_port = ${PORT_ARR[1]}\njaeger_port = ${PORT_ARR[2]}\ngrafana_port = ${PORT_ARR[3]}\nprometheus_port = ${PORT_ARR[4]}\n\n\n\n\n"; exit
# END

./bin/bridge \
    --listen=https://192.168.0.191:9000 \
    --base-address=https://192.168.0.191:9000 \
    --tls-cert-file=tls/tls.crt \
    --tls-key-file=tls/tls.key \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint=https://192.168.6.196:6443 \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --k8s-auth=bearer-token \
    --k8s-auth-bearer-token=@@ \
    --public-dir=./frontend/public/dist \
    --hypercloud-endpoint=http://192.168.6.211:28677 \
    --kiali-endpoint=http://192.168.6.196:30197/api/kiali \
    --jaeger-endpoint=http://192.168.6.197:30573/api/jaeger \
    --grafana-endpoint=http://192.168.6.196:31527 \
    --prometheus-endpoint=http://192.168.6.196:30562/api \
    --release-mode=true \
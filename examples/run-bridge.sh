#!/bin/bash -e

myIP=$(ipconfig | grep "IPv4" -a | head -1 | awk '{print $NF}')
k8sIP='192.168.6.196'

### proxy endpoint들의 node port 정보를 받아오려면, 터미널에서 아래의 주석 두 줄을 차례로 실행하세요.
: <<'END'
ssh root@$k8sIP
printf "\n\n\n"; kubectl get svc -A | grep -E "hypercloud4-operator-service|prometheus-k8s|grafana|kiali|tracing" | grep ":" | awk -F '\t' -v OFS='\t' '{ result=gensub(/[0-9]+:([0-9]+)\/TCP/,"\\1", "g", $0); print result}' | awk '{print $1,$2,$6}' | column -t; printf "\n\n\n"; exit
END

./bin/bridge \
    --listen=https://$myIP:9000 \
    --base-address=https://$myIP:9000 \
    --tls-cert-file=tls/tls.crt \
    --tls-key-file=tls/tls.key \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint=https://$k8sIP:6443 \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --k8s-auth=bearer-token \
    --k8s-auth-bearer-token=@@ \
    --public-dir=./frontend/public/dist \
    --hypercloud-endpoint=http://$k8sIP:31092 \
    --kiali-endpoint=http://$k8sIP:30197/api/kiali \
    --jaeger-endpoint=http://$k8sIP:30573/api/jaeger \
    --grafana-endpoint=http://$k8sIP:31527 \
    --prometheus-endpoint=http://$k8sIP:30562/api \
    --release-mode=true \
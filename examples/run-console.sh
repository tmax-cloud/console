#!/usr/bin/env bash
set -exuo pipefail
myIP=$(hostname -I | awk '{print $1}')
# myIP=$(ipconfig getifaddr en0)
# Default K8S Endpoint is public POC environment
# k8sIP='220.90.208.100'
# k8sIP='172.22.6.2'
# k8sIP='172.23.4.201'
# k8sIP='192.168.6.171'
k8sIP='192.168.9.189'
# BRIDGE_K8S_AUTH_BEARER_TOKEN=$(ssh root@$k8sIP "secretname=\$(kubectl get serviceaccount console-system-admin --namespace=console-system -o jsonpath='{.secrets[0].name}'); kubectl get secret "\$secretname" --namespace=console-system -o template --template='{{.data.token}}' | base64 --decode; ")
#BRIDGE_K8S_AUTH_BEARER_TOKEN=$(ssh root@$k8sIP "secretname=\$(kubectl get serviceaccount default --namespace=kube-system -o jsonpath='{.secrets[0].name}'); kubectl get secret "\$secretname" --namespace=kube-system -o template --template='{{.data.token}}' | base64 --decode; ")
# Should verify port number which corresponding to Service in yourself!!
# kubectl get svc -n monitoring prometheus-k8s
PROM_PORT='30569'
# kubectl get svc -n monitoring grafana
GRAFANA_PORT='3000'
# kubectl get svc -n hypercloud5-system hypercloud5-api-server-service
HC_PORT='32369'
MHC_PORT='32369'
WEBHOOK_PORT='32369'
# kubectl get svc -n efk opendistro-kibana
KIBANA_PORT='32496'
# kubectl get ingress -n istio-system
KIALI='kiali.istio-system.172.21.4.152.nip.io'
# kubectl get svc -n istio-system ingressgateway  (kubectl get gateway -n kubeflow로 어떤 포트를 이용하는지 정확히 확인)
KUBEFLOW_IP='192.168.9.141'
# KUBEFLOW_PORT='80'
./bin/console server \
    --listen=https://$myIP:9000\
    --base-address=https://$myIP:9000 \
    --dynamic-file=./configs/dynamic-config.yaml \
    --tls-cert-file=tls/tls.crt \
    --tls-key-file=tls/tls.key \
    --redirect-port=8080 \
    --keycloak-realm=tmax \
    --keycloak-auth-url=https://hyperauth.org/auth \
    --keycloak-client-id=hypercloud5 \
    --k8s-endpoint=https://$k8sIP:6443 \
    --bearer-token="eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYYjBuTlgwUXh6ZWttZlVmd09zVXBsX0R5dUlLcjh3UnhLcFpTeVpxTjNzIn0.eyJleHAiOjE2MzU1MjI3ODcsImlhdCI6MTYzNTQ4Njc4NywiYXV0aF90aW1lIjoxNjM1NDg2NzM5LCJqdGkiOiIzZmY2YTI4MC0yM2M2LTQ2NmMtOGNiZi03NTZhNjVhZWZlMTciLCJpc3MiOiJodHRwczovL2h5cGVyYXV0aC5vcmcvYXV0aC9yZWFsbXMvdG1heCIsImF1ZCI6ImNrLWludGVncmF0aW9uLWh5cGVyY2xvdWQ1Iiwic3ViIjoiMmQ3ZWZiYTktMTgyMC00MDc5LWJmMzUtYmJhMTRhNzk4OWNjIiwidHlwIjoiSUQiLCJhenAiOiJjay1pbnRlZ3JhdGlvbi1oeXBlcmNsb3VkNSIsIm5vbmNlIjoiYzJmZDUzMzUtODdmNS00YjE2LWFjNmMtYjNlNDE5YmU2ODMwIiwic2Vzc2lvbl9zdGF0ZSI6IjJjZjBmMzY5LTNkNDMtNGJiNy05M2UyLTkxOTgwZTBiZDQ0YyIsImF0X2hhc2giOiJzaHVNeDRaTllrSWZYdm9uTlBDc1RBIiwiYWNyIjoiMCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJ1c2VyX25hbWUiOiLsmrDtg5zqsbQiLCJuYW1lIjoiYWRtaW4gYWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbkB0bWF4LmNvLmtyIiwibG9jYWxlIjoia28iLCJnaXZlbl9uYW1lIjoiYWRtaW4iLCJmYW1pbHlfbmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0bWF4LmNvLmtyIiwiZ3JvdXAiOlsiaHlwZXJjbG91ZDUiXX0.WDgnKupuiLlz-uA1H5ll0_dJugd0lYxqmTjX6vYijHLKs9U4gu9Z7CPbYSZQzI-s_rHWFnt8Mf4HSkm40HYfq75qWsJWM-yhIoYR7GnrrBxOBbISw7OD8krBjqz_XEcvfaWh2jCWA8NPj-5uvo80yd3bQ6ajJrXs3Ew5ejrbjXueLZhw8hsW3l_Bq4JiuI13rLO0oxi4X3jb8FRUVDjHdqOerMM9b-ZYi3zxgaF-iMDZCi98qQBdRRx3AOeEEzbuTaSeyF79OpQgLgYbPMbIUOiaJSn7qfBrTCCQo3ANDFarf-nOeAlkI-ISuVBVTcYWz6Aufj9TQQYQeQqRhbJHnw" \
    --hypercloud-endpoint=https://$k8sIP:$HC_PORT/ \
    --multi-hypercloud-endpoint=https://$k8sIP:$MHC_PORT/ \
    --webhook-endpoint=https://$k8sIP:$WEBHOOK_PORT/ \
    --prometheus-endpoint=http://$k8sIP:$PROM_PORT/api \
    --alertmanager-endpoint=http://$k8sIP:$PROM_PORT/api \
    --grafana-endpoint=http://$k8sIP:$GRAFANA_PORT/api/grafana/ \
    --kiali-endpoint=https://$KIALI/api/kiali \
    --kibana-endpoint=https://$k8sIP:$KIBANA_PORT/api/kibana/ \
    --kubeflow-endpoint=http://$KUBEFLOW_IP/api/kubeflow/ \
    --mc-mode=true \
    --public-dir=./frontend/public/dist \
    --managed-gitlab-url=http://gitlab-test-deploy.ck1-2.192.168.6.151.nip.io/ \
    # --k8s-mode-off-cluster-skip-verify-tls=true \
    # --release-mode=true \
    # --release-mode=false \
    # --k8s-mode=off-cluster \
    # --k8s-mode-off-cluster-endpoint=https://$k8sIP:6443 \
    # --k8s-mode-off-cluster-skip-verify-tls=true \
    # --k8s-auth-bearer-token=${BRIDGE_K8S_AUTH_BEARER_TOKEN} \
    # --k8s-mode-off-cluster-prometheus=http://$k8sIP:$PROM_PORT/api  \
    # --k8s-mode-off-cluster-thanos=http://$k8sIP:$PROM_PORT/api \
    # --user-auth=hypercloud \
    # --k8s-auth=hypercloud \
    # # --mc-mode-operator=true \
    # # --k8s-auth=bearer-token \
    # # --mc-mode-file="$HOME/dynamic-config.yaml" \
    # --config="./configs/console.yaml"
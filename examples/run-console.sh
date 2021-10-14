#!/usr/bin/env bash

set -exuo pipefail

# myIP=$(hostname -I | awk '{print $1}')
myIP=$(ipconfig getifaddr en0)
# Default K8S Endpoint is public POC environment 
# k8sIP='220.90.208.100'
# k8sIP='172.22.6.2'
# k8sIP='172.23.4.201'
# k8sIP='192.168.6.171'
k8sIP='192.168.9.194'

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
    --listen=https://$myIP:9001 \
    --base-address=https://$myIP:9001 \
    --dynamic-file=./configs/dynamic-config.yaml \
    --tls-cert-file=tls/tls.crt \
    --tls-key-file=tls/tls.key \
    --redirect-port=8080 \
    --keycloak-realm=tmax \
    --keycloak-auth-url=https://hyperauth.org/auth \
    --keycloak-client-id=ck-integration-hypercloud5 \
    --k8s-endpoint=https://$k8sIP:6443 \
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
    # --release-mode=true \

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
    
    

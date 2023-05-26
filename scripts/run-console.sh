#!/usr/bin/env bash

set -exuo pipefail

myIP=$(hostname -I | awk '{print $1}')
# myIP=$(ipconfig getifaddr en0)
# myIP=localhost
## Default K8S Endpoint is public POC environment
# k8sIP='220.90.208.100'
# k8sIP='172.22.6.2'
# k8sIP='172.23.4.201'
# k8sIP='192.168.6.171'
k8sIP='192.168.9.189'

HYPERAUTH_URL='hyperauth.tmaxcloud.org'
REALM='tmax'
CLIENT_ID='hypercloud5'
# GET id_token
read -p "HyperAuth Admin ID : " admin_id
read -sp "HyperAuth Admin Password : " admin_password
echo ""
TOKEN=$(curl -k -s --insecure "https://$HYPERAUTH_URL/auth/realms/tmax/protocol/openid-connect/token" \
  -d grant_type=password \
  -d response_type=id_token \
  -d scope=openid \
  -d client_id=$CLIENT_ID \
  -d username="$admin_id" \
  -d password="$admin_password")
ERROR=$(echo "$TOKEN" | jq .error -r)
if [ "$ERROR" != "null" ];then
  echo "[$(date)][ERROR]  $TOKEN" >&2
  exit 1
fi
id_token=$(echo $TOKEN | jq .id_token -r)
echo $id_token
#
./bin/console \
  --listen=https://$myIP:9000 \
  --base-address=https://$myIP:9000 \
  --cert-file=./tls/tls.crt \
  --key-file=./tls/tls.key \
  --public-dir="./frontend/public/dist" \
  --keycloak-auth-url=https://hyperauth.tmaxcloud.org/auth \
  --keycloak-client-id=hypercloud5 \
  --keycloak-realm=tmax \
  --mc-mode=true \
  --chatbot-embed=true \
  --custom-product-name="hypercloud" \
  --svc-type="LoadBalancer" \
  --k8s-public-endpoint=https://$k8sIP:6443 \
  --k8s-auth-bearer-token="$id_token" \
  --log-type="pretty" \
  --log-level="trace"
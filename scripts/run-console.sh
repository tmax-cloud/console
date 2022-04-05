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
read -p "Enter the hyperauth admin ID : " admin_id
read -sp "Enter the $admin_id : " admin_password
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
    --servingInfo.listen=https://$myIP:9000 \
    --servingInfo.baseAddress=https://$myIP:9000 \
    --servingInfo.redirectPort=9001 \
    --servingInfo.certFile=./tls/tls.crt \
    --servingInfo.keyFile=./tls/tls.key \
    --app.keycloakRealm=tmax \
    --app.keycloakAuthUrl=https://hyperauth.tmaxcloud.org/auth \
    --app.keycloakClientId=hypercloud5 \
    --app.mcMode=false \
    --app.publicDir=./frontend/public/dist \
    --app.customProductName="hypercloud" \
    --clusterInfo.kubeAPIServerURL=https://$k8sIP:6443 \
    --clusterInfo.kubeToken="$id_token" \
    # --public-dir=/opt/bridge/static \
    # --listen=http://0.0.0.0:31303 \
    # --base-address=http://0.0.0.0:31303 \
    # --keycloak-realm=test \
    # --keycloak-auth-url=https://test/auth \
    # --keycloak-client-id=test \
    # --mc-mode=true \
    # --custom-product-name=test \
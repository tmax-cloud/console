#!/bin/bash -e

k8sIP='172.22.6.2'

myIP=$(ipconfig | grep "IPv4" -a | head -1 | awk '{print $NF}')


### k8s 환경에 ssh 최초 접속 시 다음 두 줄을 실행해주세요. 그러면 다음부터 password 없이 login할 수 있습니다.
### ssh-keygen을 실행하면 파일명과 passphrase를 입력하라고 뜨는데, empty로 놔두고 Enter를 눌러 진행하면 됩니다.

# ssh-keygen
# ssh-copy-id -i ~/.ssh/id_rsa.pub root@$k8sIP


nodePorts=$(ssh root@$k8sIP "
    HC_PORT=\$(kubectl get svc -n hypercloud4-system hypercloud4-operator-service | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    PROM_PORT=\$(kubectl get svc -n monitoring prometheus-k8s | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    GRAFANA_PORT=\$(kubectl get svc -n monitoring grafana | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    KIALI_PORT=\$(kubectl get svc -n istio-system kiali | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    JAEGER_PORT=\$(kubectl get svc -n istio-system tracing | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    APPROVAL_PORT=\$(kubectl get svc -n approval-system approval-proxy-server | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    VNC_PORT=\$(kubectl get svc -n kubevirt virtvnc | awk '{print \$5}' | awk 'match(\$0, /:[0-9]+\//){print substr(\$0,RSTART+1,RLENGTH-2)}');
    echo \"HC_PORT=\$HC_PORT PROM_PORT=\$PROM_PORT GRAFANA_PORT=\$GRAFANA_PORT KIALI_PORT=\$KIALI_PORT JAEGER_PORT=\$JAEGER_PORT APPROVAL_PORT=\$APPROVAL_PORT VNC_PORT=\$VNC_PORT;\"
")

eval $nodePorts
KUBEFLOW_IP=172.22.1.11
KUBEFLOW_PORT=80

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
    --hypercloud-endpoint=http://$k8sIP:$HC_PORT \
    --prometheus-endpoint=http://$k8sIP:$PROM_PORT/api \
    --grafana-endpoint=http://$k8sIP:$GRAFANA_PORT \
    --kiali-endpoint=http://$k8sIP:$KIALI_PORT/api/kiali \
    --jaeger-endpoint=http://$k8sIP:$JAEGER_PORT/api/jaeger \
    --approval-endpoint=http://$k8sIP:$APPROVAL_PORT/approve \
    --kubeflow-endpoint=http://$KUBEFLOW_IP:$KUBEFLOW_PORT \
    --vnc-endpoint=http://$k8sIP:$VNC_PORT \
    --hyperauth-endpoint=http://0.0.0.0:8080 \
    --keycloak-realm=tmax \
    --keycloak-auth-url=https://172.22.6.11/auth \
    --keycloak-client-id=hypercloud4 \
    --release-mode=true \
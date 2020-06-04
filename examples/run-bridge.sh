#!/bin/bash -e

./bin/bridge \
    --listen=https://192.168.8.25:9000 \
    --base-address=https://192.168.8.25:9000 \
    --tls-cert-file=tls/tls.crt \
    --tls-key-file=tls/tls.key \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint=https://192.168.6.145:6443 \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --k8s-auth=bearer-token \
    --k8s-auth-bearer-token=@@ \
    --public-dir=./frontend/public/dist \
    --hypercloud-endpoint=http://192.168.6.149:28677 \
    --prometheus-endpoint=http://192.168.6.149:9090/api \
    --release-mode=true \
    --master-token=eyJhbGciOiJSUzI1NiIsImtpZCI6ImpkRVkxc3pLV1VWT1VIY3BJTjVCLXJ4anJnQmhJOU1DZjBwWWQtdVpRRXcifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJoeXBlcmNsb3VkNC1zeXN0ZW0iLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoiaHlwZXJjbG91ZDQtYWRtaW4tdG9rZW4tZ2t0cDciLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiaHlwZXJjbG91ZDQtYWRtaW4iLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJjMTM4MzlhZS02ZmYyLTQ0OTAtOGFiYi0wZDdlYjg1NGYxMjAiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6aHlwZXJjbG91ZDQtc3lzdGVtOmh5cGVyY2xvdWQ0LWFkbWluIn0.PEjvZN-jTfAsE6XBc4K04u_G40h2XlDcI1chqRb1tVduoJwEGeuTYhuhi1qryTU1clR1Y5zspptdrr5XyHtcKCSybArTo6ImMsngZicPJ-naq6kYgnPtzLkF0HHlFHUKUO8SZR3BRE4tsYeZzpan0hY93TgHn53IWTslLO-jo_tU-R92sHwydWq7tV35Rp14eUdqFq1OVJbxRJLcFJ3o-RJkyIvj70r90KJwPWvVr_eHgMKpkjm38eZM7Izk-MFUJrX7Ua-YfQf3LGp23h7d3BXDSrF4vCYU9Bfrmont4Fs1sANAahYyfh9dffARqp4u9CaDJzQZDCRqw-rE5f7eyA


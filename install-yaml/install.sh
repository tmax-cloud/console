#!/usr/bin/env bash

NAME_HC4="hypercloud4-operator-service"
NAME_PROM="prometheus-k8s"
NAME_GRAFANA='grafana'
NAME_KIALI='kiali'
NAME_JAEGER='tracing'

file_initialization="./1.initialization.yaml"
file_initialization_temp="./1.initialization-temp.yaml"
file_svc_lb="./2.svc-lb.yaml"
file_svc_lb_temp="./2.svc-lb-temp.yaml"
file_svc_np="./2.svc-np.yaml"
file_svc_np_temp="./2.svc-np-temp.yaml"
file_deployment_pod="./3.deployment-pod.yaml"
file_deployment_pod_temp="./3.deployment-pod-temp.yaml"

echo "==============================================================="
echo "STEP 1. ENV Setting"
echo "==============================================================="

if [ -z $RE_INITIALIZE ]; then
    RE_INITIALIZE=true
fi
echo "RE_INITIALIZE = ${RE_INITIALIZE}"

if [ -z $RE_CREATE_SECRET ]; then
    RE_CREATE_SECRET=true
fi
echo "RE_CREATE_SECRET = ${RE_CREATE_SECRET}"

if [ -z $RE_CREATE_LB_SERVICE ]; then
    RE_CREATE_LB_SERVICE=true
fi
echo "RE_CREATE_LB_SERVICE = ${RE_CREATE_LB_SERVICE}"

if [ -z $RE_CREATE_NP_SERVICE ]; then
    RE_CREATE_NP_SERVICE=true
fi
echo "RE_CREATE_NP_SERVICE = ${RE_CREATE_NP_SERVICE}"

if [ -z $RE_CREATE_DEPLOYMENT_POD ]; then
    RE_CREATE_DEPLOYMENT_POD=true
fi
echo "RE_CREATE_DEPLOYMENT_POD = ${RE_CREATE_DEPLOYMENT_POD}"

# name of the namespace
if [ -z $NAME_NS ]; then
    echo -e "Enter the name of the namespace."
    read NAME_NS
fi
echo "NAME_NS = ${NAME_NS}"

# name of the namespace
if [ -z "${PORTAL_URL+set}" ]; then
    echo -e "Enter the portal URL. (only if HDC mode / otherwise leave blank)"
    read PORTAL_URL
fi
echo "PORTAL_URL = ${PORTAL_URL}"

# node port
if [ -z "${NODE_PORT}" ]; then
    echo -e "Enter the node port number."
    read NODE_PORT
fi
echo "NODE_PORT = ${NODE_PORT}"

# docker image tag (console version)
if [ -z $CONSOLE_VERSION ]; then
    echo -e "Enter the console version."
    read CONSOLE_VERSION
fi
echo "CONSOLE_VERSION = ${CONSOLE_VERSION}"

# get hypercloud ip addr 
HC4_IP=$(kubectl get svc -A | grep ${NAME_HC4} | awk '{print $4}')
HC4_PORT=$(kubectl get svc -A | grep ${NAME_HC4} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')

if [ -z $HC4_IP ]; then 
    echo "Cannot find HC4_IP in ${NAME_HC4}. Is hypercloud4-system installed?"
    exit 1 
fi 
HC4=${HC4_IP}:${HC4_PORT}
echo "Hypercloud Addr = ${HC4}"

# get prometheus ip addr 
PROM_IP=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $4}')
PROM_PORT=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')
if [ -z $PROM_IP ]; then 
    echo "Cannot find PROMETHEUS_IP in ${NAME_PROM}. Is prometheus installed?"
    PROM_IP="0.0.0.0:9090"
    echo "PROMETHEUS_IP dummy value temporarily set to 0.0.0.0:9090."
fi 
PROM=${PROM_IP}:${PROM_PORT}
echo "Prometheus Addr = ${PROM}"

# get grafana ip addr 
GRAFANA_IP=$(kubectl get svc -A | grep ${NAME_GRAFANA} | awk '{print $4}')
GRAFANA_PORT=$(kubectl get svc -A | grep ${NAME_GRAFANA} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')
if [ -z $GRAFANA_IP ]; then
    echo "Cannot find GRAFANA_IP in ${NAME_GRAFANA}. Is grafana installed?"
    GRAFANA_IP="0.0.0.0:3000"
    echo "GRAFANA_IP dummy value temporarily set to 0.0.0.0:3000."
fi
GRAFANA=${GRAFANA_IP}:${GRAFANA_PORT}
echo "grafana Addr = ${GRAFANA}"

# get kiali ip addr 
KIALI_IP=$(kubectl get svc -A | grep ${NAME_KIALI} | grep -v "operator" | awk '{print $4}')
KIALI_PORT=$(kubectl get svc -A | grep ${NAME_KIALI} | grep -v "operator" | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')
if [ -z $KIALI_IP ]; then
    echo "Cannot find KIALI_IP in ${NAME_KIALI}. Is kiali installed?"
    KIALI_IP="0.0.0.0:20001"
    echo "KIALI_IP dummy value temporarily set to 0.0.0.0:20001."
fi
KIALI=${KIALI_IP}:${KIALI_PORT}
echo "kiali Addr = ${KIALI}/api/kiali"

# get jaeger ip addr 
JAEGER_IP=$(kubectl get svc -A | grep ${NAME_JAEGER} | awk '{print $4}')
JAEGER_PORT=$(kubectl get svc -A | grep ${NAME_JAEGER} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')
if [ -z $JAEGER_IP ]; then
    echo "Cannot find JAEGER_IP in ${NAME_JAEGER}. Is jaeger installed?"
    JAEGER_IP="0.0.0.0:80"
    echo "JAEGER_IP dummy value temporarily set to 0.0.0.0:80."
fi
JAEGER=${JAEGER_IP}:${JAEGER_PORT}
echo "Jaeger Addr = ${JAEGER}"

# inject ENV into yaml
cp $file_initialization $file_initialization_temp
cp $file_svc_lb $file_svc_lb_temp
cp $file_svc_np $file_svc_np_temp
cp $file_deployment_pod $file_deployment_pod_temp

sed -i "s%@@NAME_NS@@%${NAME_NS}%g" ${file_initialization_temp}
sed -i "s%@@NAME_NS@@%${NAME_NS}%g" ${file_svc_lb_temp}

sed -i "s%@@NAME_NS@@%${NAME_NS}%g" ${file_svc_np_temp}
sed -i "s%@@NODE_PORT@@%${NODE_PORT}%g" ${file_svc_np_temp}

sed -i "s%@@NAME_NS@@%${NAME_NS}%g" ${file_deployment_pod_temp}
sed -i "s%@@HC4@@%${HC4}%g" ${file_deployment_pod_temp}
sed -i "s%@@PROM@@%${PROM}%g" ${file_deployment_pod_temp}
sed -i "s%@@GRAFANA@@%${GRAFANA}%g" ${file_deployment_pod_temp}
sed -i "s%@@KIALI@@%${KIALI}%g" ${file_deployment_pod_temp}
sed -i "s%@@VER@@%${CONSOLE_VERSION}%g" ${file_deployment_pod_temp}

if [ -z "$PORTAL_URL" ]; then
    sed -i '/--hdc-mode=/d' ${file_deployment_pod_temp}
    sed -i '/--tmaxcloud-portal=/d' ${file_deployment_pod_temp}
else
    sed -i "s%@@HDC_FLAG@@%true%g" ${file_deployment_pod_temp}
    sed -i "s%@@PORTAL@@%${PORTAL_URL}%g" ${file_deployment_pod_temp}
fi

echo ""
echo "$file_initialization_temp"
echo "---------------------------------------------------------------"
cat $file_initialization_temp
echo ""
echo "---------------------------------------------------------------"
echo ""

echo ""
echo "$file_svc_lb_temp"
echo "---------------------------------------------------------------"
cat $file_svc_lb_temp
echo ""
echo "---------------------------------------------------------------"
echo ""

echo ""
echo "$file_svc_np_temp"
echo "---------------------------------------------------------------"
cat $file_svc_np_temp
echo ""
echo "---------------------------------------------------------------"
echo ""

echo ""
echo "$file_deployment_pod_temp"
echo "---------------------------------------------------------------"
cat $file_deployment_pod_temp
echo ""
echo "---------------------------------------------------------------"
echo ""

echo "==============================================================="
echo "STEP 2. Install console"
echo "==============================================================="

# Create Namespace
if [ $RE_INITIALIZE = true ]; then
    kubectl delete -f ${file_initialization_temp}
    kubectl create -f ${file_initialization_temp}
fi
# if [ -z $(kubectl get ns | grep ${NAME_NS} | awk '{print $1}') ]; then 
#     kubectl create -f ${file_initialization_temp}
# else
#     echo "namespace exist"
#     kubectl get ns 
# fi 
echo ""

# Create Secret to enable https between browser and console-server
if [ $RE_CREATE_SECRET = true ]; then
    kubectl delete secret console-https-secret -n ${NAME_NS}
    kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n ${NAME_NS}
fi
# if [ -z $(kubectl get secret -n ${NAME_NS} | grep console-https-secret | awk '{print $1}') ]; then 
#     kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n ${NAME_NS}
# else
#     echo "secret exists" 
#     kubectl get secret console-https-secret -n ${NAME_NS}
# fi 
echo ""

# Create Service 
if [ $RE_CREATE_LB_SERVICE = true ]; then
    kubectl delete -f ${file_svc_lb_temp}
    kubectl create -f ${file_svc_lb_temp}
fi
if [ $RE_CREATE_NP_SERVICE = true ]; then
    kubectl delete -f ${file_svc_np_temp}
    kubectl create -f ${file_svc_np_temp}
fi
# if [ -z $(kubectl get svc -n ${NAME_NS} | grep console-lb | awk '{print $1}') ]; then 
#     kubectl create -f ${file_svc_lb_temp}
# else
#     echo "LoadBalancer service exists" 
# fi
# echo ""
# if [ -z $(kubectl get svc -n ${NAME_NS} | grep console-np | awk '{print $1}') ]; then 
#     kubectl create -f ${file_svc_np_temp}
# else
#     echo "NodePort service exists" 
# fi
# kubectl get svc -n ${NAME_NS} 
echo ""

# Create Deployment
if [ $RE_CREATE_DEPLOYMENT_POD = true ]; then
    kubectl delete -f ${file_deployment_pod_temp}
    kubectl create -f ${file_deployment_pod_temp}
fi
# if [ -z $(kubectl get deployment -n ${NAME_NS} | grep console | awk '{print $1}') ]; then
#     kubectl create -f ${file_deployment_pod_temp}
# else
#     echo "deployment exists" 
#     kubectl get deployment -n ${NAME_NS}
# fi 
echo ""

echo "==============================================================="
echo "STEP 3. Is Console-pod Running??"
echo "==============================================================="
count=0
stop=60 
while :
do
    sleep 1
    count=$(($count+1))
    echo "Waiting for $count sec(s)..."
    kubectl get po -n ${NAME_NS}
    RUNNING_FLAG=$(kubectl get po -n ${NAME_NS} | grep console | awk '{print $3}')
    if [ ${RUNNING_FLAG} == "Running" ]; then
        echo "Console has been successfully deployed."
        rm -rf ${file_initialization_temp}
        rm -rf ${file_svc_lb_temp}
        rm -rf ${file_svc_np_temp}
        rm -rf ${file_deployment_pod_temp}
        break 
    fi
    if [ $count -eq $stop ]; then 
        echo "It seems that something went wrong! Check the log."
        kubectl logs -n ${NAME_NS} $(kubectl get po -n ${NAME_NS} | grep console | awk '{print $1}') 
        break
    fi
done
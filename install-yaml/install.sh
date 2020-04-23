#!/usr/bin/env bash
NAME_HC4="hypercloud4-operator-service"
NAME_PROM="prometheus-k8s"
file_initialzation="./1.initialization.yaml"
file_initialzation_temp="./1.initialization-temp.yaml"
file_svc_lb="./2.svc-lb.yaml"
file_svc_lb_temp="./2.svc-lb-temp.yaml"
file_svc_np="./2.svc-np.yaml"
file_svc_np_temp="./2.svc-np-temp.yaml"
file_deployment_pod="./3.deployment-pod.yaml"
file_deployment_pod_temp="./3.deployment-pod-temp.yaml"

echo "==============================================================="
echo "STEP 1. ENV Setting"
echo "==============================================================="

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
HC4=$HC4_IP":"$HC4_PORT
echo "Hypercloud Addr = ${HC4}"

# get prometheus ip addr 
PROM_IP=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $4}')
PROM_PORT=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $6}' | awk 'match($0, ":"){print substr($0,1,RSTART-1)}')
if [ -z $PROM_IP ]; then 
    echo "Cannot find PROMETHEUS_IP in ${NAME_PROM}. Is prometheus installed?"
    exit 1 
fi 
PROM=$PROM_IP":"$PROM_PORT
echo "Prometheus Addr = ${PROM}"

# inject ENV into yaml
cp $file_initialzation $file_initialzation_temp
cp $file_svc_lb $file_svc_lb_temp
cp $file_svc_np $file_svc_np_temp
cp $file_deployment_pod $file_deployment_pod_temp

sed -i "s/@@NAME_NS@@/${NAME_NS}/g" ${file_initialzation_temp}
sed -i "s/@@NAME_NS@@/${NAME_NS}/g" ${file_svc_lb_temp}
sed -i "s/@@NAME_NS@@/${NAME_NS}/g" ${file_svc_np_temp}

sed -i "s/@@NAME_NS@@/${NAME_NS}/g" ${file_deployment_pod_temp}
sed -i "s/@@HC4@@/${HC4}/g" ${file_deployment_pod_temp}
sed -i "s/@@PROM@@/${PROM}/g" ${file_deployment_pod_temp}
sed -i "s/@@VER@@/${CONSOLE_VERSION}/g" ${file_deployment_pod_temp}

if [ -z $PORTAL_URL ]; then
    sed -i '/--hdc-mode=/d' ${file_deployment_pod_temp}
    sed -i '/--tmaxcloud-portal=/d' ${file_deployment_pod_temp}
else
    sed -i "s/@@PORTAL@@/${PORTAL_URL}/g" ${file_deployment_pod_temp}
fi

echo "==============================================================="
echo "STEP 2. Install console"
echo "==============================================================="

# Create Namespace
if [ -z $(kubectl get ns | grep ${NAME_NS} | awk '{print $1}') ]; then 
    kubectl create -f ${file_initialzation_temp}
else
    echo "namespace exist"
    kubectl get ns 
fi 
echo ""

# Create Secret to enable https between browser and console-server
if [ -z $(kubectl get secret -n ${NAME_NS} | grep console-https-secret | awk '{print $1}') ]; then 
    kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n ${NAME_NS}
else
    echo "secret exists" 
    kubectl get secret console-https-secret -n ${NAME_NS}
fi 
echo ""

# Create Service 
if [ -z $(kubectl get svc -n ${NAME_NS} | grep console-lb | awk '{print $1}') ]; then 
    kubectl create -f ${file_svc_lb_temp}
else
    echo "LoadBalancer service exists" 
fi
echo ""
if [ -z $(kubectl get svc -n ${NAME_NS} | grep console-np | awk '{print $1}') ]; then 
    kubectl create -f ${file_svc_np_temp}
else
    echo "NodePort service exists" 
fi
kubectl get svc -n ${NAME_NS} 
echo ""

# Create Deployment
kubectl create -f ${file_deployment_pod_temp}
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
        rm -rf ${file_initialzation_temp}
        rm -rf ${file_svc_lb_temp}
        rm -rf ${file_svc_np_temp}
        rm -rf ${file_deployment_pod_temp}
        echo "Console has been successfully deployed."
        break 
    fi
    if [ $count -eq $stop ]; then 
        echo "It seems that something went wrong! Check the log."
        kubectl logs -n ${NAME_NS} $(kubectl get po -n ${NAME_NS} | grep console | awk '{print $1}') 
        break
    fi
done
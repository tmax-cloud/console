#!/bin/bash

NAME_HC4="hypercloud4-operator-service"
NAME_PROM="prometheus-k8s"
AUTH_PORT="28677"
PROM_PORT="9090"
file_initialzation="./1.initialization.yaml"
file_hypercloud_ui_pod="./2.hypercloud-ui-pod.yaml"
file_ui_pod_temp="./2.hypercloud-ui-pod-temp.yaml"
file_hypercloud_ui_svc="./3.hypercloud-ui-svc.yaml"

echo "==============================================================="
echo "STEP 1. ENV Setting"
echo "==============================================================="
# Enter docker tag (console version) 
echo -e "Enter the console version (default latest):"
read version
CONSOLE_VERSION=$version
if [ ${CONSOLE_VERSION}=="" ]; then 
    echo "CONSOLE_VERSION=latest"
else
    echo "CONSOLE_VERSION=${CONSOLE_VERSION} " 
fi 
# auth ip addr 
AUTH_IP=$(kubectl get svc -A | grep ${NAME_HC4} | awk '{print $5}')
if [ -z $AUTH_IP ]; then 
    echo "Do not exist AUTH in ${NAME_HC4} on k8s Cluster. Make sure hypercloud4-system is installed. "
    exit 1 
fi 
# prometheus ip addr 
PROM_IP=$(kubectl get svc -A | grep ${NAME_PROM} | awk '{print $5}')
if [ -z $PROM_IP ]; then 
    echo "Do not exist PROMETHEUS_IP in ${NAME_PROM} on k8s Cluster. Make sure prometheus is installed. "
    exit 1 
fi 
# put AUTH, PROM, TAG into 2.hypercloud_ui_pod_temp.yaml
cp $file_hypercloud_ui_pod $file_ui_pod_temp
AUTH=$AUTH_IP":"$AUTH_PORT
PROM=$PROM_IP":"$PROM_PORT
echo "Auth Addr = ${AUTH}"
echo "Prometheus Addr = ${PROM}"
echo "" 
sed -i "s/@@AUTH@@/${AUTH}/g" ${file_ui_pod_temp}
sed -i "s/@@PROM@@/${PROM}/g" ${file_ui_pod_temp}
sed -i "s/@@TAG@@/${CONSOLE_VERSION}/g" ${file_ui_pod_temp}


echo "==============================================================="
echo "STEP 2. Install console"
echo "==============================================================="
# create  namespace
if [ -z $(kubectl get ns | grep console-system | awk '{print $1}') ]; then 
    kubectl create -f ${file_initialzation}
else
    echo "namespace exist"
    kubectl get ns 
fi 
echo ""
# create  secret to enable https comm between browser and console-server
if [ -z $(kubectl get secret -n console-system | grep console-https-secret | awk '{print $1}') ]; then 
    kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n console-system
else
    echo "secret exist" 
    kubectl get secret console-https-secret -n console-system
fi 
echo ""
# create deployment
if [ -z $(kubectl get deployment -n console-system | grep console | awk '{print $1}') ]; then 
    kubectl create -f ${file_ui_pod_temp}
else
    echo "deployment exist" 
    kubectl get deployment -n console-system
fi 
echo ""
# Create Service 
if [ -z $(kubectl get svc -n console-system | grep console | awk '{print $1}') ]; then 
    kubectl create -f ${file_hypercloud_ui_svc}
else
    echo "service exist" 
    kubectl get svc -n console-system 
fi
echo ""

echo "==============================================================="
echo "STEP 3. Console-pod is Running??"
echo "==============================================================="
count=0
stop=40 
while :
do 
    count=$(($count+1))
    echo "wait for $count sec"
    RUNNING_FLAG=$(kubectl get po -n console-system | grep console | awk '{print $3}')
    if [ ${RUNNING_FLAG} == "Running" ]; then
        echo "Consol is well deployed in console-system"
        # rm -rf ${file_ui_pod_temp}
        break 
    fi
    if [ $count -eq $stop ]; then 
        echo "Pod has a problem"
        echo "Please check the logs" 
        kubectl logs -n console-system $(kubectl get po -n console-system | grep console | awk '{print $1}') 
        break  
    fi
    kubectl get po -n console-system 
    sleep 1
done 
echo "Console installation complete"

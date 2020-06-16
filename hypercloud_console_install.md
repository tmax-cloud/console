# HyperCloud Console 설치 가이드라인
hypercloud-console:1.1.25.2부터 적용되는 가이드입니다.<br>
최근 업데이트: ***2020/06/05***

### !!! IP Range Validation을 테스트하기 위해서는 Load Balancer 서비스와 LoadBalancer Public IP를 사용해야 합니다. LB yaml의 spec에는 "externalTrafficPolicy: Local"이 추가되어야 하고, deployment yaml의 template spec에는 "serviceAccountName: @@NAME_NS@@-admin"가 추가되어야 합니다.


## 1. 서론 및 사전준비
- UI console 설치 과정은 다음과 같다.
  1. Namespace, Quota, Role 등 생성
  2. Secret 생성 (https 통신을 위함)
  3. Service 생성 (cluster 외부에서 접근하기 위함)
  4. Deploymenet, Pod 생성
  - install.sh를 사용하는 경우 2A를, 그렇지 않은 경우 2B를 따르면 된다.
- kubernetes master node의 아무 경로에 작업용 폴더를 생성하고, 다음 파일들을 위치시킨다.<br>
  파일 내용은 이 문서 최하단의 부록에 첨부되어 있고,<br>
  HyperCloud-ori 프로젝트의 hc-dev 또는 hc-release 브랜치의 install-yaml 폴더 안에도 있다.<br>
  최근 업데이트: ***2020/06/05***
  - `1.initialization.yaml` (필수)
  - `2.svc-lb.yaml` 또는 `2.svc-np.yaml` (적어도 하나 필수)
  - `3.deployment-pod.yaml` (필수)
  - `install.sh` (사내 테스트용 / yaml 파일들을 직접 이용하는 방법을 더 권장)
- 일반적 루틴 : 이미 설치를 완료한 적이 있고 Namespace/Secret/Service를 바꾸지 않아도 되는 경우, 아래의 작업만 하면 충분하다.
  - install.sh를 사용하는 경우
      - `kubectl delete -f 3.deployment-pod.yaml`
      - `RE_INITIALIZE=false RE_CREATE_SECRET=false RE_CREATE_LB_SERVICE=false RE_CREATE_NP_SERVICE=false RE_CREATE_DEPLOYMENT_POD=true ./install.sh`
  - install.sh를 사용하지 않는 경우
      - `kubectl delete -f 3.deployment-pod.yaml`
      - `vi 3.deployment-pod.yaml`
      - `kubectl create -f 3.deployment-pod.yaml`


## 2A. install.sh를 사용하는 자동설치 (사내 테스트용)
- 현재 작업 폴더(./)에 install.sh와 yaml 파일들이 있어야 하고, 그 하위의 tls 폴더(./tls/)에 tls.crt, tls.key가 있어야 한다.<br>
(없다면 2B-2의 초반 부분을 참고한다.)
- install.sh에 실행권한을 부여하고 실행한다. `chmod +x install.sh`, `./install.sh`
  - 실행 권한을 부여한 적이 있다면, `./install.sh`만 실행하면 된다.
  - RE_INITIALIZE, RE_CREATE_SECRET, RE_CREATE_LB_SERVICE, RE_CREATE_NP_SERVICE, RE_CREATE_DEPLOYMENT_POD 각각에 Boolean 값을 주면서 install.sh를 실행할 수도 있다. (default는 모두 true이다.)
- 출력되는 메시지에 따라 적절한 값들을 입력한다. 아래는 입력 값 예시이다.
  - `Enter the name of the namespace.` -> `console-system`
  - `Enter the portal URL. (only if HDC mode / otherwise leave blank)` -> skip, 또는 `https://portal.tmaxcloud.ck2`
  - `Enter the node port number.` -> `31304`
  - `Enter the console version.` -> `1.1.25.2`
- `Console has been successfully deployed.` 메시지를 기다린다.


## 2B. install.sh를 사용하지 않는 설치

#### 2B-1. Namespace, Quota, Role 등 생성
- 1.initialization.yaml의 @@NAME_NS@@ 문자열을 적절한 값으로 바꾼다.
- `kubectl create -f 1.initialization.yaml`을 실행한다.
  - 이미 완료한 적이 있고 설정을 바꿀 필요가 없다면 생략한다.
  - 설정을 바꿔야 한다면 `kubectl delete -f 1.initialization.yaml`를 먼저 실행한다.

#### 2B-2. Secret 생성
- tls 폴더 안에 다음 순서대로 tls.key와 tls.csr을 생성한다.
  1. create private key<br>
    `openssl genrsa -out tls.key 2048`
  2. create CSR(Certificate Signing Request)<br>
    `openssl req -new -key tls.key -out tls.csr`
  3. create Certification using key, csr<br>
    `openssl x509 -req -days 3650 -in tls.csr -signkey tls.key -out tls.crt`
- tls 폴더의 부모 위치로 이동한 다음, tls.key와 tls.csr을 이용해 secret을 생성한다.<br>
  `kubectl create secret tls console-https-secret --cert=./tls/tls.crt --key=./tls/tls.key -n console-system`
- 이미 완료한 적이 있고 바꿀 필요가 없다면 생략한다.

#### 2B-3. Service 생성
- 2.svc-lb.yaml, 2.svc-np.yaml의 @@NAME_NS@@, @@NODE_PORT@@ 문자열을 적절한 값으로 바꾼다.
- `kubectl create -f 2.svc-lb.yaml` 또는 `kubectl create -f 2.svc-np.yaml`을 실행한다. (둘 다 해도 무방)
  - 이미 완료한 적이 있고 설정을 바꿀 필요가 없다면 생략한다.
  - 설정을 바꿔야 한다면 `kubectl delete -f 2.xxxxxxxx.yaml`를 먼저 실행한다.

#### 2B-4. Deployment, Pod 생성
- `vi 3.deployment-pod.yaml`으로 yaml 파일에 필수값들을 기입한다.
  - @@HC4@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -A | grep hypercloud4-operator-service` 명령어로 확인 가능
    - 예: `10.96.57.147:28677` 또는 `192.168.6.211:28677`
  - @@PROM@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -A | grep prometheus-k8s` 명령으로 확인 가능
    - 예: `10.96.160.196:9090` 또는 `192.168.6.215:9090`
  - HDC 모드로 설치하려는 경우, @@HDC_MODE@@에 true를 기입하고, @@PORTAL@@에 portal URL을 기입한다.
      - HDC 모드가 아닌 경우, @@HDC_MODE@@, @@PORTAL@@ 문자열이 포함된 두 줄을 모두 제거한다.
  - @@VER@@ 부분에 도커 이미지의 버전 기입. 예: `1.1.21.0`
- `kubectl create -f 3.deployment-pod.yaml`을 실행한다.
  - 기존에 이미 실행 중인 것이 있다면 `kubectl delete -f 3.deployment-pod.yaml`을 먼저 실행한다.


## 3. 접속 방법
- LoadBalancer: https://<LB_IP>
- NodePort: https://<HOST_IP>:<NODE_PORT>


## 부록

- 1.initialization.yaml
```
apiVersion: v1
kind: Namespace
metadata:
  name: @@NAME_NS@@

---

apiVersion: v1
kind: ResourceQuota
metadata:
  name: @@NAME_NS@@-quota
  namespace: @@NAME_NS@@
spec:
  hard:
    limits.cpu: "2"
    limits.memory: "10Gi"
    requests.storage: "20Gi"

---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: @@NAME_NS@@-admin
  namespace: @@NAME_NS@@

---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: @@NAME_NS@@-admin
  namespace: @@NAME_NS@@
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]

---
  
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: @@NAME_NS@@-admin
subjects:
  - kind: ServiceAccount
    name: @@NAME_NS@@-admin
    namespace: @@NAME_NS@@
roleRef:
  kind: ClusterRole
  name: @@NAME_NS@@-admin
  apiGroup: rbac.authorization.k8s.io
```

- 2.svc-lb.yaml
```
apiVersion: v1
kind: Service
metadata:
  name: console-lb
  namespace: @@NAME_NS@@
spec:
  externalTrafficPolicy: Local
  type: LoadBalancer
  ports:
  - name: "https-lb"
    port: 443
    targetPort: 6443
  selector:
    app: console   
    hypercloud: ui
```

- 2.svc-np.yaml
```
apiVersion: v1
kind: Service
metadata:
  name: console-np
  namespace: @@NAME_NS@@
spec:
  type: NodePort
  ports:
  - name: "https"
    port: 80
    targetPort: 6443
    nodePort: @@NODE_PORT@@
  selector:
    app: console   
    hypercloud: ui
```

- 3.deployment-pod.yaml
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: console
  namespace: @@NAME_NS@@
spec:
  progressDeadlineSeconds: 600      
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      hypercloud: ui
      app: console
  template:
    metadata:
      name: hypercloud-ui
      labels:
        hypercloud: ui
        app: console
    spec:
      serviceAccountName: @@NAME_NS@@-admin
      containers:      
      - command:
        - /opt/bridge/bin/bridge
        - --public-dir=/opt/bridge/static
        - --listen=https://0.0.0.0:6443
        - --tls-cert-file=/var/https-cert/tls.crt
        - --tls-key-file=/var/https-cert/tls.key
        - --hypercloud-endpoint=http://@@HC4@@
        - --prometheus-endpoint=http://@@PROM@@/api
        - --hdc-mode=@@HDC_FLAG@@
        - --tmaxcloud-portal=@@PORTAL@@
        image: 192.168.6.110:5000/hypercloud-console:@@VER@@
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - mountPath: /var/https-cert
          name: https-cert
          readOnly: true
        name: console
        ports:
        - containerPort: 6443
          protocol: TCP
        resources:
          limits:
            cpu: "1"
            memory: "2Gi"        
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext: {}
      terminationGracePeriodSeconds: 30
      tolerations:
      - effect: NoSchedule
        key: node-role.kubernetes.io/master
      volumes:
      - name: https-cert
        secret:
          defaultMode: 288
          secretName: console-https-secret
```

- install.sh
```
#!/usr/bin/env bash

NAME_HC4="hypercloud4-operator-service"
NAME_PROM="prometheus-k8s"

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
    exit 1 
fi 
PROM=${PROM_IP}:${PROM_PORT}
echo "Prometheus Addr = ${PROM}"

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
echo ""

# Create Secret to enable https between browser and console-server
if [ $RE_CREATE_SECRET = true ]; then
    kubectl delete secret console-https-secret -n ${NAME_NS}
    kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n ${NAME_NS}
fi
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
echo ""

# Create Deployment
if [ $RE_CREATE_DEPLOYMENT_POD = true ]; then
    kubectl delete -f ${file_deployment_pod_temp}
    kubectl create -f ${file_deployment_pod_temp}
fi
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
```

# HyperCloud Console 설치 가이드라인
hypercloud-console:1.1.37.1부터 적용되는 가이드입니다.<br>
최근 업데이트: ***2020/07/24***

- IP Range Validation을 테스트하기 위해서는 Load Balancer 서비스와 LoadBalancer Public IP를 사용해야 합니다.<br>
LB yaml의 spec에는 "externalTrafficPolicy: Local"이 추가되어야 하고,<br>
deployment yaml의 template spec에는 "serviceAccountName: @@NAME_NS@@-admin"가 추가되어야 합니다.

- HDC (public) 모드로 설치하는 경우에는 console과 portal이 쿠키를 공유할 수 있도록 같은 도메인의 서브도메인으로 세팅되어야 합니다.<br>
console과 portal 둘 다 443 포트의 LB 서비스로 생성하거나, 또는 둘 다 Node Port 서비스로 생성하고서 둘 다 동일한 Node IP로만 접속해야 합니다.<br>
(Node Port를 사용하는 경우, 로그인용 계정에 UserSecurityPolicy가 설정되어 있으면 IP Range Validation에서 오동작을 할 수 있습니다.)

## 1. 서론 및 사전준비
- UI console 설치 과정은 다음과 같다.
  1. Namespace, Quota, Role 등 생성
  2. Secret 생성 (https 통신을 위함)
  3. Service 생성 (cluster 외부에서 접근하기 위함)
  4. Deploymenet, Pod 생성
  - install.sh를 사용하는 경우 2A를, 그렇지 않은 경우 2B를 따르면 된다.
- kubernetes master node의 아무 경로에 작업용 폴더를 생성하고, 다음 파일들을 위치시킨다.<br>
  (이 파일들은 hypercloud-console의 hc-dev 또는 hc-release 브랜치의 install-yaml 폴더 안에 들어있다.)<br>
  최근 업데이트: ***2020/07/24***
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
  - `Enter the console version.` -> `1.1.37.1` (https://hub.docker.com/r/tmaxcloudck/hypercloud-console/tags?page=1&ordering=last_updated 에서 최신 버전 확인)
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
- `vi 3.deployment-pod.yaml`으로 yaml 파일에 필수값들을 기입한다. (없으면 dummy 값이라도 입력하되, URL 형식에 맞게 입력해야 함. 예: `0.0.0.0:80`)
  - @@HC4@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -n hypercloud4-system hypercloud4-operator-service` 명령어로 확인 가능
    - 예: `10.96.57.147:28677` 또는 `192.168.6.211:28677`
  - @@PROM@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -n monitoring prometheus-k8s` 명령으로 확인 가능
    - 예: `10.96.160.196:9090` 또는 `192.168.6.215:9090`
  - @@GRAFANA@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -n monitoring grafana` 명령으로 확인 가능
  - @@KIALI@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -n istio-system kiali` 명령으로 확인 가능
  - @@JAEGER@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -n istio-system tracing` 명령으로 확인 가능
  - @@APPROVAL@@ 부분에 적절한 경로 기입 
    - `kubectl get svc -n approval-system approval-proxy-server` 명령으로 확인 가능
  - HDC 모드로 설치하려는 경우, @@HDC_MODE@@에 true를 기입하고, @@PORTAL@@에 portal URL을 기입한다.
      - HDC 모드가 아닌 경우, @@HDC_MODE@@, @@PORTAL@@ 문자열이 포함된 두 줄을 모두 제거한다.
  - @@VER@@ 부분에 도커 이미지의 버전 기입. 예: `1.1.37.1` (https://hub.docker.com/r/tmaxcloudck/hypercloud-console/tags?page=1&ordering=last_updated 에서 최신 버전 확인)
- `kubectl create -f 3.deployment-pod.yaml`을 실행한다.
  - 기존에 이미 실행 중인 것이 있다면 `kubectl delete -f 3.deployment-pod.yaml`을 먼저 실행한다.


## 3. 접속 방법
- LoadBalancer: `https://<LB_IP>`
- NodePort: `https://<NODE_IP>:<NODE_PORT>`

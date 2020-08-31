# HyperCloud Console 설치 가이드라인
hypercloud-console:4.1.1.2부터 적용되는 가이드입니다.<br>
최근 업데이트: ***2020/08/25***

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
  최근 업데이트: ***2020/08/25***
  - `1.initialization.yaml` (필수)
  - `2.svc-lb.yaml` 또는 `2.svc-np.yaml` (적어도 하나 필수)
  - `3.deployment.yaml` (필수)
- 일반적 루틴 : 이미 설치를 완료한 적이 있고 Namespace/Secret/Service를 바꾸지 않아도 되는 경우, 아래의 작업만 하면 충분하다.
  - `kubectl apply -f 3.deployment.yaml`

## 2. kubectl tool을 이용한 설치 

#### 2-1. Namespace, Quota, Role 등 생성
- 1.initialization.yaml의 @@NAME_NS@@ 문자열을 적절한 값으로 바꾼다. ('console-system' 권장 )
- `kubectl apply -f 1.initialization.yaml`을 실행한다.
  - 이미 완료한 적이 있고 설정을 바꿀 필요가 없다면 생략한다.
  - 설정을 바꿔야 한다면 
    - `vi 1.initialization.yaml` vi editor로 설정값 변경한다. 
    - `kubectl appy -f 1.initialization.yaml` 실행한다.

#### 2-2. Secret 생성
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

#### 2-3. Service 생성
- 2.svc-lb.yaml, 2.svc-np.yaml의 @@NAME_NS@@, @@NODE_PORT@@ 문자열을 적절한 값으로 바꾼다.
- `kubectl create -f 2.svc-lb.yaml` 또는 `kubectl create -f 2.svc-np.yaml`을 실행한다. (둘 다 해도 무방)
  - 이미 완료한 적이 있고 설정을 바꿀 필요가 없다면 생략한다.
  - 설정을 바꿔야 한다면 `vi 2.xxxxx.yaml`로 값 변경 후 `kubectl apply -f 2.xxxxxxxx.yaml`를 먼저 실행한다.

#### 2-4. Deployment, Pod 생성
- 3.deployment.yaml 파일 이용 시 (권장) 
  - `vi 3.deployment.yaml`으로 yaml 파일에 필수 값들을 기입 (@@name@@ 형식으로 되어 있음)
  - console 서버와 동일한 cluster 내에 존재하는 서비스에 대해선 `해당 서비스 이름.네임스페이스.svc:서비스포트번호`를 기입한다. (3.deployment.yaml 파일 참고)
- 3.deployment-pod.yaml 파일 이용 시 
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
  - @@KUBEFLOW@@ 부분에 적절한 경로 기입
    - `kubectl get svc -n istio-system  istio-ingressgateway` 명령으로 확인 가능 
  - @@VNC@@ 부분에 적절한 경로 기입 
  - @@HYPERAUTH@@ 부분에 적절한 경로 기입 
- 공통 기입사항 
  - HDC 모드로 설치하려는 경우, @@HDC_MODE@@에 true를 기입하고, @@PORTAL@@에 portal URL을 기입한다.
    - HDC 모드가 아닌 경우, @@HDC_MODE@@, @@PORTAL@@ 문자열이 포함된 두 줄을 모두 제거한다.
  - @@REALM@@ 부분에 hyperauth이용하여 로그인 시 필요한 정보를 기입한다.
    - 예) sed -i 's#@@REALM@@#tmax#g' ./3.deployment-pod.yaml
  - @@CLIENTID@@ 부분에 hyperauth이용하여 로그인 시 필요한 client 정보를 기입한다. 
    - 예) sed -i 's#@@CLIENTID@@#hypercloud4#g' ./3.deployment-pod.yaml
  - @@KEYCLOAK@@ 부분에 외부에서 접속가능 hyperauth ip를 입력한다. (nodePort service)
    - 예) sed -i 's#@@KEYCLOAK@@#172.21.6.11#g' ./3.deployment-pod.yaml 
  - @@VER@@ 부분에 도커 이미지의 버전 기입. 예: `4.1.1.3` (https://hub.docker.com/r/tmaxcloudck/hypercloud-console/tags?page=1&ordering=last_updated 에서 최신 버전 확인)
- `kubectl create -f 3.deployment-pod.yaml`을 실행한다.
  - 기존에 이미 실행 중인 것이 있다면 수정 후 `kubectl apply -f 3.deployment-pod.yaml`을 먼저 실행한다.


## 3. 접속 방법
- LoadBalancer: `https://<LB_IP>`
- NodePort: `https://<NODE_IP>:<NODE_PORT>`

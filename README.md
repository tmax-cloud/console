HyperCloud Console
=========================
**HyperCloud - Cluster Console 코드 프로젝트 입니다.**
- openshift console 코드 원본 [GIT](https://github.com/openshift/console/tree/release-3.11)
- HyperCloud - Service Catalog, Application Console UI코드는 [다른 프로젝트](https://gitlab.ck:10080/pk3/HyperCloud-ogl)에서 관리 됩니다.
- 메인 작업은 **dev** Branch에서 진행 됩니다.
---
### 개발 전 체크사항
- nodeJs >= 10.17 & yarn >= 1.3.2 & go >= 1.8 & python......
- (비고) nodeJs의 버전은  ">=8.x <=10.x" 에서 build.sh 가 실행 됨, nvm (node버전 관리툴)을 이용해 nodeJS 버전 맞춰주세요. [참고 블로그](http://hong.adfeel.info/backend/nodejs/window%EC%97%90%EC%84%9C-nvmnode-version-manager-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0/)
  - nvm 명령어 
    - Node 버전 설치: nvm install <version> ex) nvm install 8.9.4 // 설치된 Node 목록 확인: nvm ls // 사용할 Node 설정 // nvm user <version>
- clone시에 C:\Users\USER_NAME\go\src\github.com\openshift\console에 파일이 담기도록 합시다. (빌드시 안돌아가는 스크립트들이 있음)
---
### 빌드

```
./build.sh
```

build 후, ./frontend/public/dist 폴더에 파일들이 생성되며, 이 파일들로 이미징 작업을 하게 됩니다.

---
### 개발 확인
- openshift oAuthClient 인증서 적용
    - ip주소와 사용할 port정보(default:9000)를 통해 인증서 요청 (to 서버관리자)
    - 두개의 파일 (console-client-secret, ca.crt) ./exaples 폴더에 복사
- ./examples/config.yaml 수정
    - 6행 개발IP로 수정
- ./examples/run-bridge.sh 수정
    - 6행, 12행 개발IP로 수정
    - 15행 : --user-auth-oidc-client-id=console-oauth-client-${NAME} 으로 변경
    - ${NAME}값은 개발 규칙으로, 개발자 이름을 담도록 합니다. (ex. jeongwan)
```
./examples/run-bridge.sh
```
개발IP:port(default 9000)로 UI 접근 가능합니다.
 
---
***
### 서버 인증 가이드
- oAuthClient secret 등록, 발급 방법
    - console-oauth-client.yaml 수정
        - client name → console-oauth-client-${NAME}
        - redirectURL → 개발IP
        - ./examples/USER/console-client-secret 파일 전달
```
oc process -f examples/console-oauth-client.yaml | oc apply -f -
oc get oauthclient console-oauth-client-${NAME} -o jsonpath='{.secret}' > examples/USER/console-client-secret
```

- CA 인증서 발급
    - user dependency가 없으므로 한 파일로 여럿 사용 가능 
    - ./examples/ca.crt 파일 전달
```
oc get secrets -n default --field-selector type=kubernetes.io/service-account-token -o json | \
    jq '.items[0].data."service-ca.crt"' -r | python -m base64 -d > examples/ca.crt
# Note: use "openssl base64" because the "base64" tool is different between mac and linux
```

### 추가 TMI
- linux에서 build하고 싶을 때, ./frontend/package.json의 scripts.build 수정 (\"\"\" -> \") 
- 서버 개발 체크사항
    - [node.js](https://nodejs.org/) >= 10.17 & [yarn](https://yarnpkg.com/en/docs/install) >= 1.3.2 & python
    - [go](https://golang.org/) >= 1.8 & [glide](https://glide.sh/) >= 0.12.0 (`go get github.com/Masterminds/glide`) & [glide-vc](https://github.com/sgotti/glide-vc)
    - [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) and a k8s cluster
    - `jq` (for `contrib/environment.sh`)
    - Google Chrome/Chromium >= 60 (needs --headless flag) for integration tests
    

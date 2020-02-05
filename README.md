HyperCloud Console
=========================
**HyperCloud - Service Catalog, Application Console UI 코드 프로젝트 입니다.**
- openshift origin-web-console 코드 원본 [링크](https://quay.io/repository/openshift/origin-console?tab=tags)
- clone시에 C:\Users\USER_NAME\go\src\github.com\openshift\console에 파일이 담기도록 합시다. (빌드시 안돌아가는 스크립트들이 있음)
- 메인 작업은 **dev** Branch에서 진행 됩니다.
## 개발 전 체크사항

UI : node.js >= 10.17 & yarn >= 1.3.2 & go >= 1.8 & python......

## 빌드

```
./build.sh
```

build 후, ./frontend/public/dist 폴더에 파일들이 생성되며, 이 파일들로 이미징 작업을 하게 됩니다.


## 개발 확인
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
 
 *oAuth 인증서 적용을 꼭 확인합시다.

## openshift oAuthClient 인증서 적용
- ip주소와 사용할 port정보(default:9000)를 통해 인증서 요청 (to 서버관리자)
- 두개의 파일 (console-client-secret, ca.crt) ./exaples 폴더에 복사
---
## 인증 가이드
### oAuthClient secret 등록, 발급 방법
- console-oauth-client.yaml 수정
    - client name → console-oauth-client-${NAME}
    - redirectURL → 개발IP
```
oc process -f examples/console-oauth-clinet.yaml | oc apply -f -
oc get oauthclient console-oauth-client-${NAME} -o jsonpath='{.secret}' > examples/USER/console-client-secret
```

### CA 인증서 발급
```
oc get secrets -n default --field-selector type=kubernetes.io/service-account-token -o json | \
    jq '.items[0].data."service-ca.crt"' -r | python -m base64 -d > examples/ca.crt
# Note: use "openssl base64" because the "base64" tool is different between mac and linux
```

## 추가 TMI
- linux에서 build하고 싶을 때, ./frontend/package.json의 scripts.build 수정 (\"\"\" -> \") 
- 서버 개발 체크사항
    - [node.js](https://nodejs.org/) >= 10.17 & [yarn](https://yarnpkg.com/en/docs/install) >= 1.3.2 & python
    - [go](https://golang.org/) >= 1.8 & [glide](https://glide.sh/) >= 0.12.0 (`go get github.com/Masterminds/glide`) & [glide-vc](https://github.com/sgotti/glide-vc)
    - [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) and a k8s cluster
    - `jq` (for `contrib/environment.sh`)
    - Google Chrome/Chromium >= 60 (needs --headless flag) for integration tests
    

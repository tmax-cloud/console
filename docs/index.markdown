---
layout: default
title: HyperCloud 5.1
---
  
# 📕 HyperCloud Console 5.1 환경구축 

- Console 설치 가이드 - [가이드 링크](https://github.com/tmax-cloud/install-console)
- openshift console 코드 원본 - [GitHub](https://github.com/openshift/console/tree/release-4.5)
- 메인 작업은 **hc-dev-5.1** Branch에서 진행 됩니다.

---

## 개발 전 체크사항

- nodeJs >= 12.13.0 & yarn >= 1.3.2 & go >= 1.15 & python......
- (비고) nvm (node버전 관리툴)을 이용해 nodeJS 버전 맞춰주세요. [참고 블로그](http://hong.adfeel.info/backend/nodejs/window%EC%97%90%EC%84%9C-nvmnode-version-manager-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0/)
  - nvm 명령어
    - Node 버전 설치: nvm install $version ex) nvm install 12.13.0 // 설치된 Node 목록 확인: nvm ls // 사용할 Node 설정: nvm use $version
  - python 설치, error MSB3428 문제 해결:
    - python 설치 되어있을 시, "프로그램 추가, 제거"에서 파이썬 제거
    - 관리자 관한으로 power shell 실행
    - npm install --global --production windows-build-tools@4.0.0
    - npm install -g --production windows-build-tools (완료까지 시간이 걸림)

---

## 빌드

```shell
./build.sh

// 개발을 위한 빌드 시 (watch 옵션 적용됨)
./build-dev.sh
```

build 후 './frontend/public/dist' 폴더에 파일들이 생성되며, 이 파일들로 이미징 작업을 하게 됩니다.

## 실행

#### ~~순정 kubernetes (5.1버전에선 이 부분 사용 되지 않음)~~

~~$GOPATH/github.com/openshift/console 경로에서
./example/run-bridge.sh 실행~~


~~- kubernetes 인증서 파일 필요~~
  ~~- kubernetes가 설치 된 node의 `/root/.kube/config ` 를 console 노드의 ` /root/.kube/` 에 config 파일 저장~~

* ```shell
export KUBECONFIG=/root/.kube/config
source ./contrib/environment.sh
./bin/bridge
```

### console 5.1 버전 실행 커맨드
* ```shell
./examples/run-console.sh
```

---

# 가이드 목록
* ### [Console YAML Samples 사용 가이드](./console-yaml-sample.html)  
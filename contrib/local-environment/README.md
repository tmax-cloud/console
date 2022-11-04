## 개발자 로컬환경과 쿠버네티스 환경 연동 가이드 

아래의 명령어를 순차적으로 적용합니다. 

```shell
# 개발자 이름 혹은 약어 입력 (임의로 하셔도 됩니다.)
export MYNAME="<YOUR_NAME>"
# 개발자 로컬환경 IP 
export IP="<YOUR_IP>"
# sample 파일 복사
cp sample-console.yaml ${MYNAME}-console.yaml
# 문자열 교체
sed -i 's/{{NAME}}/${MYNAME}/g' ${MYNAME}-console.yaml
sed -i 's/{{IP}}/${IP}/g' ${MYNAME}-console.yaml
# kubectl로 쿠버네티스 환경에 ingressroute를 deploy
kubectl apply -f ${MYNAME}-console.yaml
```

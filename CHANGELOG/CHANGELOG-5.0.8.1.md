# hypercloud-console patch note
## hypercloud-console_[major].[minor].[patch].[hotfix]
Version: hypercloud-console_5.0.8.1
2021-05-03  08:39:33 AM
- [feat][patch] Task 생성페이지 step 모달 image 데이터 포맷 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] Cluster Task 생성페이지 추가 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] 모달 edit 버튼 클릭시에 target이 달라지는 버그 수정 (gyoungjun_lee) 
    Message: 
- [patch] 255689 : Template/ClusterTemplate YAML생성만 가능한 생성버튼 추가 (mjsso) 
    Message: 
- [feat][patch] build-dev script 추가 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] Persistent Volume 상태 정렬 버그 수정 (gyoungjun_lee) 
    Message: 
- [patch] 롤 바인딩 액션 번역 적용 (hyejin_park) 
    Message: 
- [bugfix][patch] 롤바인딩은 생성버튼에 클러스터 스코프 옵션 적용 (hyejin_park) 
    Message: 
- [bugfix][patch] 파이프라인 액션 메뉴 수정 (hyejin_park) 
    Message: 
- [feature] [patch] 필터링 상태 리덕스 관리 및 네임스페이스-상세-개요 페이지 추가 (saeyoung_oh) 
    Message: 
- [refactor] [patch] 사용자 리소스 정의 생성버튼 관련 수정 (saeyoung_oh) 
    Message:  - 네임스페이스 미 선택시에도 생성버튼 작동하게 수정
 - index.ts에 포함되어있지 않은 리소스에 대해서도 생성 페이지 동작하게 수정

- [bugfix][patch] Node 페이지 데이터 값 안나오던 버그 수정 (gyoungjun_lee) 
    Message: 
- [refactor] [patch] 홈-개요 화면에서 사용자 권한에 따른 화면표시 (saeyoung_oh) 
    Message:  - 사용자 권한 없을 경우 restricted access 에러 표기

- [patch] [refactor] Pod 상세페이지 i18n 미적용부분 i18n 적용 (mjsso) 
    Message: 
- [patch] [refactor] Job 병렬성수정 팝업에 i18n 적용 (mjsso) 
    Message: 
- [feat][patch] Node Dashboard 페이지 Ongoing 제거 (gyoungjun_lee) 
    Message: 
- [patch] [bugfix] 260436 : '시크릿 워크로드로 추가' 팝업에서 DeploymentConfig 조회하지 않도록 수정 (mjsso) 
    Message: 
- [bugfix][patch] 새로고침시 openshift 관련 서버 에러 나오던 버그 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] Deployment podcount 모달 i18n 적용 (gyoungjun_lee) 
    Message: 
- [patch] Single 클러스터모드인 경우 developer 메뉴 뜨도록 수정 (hyejin_park) 
    Message: 
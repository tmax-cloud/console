# hypercloud-console patch note
## [Product Name]_[major].[minor].[patch].[hotfix]
Version: hypercloud-console_4.1.1.4
2020-08-26  06:35:49 AM
- [bugfix][patch] 롤바인딩 클레임 form 생성시에 버그 수정 (subject.kind값 default로 'User'선택되도록, roleRef 객체에 nameString 속성 값 제거) (dongmin-jung) 
    Message: (cherry picked from commit 47ac08bc7dfa14ef91ca5453b428fc1328dd2be0)

- [bugfix][patch] role binding claim form create 페이지에서 role 조회 서비스 버그 수정 (dongmin-jung) 
    Message: (cherry picked from commit ffba5d71e48b34496a799f737d78fbba218d2c38)

- [bugfix][patch] role binding claim 폼에디터 생성페이지에서 cluster role 조회 안되던 버그 수정 (dongmin-jung) 
    Message: (cherry picked from commit ca2ddffaa7e83a675c5a3a40df3fe96391269237)

- [bugfix][patch] rolebindingclaim 폼에디터 생성시에 roleRef.apiGroup 수정 (이경준) 
    Message: 
- [bugfix][patch] role binding claim 폼에디터 생성시에 화면에서만 role 선택되어있고 state값은 초기화 안되어있던 버그 수정 (이경준) 
    Message: 
- [bugfix][patch] role binding claim 폼에디터 페이지 롤 default 선택값 kind값 선택 오류 수정 (이경준) 
    Message: 
- [feat][patch] role binding claim 폼에디터 생성 페이지 서비스 어카운트 선택시에 subjects.namespace 초기값 설정, subjects.namespace 선택시에 반영되도록 수정 (이경준) 
    Message: 
- [bugfix][patch] 인그레스 폼 에디터 생성 서비스 포트 데이터 버그 수정 (심소영) 
    Message: [IMS] 236378

- [feat][patch] console CI/CD를 위한 Jenkinsfile update (jinsoo_youn) 
    Message: 
- [feat][patch] hcdc 모드에서 할당된 네임스페이스 없는 유저가 콘솔 url로 접근하였을 때 포탈의 trial 신청 페이지로 리다이렉트하는 로직 추가 (miri_jo) 
    Message: [IMS] 235557

- [feat][patch] CronJob YamlEditor_Sample String 수정 (yeojin_choi) 
    Message: IMS: 224441

- [bugfix][patch] 파이프라인 리소스 폼에디터 버그 수정 (miri_jo) 
    Message: [IMS] 237287

- [feat][patch] cluster service broker , service instance - Yaml Editor Sample 컨텐츠 변경 및 번역 적용 (심소영) 
    Message: [IMS] 224276, 224151

- [bugfix][patch] 태스크런 생성시 입력한 타임아웃 값 없을 경우 타임아웃 필드 제거하도록 수정 (miri_jo) 
    Message: [IMS] 237329

- [feat][patch] ConfigMap YamlEditor_Sample String 변경 사항 반영 (yeojin_choi) 
    Message: IMS: 224434

- [feat][patch] Secret 메뉴 Yaml Editor Sample - String 변경 사항 반영 (yeojin_choi) 
    Message: IMS: 224439

- [feat][patch] pod security policy - yaml editor Sample Sidebar 추가 (심소영) 
    Message: [IMS] 224782

- [feat][patch] 배포 용도에 따른 젠킨스파일 생성 (jinsoo_youn) 
    Message: 
- [[feat][patch] 설치 가이드 라인 업데이트 및 deployment.yaml 수정 (jinsoo_youn) 
    Message: 
- [bugfix][patch] dropdown 존재 할 때 팝업 잘리는 버그 수정 (이경준) 
    Message: 
- [bugfix][patch] 카티브 생성 후 detail 화면 안뜨는 버그 수정 (심소영) 
    Message: [IMS] 236702

- [patch][refactor] hyperflow reverseproxy 연동 추가 (jinsoo_youn) 
    Message: 
- [feat][patch] Auth - User Security Policy 메뉴 제거 (yeojin_choi) 
    Message: 
- [bugfix][patch] cluster overview 컨트롤 플레인 상태 - api 요청 성공율 차트 쿼리 변경 (심소영) 
    Message: [IMS] 235473

# hypercloud-console patch note
## hypercloud-console_[major].[minor].[patch].[hotfix]
Version: hypercloud-console_5.0.10.0
2021-05-13  09:19:23 AM
- [feature] [patch] 네임스페이스-상세-개요 화면에 리소스 쿼타 카드 추가 (saeyoung_oh) 
    Message: 
- [bugfix][patch]additionalProperties 컴포넌트인덱싱 버그 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] openshift 관련 flag들 없앴던거 false값으로 변경 (gyoungjun_lee) 
    Message: 
- [refactor] [patch] filter 컴포넌트에 default selected item props 추가 (saeyoung_oh) 
    Message:  - ListPage에 defaultSelectedRows props 추가
 - namespace claim 및 resource quota claim에 Awaiting을 default selected item으로 수정

- [patch] 260359, 260361 : ServiceClass, ClusterServiceClass 관련 수정된 UX 및 i18n 적용 (mjsso) 
    Message: 
- [refactor][patch] util성 함수들 세분화 (gyoungjun_lee) 
    Message: 
- [feat][patch] 모든 리소스 메뉴 Edit Tab 으로 통일 (gyoungjun_lee) 
    Message: 
- [feat][patch] crd 리소스에도 edit 탭 기본적으로 적용되도록 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] i18n Trans 문법 적용 (gyoungjun_lee) 
    Message: 
- [refactor][patch]edit-resource에 CRD일 때 plural로직 변경 (gyoungjun_lee) 
    Message: 
- [refactor][patch] util성 함수들 리팩토링 (gyoungjun_lee) 
    Message: 
- [feat][patch] 서비스 인스턴스 생성화면 추가 (hyejin_park) 
    Message: 
- [feat][patch] 파이프라인 리소스 생성화면 추가 (hyejin_park) 
    Message: 
- [patch] 260723 : CatalogServiceClaim필필터툴바 추가 및 승인처리팝업 버튼 비활성화처리 로직 추가 (mjsso) 
    Message: 
- [patch] 롤 생성 폼 - 규칙 최소 1개 유지되도록 수정 (hyejin_park) 
    Message: 
- [patch] [refactor] 260361: ClusterServiceClass 관련 추가 수정 (mjsso) 
    Message: 
- [feat][patch] Task 생성페이지 step 모달에 command 필드 수정 (gyoungjun_lee) 
    Message: 
- [patch] 260359 : ServiceClass 관련 추가 수정 (mjsso) 
    Message: 
- [refactor] [patch] namespace-claim 및 resource-quota-claim 페이지에서 일부 상태에 대해 kebab 및 details page의 action에서 승인 처리 항목 제거 (saeyoung_oh) 
    Message: 
- [feat][patch]Pod 상태화면 'Scaled to 0' 폰트크기변경 및 로직 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch]edit 폼에디터 예시 적용(task- step modal 미비함) (gyoungjun_lee) 
    Message: 
- [patch] 롤 생성 폼 - 드롭다운 아이템 정렬 (hyejin_park) 
    Message: 
- [patch] custom form - 생성 에러 발생시 에러 메세지 노출 (hyejin_park) 
    Message: 
- [feat][patch] developer에 add 메뉴 추가 (hyejin_park) 
    Message: 
- [refactor] [patch] Dynamic form의 description 내용 i18n 추가(완료) (mjsso) 
    Message: 
- [patch] 260881 : ClusterTemplate리스트페이지 namespace 항목 제거 (mjsso) 
    Message: 
- [patch] 롤 생성 폼 - core 리소스에 endpoints, events 추가 (hyejin_park) 
    Message: 
- [bugfix][patch] 파이프라인 파라미터 validation 수정 (hyejin_park) 
    Message: 
- [feat][patch] 파드 수 donut chart 폰트사이즈 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] Node 페이지 파드 수 쿼리 수정 (gyoungjun_lee) 
    Message: 
- [patch] ServiceClass상세페이지 ServicePlan디테일 항목 ID -> 이름으로 수정 (mjsso) 
    Message: 
- [bugfix][patch] 드롭다운 아이템에 가로스크롤 추가 (hyejin_park) 
    Message: 
- [feat][patch]태스크 edit탭 스텝모달 초기값 로직추가 (script 추가필요) (gyoungjun_lee) 
    Message: 
- [feat][patch] ADD jwt validation handler (jinsoo-youn) 
    Message: 
- [feat][bugfix][patch] kibana protocol 수정 (jinsoo-youn) 
    Message: 
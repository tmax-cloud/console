# hypercloud-console patch note
## hypercloud-console_[major].[minor].[patch].[hotfix]
Version: hypercloud-console_5.0.5.0
2021-04-21  01:53:31 AM
- [feat][patch] AI DevOps 메뉴 추가 (hyejin_park) 
    Message: 
- [patch][bugfix]hookform/devtools dev로 변경 (gyoungjun_lee) 
    Message: 
- [feat][patch] console_version 오류 해결 (jinsoo-youn) 
    Message: 
- [feat][patch] managed-gitlab-url flag 추가 (jinsoo-youn) 
    Message: 
- [feat][patch] 태스크 폼에디터 추가 (Step 모달, 수정, 검증 기능 미구현) (gyoungjun_lee) 
    Message: 
- [feat][patch] UI Pattern: 목록에 리소스 생성 버튼 수정 (saeyoung_oh) 
    Message: 네임스페이스 미 선택시 버튼 비활성화 및 알림 tooltip 추가

- [refactor][patch] 네임스페이스 비활성화시 생성 버튼 미클릭 부분 버그 수정 (saeyoung_oh) 
    Message: 
- [feat][patch] 멀티 클러스터 콘솔 환경 네임스페이스 추가 (saeyoung_oh) 
    Message: 멀티 클러스터 환경에서 네임스페이스 namespace-scope으로 변동되어 해당 사항에 맞게 추가

- [feat][patch] 클러스터 디테일 페이지 링크 클릭 시 네임스페이스 링크 연동 기능 추가 (saeyoung_oh) 
    Message: 
- [feat][patch] Task Modal에서 취소 눌렀을 때도 data-set 초기화 (gyoungjun_lee) 
    Message: 
- [feat][patch] Task 생성페이지 step 모달 추가 (gyoungjun_lee) 
    Message: 
- [bugfix] [patch] DaemonSet, StorageClass, Secret YAML사용 생성화면 안뜨는 현상 수정 (mjsso) 
    Message: 
- [feat][patch] 클러스터 클레임 승인처리 URL에 네임스페이스 추가 (saeyoung_oh) 
    Message: 
- [refactor][patch] 네임스페이스 미 선택시 생성 버튼 (dropdown 추가) 불가하게 수정 (saeyoung_oh) 
    Message: 
- [feat] [patch] kubeflow proxy 추가 (jinsoo-youn) 
    Message: 
- [bugfix][patch] 모달 cancel 작동하지 않는 버그 수정 (hyejin_park) 
    Message: 
- [refactor][patch] 네임스페이스 미선택시 생성 버튼 비활성화 (saeyoung_oh) 
    Message: listpage 내부 해당 로직 추가
listpage를 타지 않고 바로 multilistpage를 타는 resource-quota 페이지 수정

- [feat][patch] Dropdown 위젯 defaultValue 추가 (gyoungjun_lee) 
    Message: 
- [feat][patch] pod,template 메뉴에 edit formdata 시험 적용 (gyoungjun_lee) 
    Message: 
- [feat][patch] edit 폼에디터 변경되는 것 확인 (이미지 서명 요청) (gyoungjun_lee) 
    Message: 
- [feat][patch] CRD 버전 변경되서 schema 필드 이동한것 호환되도록 적용 (gyoungjun_lee) 
    Message: 
- [feat][patch] yaml 탭 edit 탭으로 변경 (gyoungjun_lee) 
    Message: 
- [feat][patch] GNB 디자인 변경 및 메뉴얼, import yaml 아이콘 추가 (eunkyeng_shin@tmax.co.kr) 
    Message: 
- [feat][patch] NavSection을 메뉴로 사용하기 위해 withoutSection props 추가 (saeyoung_oh) 
    Message: 
- [feat][patch] 모달 outlayer 부분 클릭시에 안꺼지도록 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] 라디오 버튼 defaultValue기능 추가 (gyoungjun_lee) 
    Message: 
- [feat][patch] kebab수정 item클릭시에 폼에디터 수정 화면으로 가도록 변경 (gyoungjun_lee) 
    Message: 
- [patch] [feat] 테라폼 클레임 페이지 추가 (saeyoung_oh) 
    Message: 
- [feat][patch]Developer메뉴 추가(+ADD메뉴) (eunkyeng_shin@tmax.co.kr) 
    Message: 
- [feat][patch] InferenceService apiVersion 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] NavSection을 메뉴로 사용하기 위해 withoutSection props 추가 (saeyoung_oh) 
    Message: 
- [patch] [feat] 테라폼 클레임 페이지 추가 (saeyoung_oh) 
    Message: 
- [bugfix][patch] resourcequotaclaim 승인요청 안되던 버그 수정 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] 폼 생성요청시에 PUT 메서드 보내던 버그 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] 모달 overflow style 수정 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] InferenceSevice CRD 변경 부분 수정 (gyoungjun_lee) 
    Message: 
- [feat][patch] Task 생성페이지 image dropdown 들 연동 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] cluster-task 리스트에서 네임스페이스 필드 제거 (hyejin_park) 
    Message: 
- [refactor][patch] 파이프라인런 생성 페이지 수정 (hyejin_park) 
    Message: 
- [feat][patch] Create Form 페이지 Edit Yaml 제거 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] 롤바인딩 생성 버튼 문구 수정 (hyejin_park) 
    Message: 
- [feat][patch]Task 생성페이지 데이터 포매팅 (gyoungjun_lee) 
    Message: 
- [feat][patch] Task 생성 페이지 생성되는 것 확인 (gyoungjun_lee) 
    Message: 
- [bugfix][patch] 드롭다운defaultvalue 설정시 무한 렌더링 버그 수정 (gyoungjun_lee) 
    Message: 
- [refactor][patch] 모달에서 초기 세팅 훅들 커스텀 훅으로 변경 (gyoungjun_lee) 
    Message: 
- [refactor][patch] Task 생성페이지 중복되는 코드 함수화 (gyoungjun_lee) 
    Message: 
- [feat] [patch] 일부 페이지 병합 (saeyoung_oh) 
    Message:  - namespace, namespace claim 페이지 navbar로 병합
 - namespace claim 필터 추가
 - resource quota, resource quota claim 페이지 병합

- [patch] [refactor] 258518 : CatalogServiceClaim 상태 Approve/Reject -> Approved/Rejected 로 표시 되게 수정 (mjsso) 
    Message: 
- [patch] [refactor] 259331 : ClusterServiceClass 외부이름 항목 제거 및 일부 i18n 적용 (mjsso) 
    Message: 
- [patch] [refactor] 259331 : ServiceClass 바인딩요청 항목 True/False -> Available/Unavailable로 수정 (mjsso) 
    Message: 
import * as _ from 'lodash-es';
import * as React from 'react';

import { PodSecurityPolicyModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const PodSecurityPolicySidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Privileged Pod Security Policies',
      details: `Privileged 권한의 파드 보안 정책의 생성을 위한 가장 기본적인 작성 예이다.
      리소스 이름: 
      (1) name 파드 보안 정책의 이름
      (2) seccomp.security.alpha.kubernetes.io/allowedProfileNames
      seccomp에 허용되는 값을 지정 ( '*'은 모든 프로파일을 허용)
      – unconfined
      – runtime/default
      – docker/default
      – localhost/<path>
      – *
      만약 해당 값을 설정하지 않으면 기본값의 변경이 불가능
      (3) privileged
      파드에 속한 컨테이너의 Privileged 모드 사용 여부
      – true : 허용
      – false : 컨테이너의 하위 프로세스가 상위 프로세스보다 더 많은 권한을 가질 수 없음
      (4) allowPrivilegeEscalation 루트 권한에 대한 에스컬레이션 허용 여부
      – true : 허용
      – false : 컨테이너의 하위 프로세스가 상위 프로세스보다 더 많은 권한을 가질 수 없음
      (5) readOnlyRootFilesystem 루트 파일 시스템에 대한 읽기/쓰기 권한 (기본값: true)
      – true : 읽기만 가능
      – false : 읽기, 쓰기 가능
      (6) allowedCapabilities 컨테이너에 추가될 수 있는 기능 목록 ( '*'은 모든 기능을 허용)
      (7) volumes 허용되는 볼륨 유형 목록
      이때 허용 가능한 값은 볼륨을 생성할 때 정의된 볼륨 소스에 해당 ( '*'은 모든 볼륨 유형을 허용)
      (8) hostNetwork 노드의 네트워크 네임스페이스에 대한 사용 여부
      (9) hostPorts 호스트의 네트워크 네임스페이스에 허용되는 포트 범위
      (10) hostIPC 호스트의 IPC 네임스페이스에 대한 공유 가능 여부
      (11) hostPID 호스트의 프로세스 ID 네임스페이스에 대한 공유 가능 여부
      (12) runAsUser 컨테이너를 실행할 사용자 ID의 제어 범위
      – MustRunAs
      – MustRunAsNonRoot
      – RunAsAny
      (13) seLinux SELinux의 제어 범위
      – MustRunAs
      – RunAsAny
      (14) supplementalGroups 컨테이너가 추가할 그룹 ID의 제어 범위
      – MustRunAs
      – MayRunAs
      – RunAsAny
      (15) fsGroup 일부 볼륨에 적용되는 보충 그룹의 제어 범위
      – MustRunAs
      – MayRunAs
      – RunAsAny`,
      // TODO: yaml 추가하기
      templateName: 'podsecuritypolicy-sample',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
    {
      header: ' Create Restricted Pod Security Policies',
      details: `Restricted 권한의 파드 보안 정책의 생성을 위한 가장 기본적인 작성 예이다.
      리소스 이름:
      (1) name 파드 보안 정책의 이름
      (2) seccomp.security.alpha.kubernetes.io/allowedProfileNames
      seccomp에 허용되는 값을 지정 ( '*'은 모든 프로파일을 허용)
      – unconfined
      – runtime/default
      – docker/default
      – localhost/<path>
      – *
      만약 해당 값을 설정하지 않으면 기본값의 변경이 불가능
      (3) seccomp.security.alpha.kubernetes.io/defaultProfileName
      seccomp에서 사용하는 기본값을 지정
      – unconfined
      – runtime/default
      – docker/default
      – localhost/<path>
      (4) apparmor.security.beta.kubernetes.io/allowedProfileNames
      apparmor에 허용되는 값을 지정
      – unconfined
      – runtime/default
      – localhost/<profile_name>
      (5) apparmor.security.beta.kubernetes.io/defaultProfileName
      apparmor에서 사용하는 기본값을 지정
      – unconfined
      – runtime/default
      – localhost/<profile_name>
      (6) privileged 파드에 속한 컨테이너의 Privileged 모드 사용 여부
      (7) allowPrivilegeEscalation
      루트 권한에 대한 에스컬레이션 허용 여부
      – true : 허용
      – false : 컨테이너의 하위 프로세스가 상위 프로세스보다 더 많은 권한을 가질 수 없음
      (8) requiredDropCapabilities
      컨테이너에서 제거할 기능 목록
      해당 필드에 작성된 목록은 반드시 'allowedCapabilities'나 'defaultAddCapabilities'에 포함되지 않아야 함
      (9) volumes 허용되는 볼륨 유형 목록
      이때 허용 가능한 값은 볼륨을 생성할 때 정의된 볼륨 소스에 해당 ( '*'은 모든 볼륨 유형을 허용)
      (10) hostNetwork 노드의 네트워크 네임스페이스에 대한 사용 여부
      (11) hostIPC 호스트의 IPC 네임스페이스에 대한 공유 가능 여부
      (12) hostPID 호스트의 프로세스 ID 네임스페이스에 대한 공유 가능 여부
      (13) runAsUser 컨테이너를 실행할 사용자 ID의 제어 범위
      – MustRunAs
      – MustRunAsNonRoot
      – RunAsAny
      (14) seLinux SELinux의 제어 범위
      – MustRunAs
      – RunAsAny
      (15) supplementalGroups 컨테이너가 추가할 그룹 ID의 제어 범위
      – MustRunAs
      – MayRunAs
      – RunAsAny
      (16) fsGroup 일부 볼륨에 적용되는 보충 그룹의 제어 범위
      – MustRunAs
      – MayRunAs
      – RunAsAny
      (17) readOnlyRootFilesystem
      루트 파일 시스템에 대한 읽기/쓰기 권한 (기본값: true)
      – true : 읽기만 가능
      – false : 읽기, 쓰기 가능`,
      // TODO: yaml 추가하기
      templateName: 'podsecuritypolicy-sample2',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
  ];

  return (
    <ol className="co-resource-sidebar-list">
      {_.map(samples, sample => (
        <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};

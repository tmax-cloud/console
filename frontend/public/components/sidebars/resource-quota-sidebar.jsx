import * as _ from 'lodash-es';
import * as React from 'react';

import { ResourceQuotaModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ResourceQuotaSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Set compute resource quota',
      details: `Limit the total amount of memory and CPU that can be used in a namespace.
      리소스 이름: 
      apiVersion kubernetes의 v1 API를 사용
      kind ResourceQuota의 작업 명시
      metadata.name ResourceQuota Name 선언
      metadata.namespace ResourceQuota NameSpace 선언
      limits.cpu 터미널이 아닌 상태의 모든 파드에서 CPU 제한의 합은 이 값을 초과할 수 없음
      limits.memory 터미널이 아닌 상태의 모든 파드에서 메모리 제한의 합은 이 값을 초과할 수 없음
      requests.cpu 터미널이 아닌 상태의 모든 파드에서 CPU 요청의 합은 이 값을 초과할 수 없음
      requests.memory 터미널이 아닌 상태의 모든 파드에서 메모리 요청의 합은 이 값을 초과할 수 없음`,
      templateName: 'resourcequota-sample',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: 'Set maximum count for any resource',
      details: `Restrict maximum count of each resource so users cannot create more than the allotted amount.
      리소스 이름: 
      apiVersion kubernetes의 v1 API를 사용
      kind ResourceQuota의 작업 명시
      metadata.name ResourceQuota Name 선언
      metadata.namespace ResourceQuota NameSpace 선언
      configmaps 네임스페이스에 존재할 수 있는 총 구성 맵 수
      persistentvolumeclaims 네임스페이스에 존재할 수 있는 총 퍼시스턴트 볼륨 클레임 수
      replicationcontrollers 네임스페이스에 존재할 수 있는 총 레플리케이션 컨트롤러 수
      services 네임스페이스에 존재할 수 있는 총 서비스 수
      services.loadbalancers    네임스페이스에 존재할 수 있는 로드 밸런서 유형의 총 서비스 수
      secrets 네임스페이스에 존재할 수 있는 총 시크릿 수`,
      templateName: 'resourcequota-sample2',
      kind: referenceForModel(ResourceQuotaModel),
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

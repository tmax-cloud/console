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
      header: '파드에서 CPU, 메모리 요청 제한',
      details: `터미널이 아닌 모든 상태의 모든 파드에서 사용하는 CPU와 메모리의 요청과 제한을 설정 합니다.`,
      templateName: 'resourcequota-sample',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: '요청 스토리지 용량 제한 및 생성 개수 제어',
      details: `네임 스페이스에서 요청할 수 있는 총 스토리지 용량을 제한하며, 해당 네임 스페이스에 존재할 수 있는 개수를 설정 합니다.`,
      templateName: 'resourcequota-sample2',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: '우선 순위에 따른 시스템 리소스 사용 제어',
      details: `우선 순위에 따라 파드의 시스템 리소스 사용을 제어할 수 있습니다.
      (values: 'low(낮음)', 'medium(중간)', 'high(높음)')
      (operator: 'In', 'NotIn', 'Exist', 'DoesNotExist')`,
      templateName: 'resourcequota-sample3',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: '할당량의 연결된 범위 설정',
      details: `범위가 할당량에 추가되면 해당 범위와 관련된 리소스로 지원하는 리소스 수를 제한 합니다.

      (scope: Terminating, NotTerminating, BestEffort, NotBestEffort)
      * 리소스 요구 사항이 설정되지 않아야 합니다.`,
      templateName: 'resourcequota-sample4',
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

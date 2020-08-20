import * as _ from 'lodash-es';
import * as React from 'react';

import { LimitRangeModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const LimitRangeSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Limit Range 설정',
      details: `
        namespace에서 pod 또는 container가 사용 가능한 리소스(cpu, memory)의 범위를 지정할 수 있습니다.
        (default : 기본 리소스 쿼타 제한 정보 / defaultRequest : 기본 리소스 쿼타 요청 정보)
      `,
      templateName: 'limitrange-sample',
      kind: referenceForModel(LimitRangeModel),
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

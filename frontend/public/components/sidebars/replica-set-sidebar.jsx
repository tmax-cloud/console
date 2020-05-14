import * as _ from 'lodash-es';
import * as React from 'react';

import { ReplicaSetModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ReplicaSetSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: ' 레플리카셋 기본 샘플',
      details: `레플리카셋은 실행되는 파드의 개수에 대한 가용성을 보증하는 기능을 제공하며, 레플리카 파드의 실행을 항상 안정적으로 유지하도록 한다.
      .spec.template는 레이블을 붙이도록 되어 있는 파드 템플릿이다.
      .spec.selector는 레이블 셀렉터이며, 파드를 식별하는데 사용된다.
      .spec.replicas는 동시에 동작하는 파드의 수를 지정한다. 기본 값은 1이다.`,
      templateName: 'replicaset-sample',
      kind: referenceForModel(ReplicaSetModel),
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

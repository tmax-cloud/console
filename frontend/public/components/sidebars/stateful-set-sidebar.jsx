import * as _ from 'lodash-es';
import * as React from 'react';

import { StatefulSetModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const StatefulSetSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '스테이트풀 셋 기본 샘플',
      details: `스테이트풀셋은 애플리케이션의 스테이트풀(상태를 갖고 있는 포드)을 관리하는데 사용한다.
      .spec.tamplate는 파드 템플릿이다.
      .spec.volumeClaimTemplates는 퍼시턴트 볼륨 클레임(Persistent Volume Claim)데 대한 템플릿이다.파드가 퍼시스턴트 볼륨 클레임을 자동으로 생성하도록 지원한다. 스테이트풀셋 삭제 시 생성된 볼륨이 삭제되지는 않으며, volumeClaimTemplates로 생성된 pv와 pvc는 직접 삭제해야 한다.`,
      templateName: 'statefulset-sample',
      kind: referenceForModel(StatefulSetModel),
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

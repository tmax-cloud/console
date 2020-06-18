import * as _ from 'lodash-es';
import * as React from 'react';

import { ClusterServiceBrokerModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ClusterServiceBrokerSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      //   highlightText: t('CONTENT:LIMIT'),
      header: '클러스터 서비스 브로커 기본 샘플',
      details: `서비스 카탈로그 템플릿을 사용자가 사용 할 수 있도록 클러스터 서비스 브로커를 등록한다. 
      서비스 브로커를 클러스터 전체에서 사용가능 하게하려면 ClusterServiceBroker 자원을 사용하여 브로커를 등록한다.
      .apiVersion - servicecatlog.k8s.io/v1beta1 api사용
      .kind - 오브젝트를 식별하는 레이블
      .metadata - 컨테이너 이름
      .spec.url - 컨테이너에서 사용하는 이미지 repo 주소`,
      templateName: 'clusterservicebrocker-sample',
      kind: referenceForModel(ClusterServiceBrokerModel),
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

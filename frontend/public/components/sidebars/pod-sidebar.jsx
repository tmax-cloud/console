import * as _ from 'lodash-es';
import * as React from 'react';

import { PodModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const PodSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      //   highlightText: t('CONTENT:LIMIT'),
      header: '파드 기본 샘플',
      details: `애플리케이션의 기본 실행 단위인 파드를 생성한다.
      .metadata.name: 파드 이름
      .metadata.labes.app: 오브젝트를 식별하는 레이블
      .spec.containers[].name: 컨테이너 이름
      .spec.containers[].image: 컨테이너에서 사용하는 이미지
      .spec.containers[].ports[].containerPort: 해당 컨테이너에 접속할 포트`,
      templateName: 'pod-sample',
      kind: referenceForModel(PodModel),
    },
    {
      header: '자원사용량 설정 샘플',
      details: `파드의 자원량을 설정하여 생성한다 .
      .spec.conatainers[].resources: 자원 사용량을 설정하는 부분
      .spec.conatainers[].resources.requeset: 최소 자원 요구량
      .spec.conatainers[].resources.limits: 최대 사용 가능 자원량`,
      templateName: 'pod-sample2',
      kind: referenceForModel(PodModel),
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

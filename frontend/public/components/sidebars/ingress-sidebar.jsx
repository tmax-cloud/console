import * as _ from 'lodash-es';
import * as React from 'react';

import { IngressModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const IngressSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '인그레스 기본 샘플',
      details: `클러스터 내의 서비스에 대한 외부 접근을 관리하는 API 오브젝트이며, 일반적으로 HTTP를 관리한다.
      .apiVersion – extensions/v1beta1 API를 사용 한다.
      .kind - Ingress의 작업을 명시한다.
      .metadata.name – Ingress의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .spec - 포트 정보들을 지정한다`,
      templateName: 'ingress-sample',
      kind: referenceForModel(IngressModel),
    },
    {
      header: '단일 서비스 인그레스 샘플',
      details: `클러스터 내의 서비스에 대한 외부 접근을 관리하는 API 오브젝트이며, 일반적으로 HTTP를 관리한다.
      .apiVersion – extensions/v1beta1 API를 사용 한다.
      .kind - Ingress의 작업을 명시한다.
      .metadata.name – Ingress의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .spec.rules - 포트 정보들을 지정한다`,
      templateName: 'ingress-sample2',
      kind: referenceForModel(IngressModel),
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

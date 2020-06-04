import * as _ from 'lodash-es';
import * as React from 'react';

import { ServiceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ServiceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '서비스 기본 샘플',
      details: `애플리케이션의 기본 실행 단위인 파드에서 실행되는 네트워크 서비스이다.
      .apiVersion – v1 API를 사용 한다.
      .kind - Service의 작업을 명시한다.
      .metadata.name – Service의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .spec.selector – app에 대한 정보를 지정한다
      .spec.ports – protocol, port, targetPort 정보들을 지정한다.`,
      templateName: 'service-sample',
      kind: referenceForModel(ServiceModel),
    },
    {
      header: '다중 포트 서비스 샘플',
      details: `서비스에 둘 이상의 포트 노출이 필요한 경우, 포트이름을 명확히 지정한 후 사용 가능하다.
      .apiVersion – v1 API를 사용 한다.
      .kind - Service의 작업을 명시한다.
      .metadata.name – Service의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .spec.selector – app에 대한 정보를 지정한다
      .spec.ports – protocol, port, targetPort 정보들을 지정한다.`,
      templateName: 'service-sample2',
      kind: referenceForModel(ServiceModel),
    },
    {
      header: '외부 IP 서비스 샘플',
      details: `하나 이상의 클러스터 노드로 라우팅되는 외부 IP가 있는 경우, 외부 IP 사용 가능하다.
      .apiVersion – v1 API를 사용 한다.
      .kind - Service의 작업을 명시한다.
      .metadata.name – Service의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .spec.selector – app에 대한 정보를 지정한다
      .spec.ports – protocol, port, targetPort 정보들을 지정한다.
      .spec.externalIPs – externalIP 정보들을 지정한다.`,
      templateName: 'service-sample3',
      kind: referenceForModel(ServiceModel),
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

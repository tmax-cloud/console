import * as _ from 'lodash-es';
import * as React from 'react';

import { ServiceBindingModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ServiceBindingSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      //   highlightText: t('CONTENT:LIMIT'),
      header: '서비스 바인딩 샘플',
      details: `서비스 바인딩은 서비스 인스턴스와 응용프로그램 사이의 링크를 제공하는 역할을 한다.`,
      templateName: 'servicebinding-sample',
      kind: referenceForModel(ServiceBindingModel),
    },
    {
        //   highlightText: t('CONTENT:LIMIT'),
      header: '서비스 바인딩 secret key 추가 설정 샘플',
      details: ` 서비스 바인딩은 서비스 인스턴스와 응용프로그램 사이의 링크를 제공하는 역할을 한다. 브로커가 응답하면 서비스 카탈로그는 spec.secretName에서 지정한 secret에 응답하는 자격 증명을 기록한다`,
      templateName: 'servicebinding-sample2',
      kind: referenceForModel(ServiceBindingModel),
      }
  ];

  return (
    <ol className="co-resource-sidebar-list">
      {_.map(samples, sample => (
        <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};

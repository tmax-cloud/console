import * as _ from 'lodash-es';
import * as React from 'react';

import { TemplateInstanceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const TemplateInstanceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      //   highlightText: t('CONTENT:LIMIT'),
      header: '템플릿 인스턴스 샘플',
      details: `템플릿 인스턴스는 인스턴스 속성을 템플릿 형태로 정의한다. 정의된 템플릿을 통해 인스턴스를 신속하게 만들 수 있다.`,
      templateName: 'templateinstance-sample',
      kind: referenceForModel(TemplateInstanceModel),
    },
    {
        //   highlightText: t('CONTENT:LIMIT'),
      header: '템플릿 인스턴스 샘플 (WAS)',
      details: `WAS 인스턴스 템플릿은 인스턴스 속성을 템플릿 형태로 정의한다. 정의된 템플릿을 통해 인스턴스를 신속하게 만들 수 있다.`,
      templateName: 'templateinstance-sample2',
      kind: referenceForModel(TemplateInstanceModel),
      },
      {
        //   highlightText: t('CONTENT:LIMIT'),
      header: '템플릿 인스턴스 샘플 (DB)',
      details: `DB 인스턴스 템플릿을 통해 인스턴스 속성을 템플릿 형태로 정의한다. 정의된 템플릿을 통해 인스턴스를 신속하게 만들 수 있다.`,       
      templateName: 'templateinstance-sample3',
      kind: referenceForModel(TemplateInstanceModel),
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

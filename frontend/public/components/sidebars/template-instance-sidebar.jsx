import * as _ from 'lodash-es';
import * as React from 'react';

import { TemplateInstanceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const TemplateInstanceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:TEMPLATEINSTANCE-SIDEBAR_0'),
      details: t('STRING:TEMPLATEINSTANCE-SIDEBAR_1'),
      templateName: 'templateinstance-sample',
      kind: referenceForModel(TemplateInstanceModel),
    },
    {
      header: t('STRING:TEMPLATEINSTANCE-SIDEBAR_2'),
      details: t('STRING:TEMPLATEINSTANCE-SIDEBAR_3'),
      templateName: 'templateinstance-sample2',
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

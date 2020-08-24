import * as _ from 'lodash-es';
import * as React from 'react';

import { IngressModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const IngressSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:INGRESS-SIDEBAR_0'),
      details: t('STRING:INGRESS-SIDEBAR_1'), // TODO: 번역 적용
      templateName: 'ingress-sample',
      kind: referenceForModel(IngressModel),
    },
    {
      header: t('STRING:INGRESS-SIDEBAR_2'),
      details: t('STRING:INGRESS-SIDEBAR_3'),
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

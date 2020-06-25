import * as _ from 'lodash-es';
import * as React from 'react';

import { RegistryModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const RegistrySidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:REGISTRY-SIDEBAR_0'),
      details: t('STRING:REGISTRY-SIDEBAR_1'),
      templateName: 'registry-sample',
      kind: referenceForModel(RegistryModel),
    },
    {
      header: t('STRING:REGISTRY-SIDEBAR_2'),
      details: t('STRING:REGISTRY-SIDEBAR_3'),
      templateName: 'registry-sample2',
      kind: referenceForModel(RegistryModel),
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

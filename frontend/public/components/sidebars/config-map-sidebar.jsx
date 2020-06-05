import * as _ from 'lodash-es';
import * as React from 'react';

import { ConfigMapModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const ConfigMapSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:CONFIGMAP-SIDEBAR_0'),
      details: t('STRING:CONFIGMAP-SIDEBAR_1'),
      templateName: 'configmap-sample',
      kind: referenceForModel(ConfigMapModel),
    },
    {
      header: t('STRING:CONFIGMAP-SIDEBAR_2'),
      details: t('STRING:CONFIGMAP-SIDEBAR_3'),
      templateName: 'configmap-sample2',
      kind: referenceForModel(ConfigMapModel),
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

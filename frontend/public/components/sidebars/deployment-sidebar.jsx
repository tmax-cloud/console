import * as _ from 'lodash-es';
import * as React from 'react';

import { DeploymentModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const DeploymentSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:DEPLOYMENT-SIDEBAR_0'),
      details: t('STRING:DEPLOYMENT-SIDEBAR_1'),
      templateName: 'deployment-sample',
      kind: referenceForModel(DeploymentModel),
    },
    {
      header: t('STRING:DEPLOYMENT-SIDEBAR_2'),
      details: t('STRING:DEPLOYMENT-SIDEBAR_3'),
      templateName: 'deployment-sample2',
      kind: referenceForModel(DeploymentModel),
    },
    {
      header: t('STRING:DEPLOYMENT-SIDEBAR_4'),
      details: t('STRING:DEPLOYMENT-SIDEBAR_5'),
      templateName: 'deployment-sample3',
      kind: referenceForModel(DeploymentModel),
    },
    {
      header: t('STRING:DEPLOYMENT-SIDEBAR_6'),
      details: t('STRING:DEPLOYMENT-SIDEBAR_7'),
      templateName: 'deployment-sample4',
      kind: referenceForModel(DeploymentModel),
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

import * as _ from 'lodash-es';
import * as React from 'react';

import { ClusterServiceBrokerModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const ClusterServiceBrokerSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:CLUSTERSERVICEBROKER-SIDEBAR_0'),
      details: t('STRING:CLUSTERSERVICEBROKER-SIDEBAR_1'),
      templateName: 'clusterservicebrocker-sample',
      kind: referenceForModel(ClusterServiceBrokerModel),
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

import * as _ from 'lodash-es';
import * as React from 'react';

import { ReplicaSetModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const ReplicaSetSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:REPLICASET-SIDEBAR_0'),
      details: t('STRING:REPLICASET-SIDEBAR_1'),
      templateName: 'replicaset-sample',
      kind: referenceForModel(ReplicaSetModel),
    },
    {
      header: t('STRING:REPLICASET-SIDEBAR_2'),
      details: t('STRING:REPLICASET-SIDEBAR_3'),
      templateName: 'replicaset-sample2',
      kind: referenceForModel(ReplicaSetModel),
    },
    {
      header: t('STRING:REPLICASET-SIDEBAR_4'),
      details: t('STRING:REPLICASET-SIDEBAR_5'),
      templateName: 'replicaset-sample3',
      kind: referenceForModel(ReplicaSetModel),
    },
    {
      header: t('STRING:REPLICASET-SIDEBAR_6'),
      details: t('STRING:REPLICASET-SIDEBAR_7'),
      templateName: 'replicaset-sample4',
      kind: referenceForModel(ReplicaSetModel),
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

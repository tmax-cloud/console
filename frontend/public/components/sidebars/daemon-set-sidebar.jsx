import * as _ from 'lodash-es';
import * as React from 'react';

import { DaemonSetModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const DaemonSetSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:DAEMONSET-SIDEBAR_0'),
      details: t('STRING:DAEMONSET-SIDEBAR_1'),
      templateName: 'daemonset-sample',
      kind: referenceForModel(DaemonSetModel),
    },
    {
      header: t('STRING:DAEMONSET-SIDEBAR_2'),
      details: t('STRING:DAEMONSET-SIDEBAR_3'),
      templateName: 'daemonset-sample2',
      kind: referenceForModel(DaemonSetModel),
    },
    {
      header: t('STRING:DAEMONSET-SIDEBAR_4'),
      details: t('STRING:DAEMONSET-SIDEBAR_5'),
      templateName: 'daemonset-sample3',
      kind: referenceForModel(DaemonSetModel),
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

import * as _ from 'lodash-es';
import * as React from 'react';

import { StatefulSetModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const StatefulSetSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:STATEFULSET-SIDEBAR_0'),
      details: t('STRING:STATEFULSET-SIDEBAR_1'),
      templateName: 'statefulset-sample',
      kind: referenceForModel(StatefulSetModel),
    },
    {
      header: t('STRING:STATEFULSET-SIDEBAR_2'),
      details: t('STRING:STATEFULSET-SIDEBAR_3'),
      templateName: 'statefulset-sample2',
      kind: referenceForModel(StatefulSetModel),
    },
    {
      header: t('STRING:STATEFULSET-SIDEBAR_4'),
      details: t('STRING:STATEFULSET-SIDEBAR_5'),
      templateName: 'statefulset-sample3',
      kind: referenceForModel(StatefulSetModel),
    },
    {
      header: t('STRING:STATEFULSET-SIDEBAR_6'),
      details: t('STRING:STATEFULSET-SIDEBAR_7'),
      templateName: 'statefulset-sample4',
      kind: referenceForModel(StatefulSetModel),
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

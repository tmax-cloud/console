import * as _ from 'lodash-es';
import * as React from 'react';

import { PersistentVolumeClaimModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const PersistentVolumeClaimSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_0'),
      details: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_1'),
      templateName: 'persistentvolumeclaim-sample',
      kind: referenceForModel(PersistentVolumeClaimModel),
    },
    {
      header: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_2'),
      details: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_3'),
      templateName: 'persistentvolumeclaim-sample2',
      kind: referenceForModel(PersistentVolumeClaimModel),
    },
    {
      header: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_4'),
      details: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_5'),
      templateName: 'persistentvolumeclaim-sample3',
      kind: referenceForModel(PersistentVolumeClaimModel),
    },
    {
      header: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_6'),
      details: t('STRING:PERSISTENCEVOLUMECLAIM-SIDEBAR_7'),
      templateName: 'persistentvolumeclaim-sample4',
      kind: referenceForModel(PersistentVolumeClaimModel),
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

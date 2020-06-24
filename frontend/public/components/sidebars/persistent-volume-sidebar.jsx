import * as _ from 'lodash-es';
import * as React from 'react';

import { PersistentVolumeModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const PersistentVolumeSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:PERSISTENTVOLUME-SIDEBAR_0'),
      details: t('STRING:PERSISTENTVOLUME-SIDEBAR_1'),
      templateName: 'persistentvolume-sample',
      kind: referenceForModel(PersistentVolumeModel),
    },
    {
      header: t('STRING:PERSISTENTVOLUME-SIDEBAR_2'),
      details: t('STRING:PERSISTENTVOLUME-SIDEBAR_3'),
      templateName: 'persistentvolume-sample2',
      kind: referenceForModel(PersistentVolumeModel),
    },
    {
      header: t('STRING:PERSISTENTVOLUME-SIDEBAR_4'),
      details: t('STRING:PERSISTENTVOLUME-SIDEBAR_5'),
      templateName: 'persistentvolume-sample3',
      kind: referenceForModel(PersistentVolumeModel),
    },
    {
      header: t('STRING:PERSISTENTVOLUME-SIDEBAR_6'),
      details: t('STRING:PERSISTENTVOLUME-SIDEBAR_7'),
      templateName: 'persistentvolume-sample4',
      kind: referenceForModel(PersistentVolumeModel),
    }
  ];

  return (
    <ol className="co-resource-sidebar-list">
      {_.map(samples, sample => (
        <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};

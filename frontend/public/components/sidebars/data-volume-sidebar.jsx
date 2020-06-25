import * as _ from 'lodash-es';
import * as React from 'react';

import { DataVolumeModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const DataVolumeSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:DATAVOLUME-SIDEBAR_0'),
      details: t('STRING:DATAVOLUME-SIDEBAR_1'),
      templateName: 'datavolume-sample',
      kind: referenceForModel(DataVolumeModel),
    },
    {
      header: t('STRING:DATAVOLUME-SIDEBAR_2'),
      details: t('STRING:DATAVOLUME-SIDEBAR_3'),
      templateName: 'datavolume-sample2',
      kind: referenceForModel(DataVolumeModel),
    },
    {
      header: t('STRING:DATAVOLUME-SIDEBAR_4'),
      details: t('STRING:DATAVOLUME-SIDEBAR_5'),
      templateName: 'datavolume-sample3',
      kind: referenceForModel(DataVolumeModel),
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

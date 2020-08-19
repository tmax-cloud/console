import * as _ from 'lodash-es';
import * as React from 'react';

import { StorageClassModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const StorageClassSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:STORAGECLASS-SIDEBAR_0'),
      details: t('STRING:STORAGECLASS-SIDEBAR_1'),
      templateName: 'storageclass-sample',
      kind: referenceForModel(StorageClassModel),
    },
    {
      header: t('STRING:STORAGECLASS-SIDEBAR_2'),
      details: t('STRING:STORAGECLASS-SIDEBAR_3'),
      templateName: 'storageclass-sample2',
      kind: referenceForModel(StorageClassModel),
    },
    {
      header: t('STRING:STORAGECLASS-SIDEBAR_4'),
      details: t('STRING:STORAGECLASS-SIDEBAR_5'),
      templateName: 'storageclass-sample3',
      kind: referenceForModel(StorageClassModel),
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

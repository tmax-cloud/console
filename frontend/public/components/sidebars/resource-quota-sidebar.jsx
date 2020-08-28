import * as _ from 'lodash-es';
import * as React from 'react';

import { ResourceQuotaModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const ResourceQuotaSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:RESOURCEQUOTA-SIDEBAR_0'),
      details: t('STRING:RESOURCEQUOTA-SIDEBAR_1'),
      templateName: 'resourcequota-sample',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: t('STRING:RESOURCEQUOTA-SIDEBAR_2'),
      details: t('STRING:RESOURCEQUOTA-SIDEBAR_3'),
      templateName: 'resourcequota-sample2',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: t('STRING:RESOURCEQUOTA-SIDEBAR_4'),
      details: t('STRING:RESOURCEQUOTA-SIDEBAR_5'),
      templateName: 'resourcequota-sample3',
      kind: referenceForModel(ResourceQuotaModel),
    },
    {
      header: t('STRING:RESOURCEQUOTA-SIDEBAR_6'),
      details: t('STRING:RESOURCEQUOTA-SIDEBAR_7'),
      templateName: 'resourcequota-sample4',
      kind: referenceForModel(ResourceQuotaModel),
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

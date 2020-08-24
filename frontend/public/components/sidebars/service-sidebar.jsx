import * as _ from 'lodash-es';
import * as React from 'react';

import { ServiceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const ServiceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:SERVICE-SIDEBAR_0'),
      details: t('STRING:SERVICE-SIDEBAR_1'),
      templateName: 'service-sample',
      kind: referenceForModel(ServiceModel),
    },
    {
      header: t('STRING:SERVICE-SIDEBAR_2'),
      details: t('STRING:SERVICE-SIDEBAR_3'),
      templateName: 'service-sample2',
      kind: referenceForModel(ServiceModel),
    },
    {
      header: t('STRING:SERVICE-SIDEBAR_4'),
      details: t('STRING:SERVICE-SIDEBAR_5'),
      templateName: 'service-sample3',
      kind: referenceForModel(ServiceModel),
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

import * as _ from 'lodash-es';
import * as React from 'react';

import { HorizontalPodAutoscalerModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const HPASidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:HPA-SIDEBAR_0'),
      details: t('STRING:HPA-SIDEBAR_1'),
      templateName: 'hpa-sample',
      kind: referenceForModel(HorizontalPodAutoscalerModel),
    },
    {
      header: t('STRING:HPA-SIDEBAR_2'),
      details: t('STRING:HPA-SIDEBAR_3'),
      templateName: 'hpa-sample2',
      kind: referenceForModel(HorizontalPodAutoscalerModel),
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

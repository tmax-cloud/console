import * as _ from 'lodash-es';
import * as React from 'react';

import { PipelineModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const PipelineSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:PIPELINE-SIDEBAR_0'),
      details: t('STRING:PIPELINE-SIDEBAR_1'),
      templateName: 'pipeline-sample',
      kind: referenceForModel(PipelineModel),
    },
    {
      header: t('STRING:PIPELINE-SIDEBAR_2'),
      details: t('STRING:PIPELINE-SIDEBAR_3'),
      templateName: 'pipeline-sample2',
      kind: referenceForModel(PipelineModel),
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

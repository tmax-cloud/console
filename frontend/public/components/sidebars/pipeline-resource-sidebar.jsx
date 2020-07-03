import * as _ from 'lodash-es';
import * as React from 'react';

import { PipelineResourceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const PipelineResourceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:PIPELINERESOURCE-SIDEBAR_0'),
      details: t('STRING:PIPELINERESOURCE-SIDEBAR_1'),
      templateName: 'pipelineresource-sample',
      kind: referenceForModel(PipelineResourceModel),
    },
    {
      header: t('STRING:PIPELINERESOURCE-SIDEBAR_2'),
      details: t('STRING:PIPELINERESOURCE-SIDEBAR_3'),
      templateName: 'pipelineresource-sample2',
      kind: referenceForModel(PipelineResourceModel),
    },
    {
      header: t('STRING:PIPELINERESOURCE-SIDEBAR_4'),
      details: t('STRING:PIPELINERESOURCE-SIDEBAR_5'),
      templateName: 'pipelineresource-sample3',
      kind: referenceForModel(PipelineResourceModel),
    },
    {
      header: t('STRING:PIPELINERESOURCE-SIDEBAR_6'),
      details: t('STRING:PIPELINERESOURCE-SIDEBAR_7'),
      templateName: 'pipelineresource-sample4',
      kind: referenceForModel(PipelineResourceModel),
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

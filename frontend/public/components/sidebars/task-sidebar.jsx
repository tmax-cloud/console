import * as _ from 'lodash-es';
import * as React from 'react';

import { TaskModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const TaskSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:TASK-SIDEBAR_0'),
      details: t('STRING:TASK-SIDEBAR_1'),
      templateName: 'task-sample',
      kind: referenceForModel(TaskModel),
    },
    {
      header: t('STRING:TASK-SIDEBAR_2'),
      details: t('STRING:TASK-SIDEBAR_3'),
      templateName: 'task-sample2',
      kind: referenceForModel(TaskModel),
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

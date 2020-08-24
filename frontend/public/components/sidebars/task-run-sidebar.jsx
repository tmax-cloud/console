import * as _ from 'lodash-es';
import * as React from 'react';

import { TaskRunModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const TaskRunSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:TASKRUN-SIDEBAR_0'),
      details: t('STRING:TASKRUN-SIDEBAR_1'),
      templateName: 'taskrun-sample',
      kind: referenceForModel(TaskRunModel),
    },
    {
      header: t('STRING:TASKRUN-SIDEBAR_2'),
      details: t('STRING:TASKRUN-SIDEBAR_3'),
      templateName: 'taskrun-sample',
      kind: referenceForModel(TaskRunModel),
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

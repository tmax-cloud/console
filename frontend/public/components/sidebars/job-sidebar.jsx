import * as _ from 'lodash-es';
import * as React from 'react';

import { JobModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const JobSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:JOB-SIDEBAR_0'),
      details: t('STRING:JOB-SIDEBAR_1'),
      templateName: 'job-sample',
      kind: referenceForModel(JobModel),
    },
    {
      header: t('STRING:JOB-SIDEBAR_2'),
      details: t('STRING:JOB-SIDEBAR_3'),
      templateName: 'job-sample2',
      kind: referenceForModel(JobModel),
    },
    {
      header: t('STRING:JOB-SIDEBAR_4'),
      details: t('STRING:JOB-SIDEBAR_5'),
      templateName: 'job-sample3',
      kind: referenceForModel(JobModel),
    },
    {
      header: t('STRING:JOB-SIDEBAR_6'),
      details: t('STRING:JOB-SIDEBAR_7'),
      templateName: 'job-sample4',
      kind: referenceForModel(JobModel),
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

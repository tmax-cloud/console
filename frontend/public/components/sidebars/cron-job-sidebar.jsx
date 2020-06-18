import * as _ from 'lodash-es';
import * as React from 'react';

import { CronJobModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const CronJobSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:CRONJOB-SIDEBAR_0'),
      details: t('STRING:CRONJOB-SIDEBAR_1'),
      templateName: 'cronjob-sample',
      kind: referenceForModel(CronJobModel),
    },
    {
      header: t('STRING:CRONJOB-SIDEBAR_2'),
      details: t('STRING:CRONJOB-SIDEBAR_3'),
      templateName: 'cronjob-sample2',
      kind: referenceForModel(CronJobModel),
    },
    {
      header: t('STRING:CRONJOB-SIDEBAR_4'),
      details: t('STRING:CRONJOB-SIDEBAR_5'),
      templateName: 'cronjob-sample3',
      kind: referenceForModel(CronJobModel),
    },
    {
      header: t('STRING:CRONJOB-SIDEBAR_6'),
      details: t('STRING:CRONJOB-SIDEBAR_7'),
      templateName: 'cronjob-sample4',
      kind: referenceForModel(CronJobModel),
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

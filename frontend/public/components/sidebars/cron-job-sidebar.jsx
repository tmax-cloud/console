import * as _ from 'lodash-es';
import * as React from 'react';

import { CronJobModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const CronJobSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '크론 잡 샘플',
      details: `크론 잡(Cron job)은 시간 기반의 일정에 따라 잡을 만들어 작업이 완료 될 때까지 여러 복제본의 pod를 실행 및 관리한다. 크론 잡의 일정은 UTC로 표시된다.
      .apiVersion – kubernetes의 batch/v1 API를 사용한다.
      .kind – Job의 작업으로 명시한다.
      .metadata.name – Job의 이름을 설정한다.
      .spec.schedule – 설정된 시간 마다 잡(job)을 실행하도록 설정
      .spec.jobTemplate – 실행할 잡(job)의 내용을 설정한다.
      (https://kubernetes.io/ko/docs/concepts/workloads/controllers/cron-jobs/)`,
      templateName: 'cronjob-sample',
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

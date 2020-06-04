import * as _ from 'lodash-es';
import * as React from 'react';

import { HorizontalPodAutoscalerModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const HPASidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: ' CPU 설정 HPA 기본 샘플',
      details: `HPA(Horizontal Pod Autoscaler)는 CPU, Memory 등 리소스에 대한 사용량(또는 사용자 정의 메트릭)을 관찰하여 레플리케이션 컨트롤러, 디플로이먼트, 레플리카 셋 또는 스테이트풀 셋의 파드 개수를 자동으로 스케일 한다. Deployment, Replicaset, Statefulset, Replication controller를 통해 HPA를 구성할 수 있다.
      .spec.minReplicas / maxReplicas - 최소 /최대 replicas의 개수에 대한 선언이다.
      .spec.scaleTargetRef – 스케일 대상 타겟 정의에 대한 선언이다.
      .spec.metrics.resource – HPA 구성 리소스 정의에 대한 선언이다.
      .spec.metrics.targetAverageUtilization - CPU사용률에 대한 선언이다.`,
      templateName: 'hpa-sample',
      kind: referenceForModel(HorizontalPodAutoscalerModel),
    },
    {
      header: 'MEMORY 설정 HPA 기본 샘플',
      details: `HPA(Horizontal Pod Autoscaler)는 CPU, Memory 등 리소스에 대한 사용량(또는 사용자 정의 메트릭)을 관찰하여 레플리케이션 컨트롤러, 디플로이먼트, 레플리카 셋 또는 스테이트풀 셋의 파드 개수를 자동으로 스케일 한다. Deployment, Replicaset, Statefulset, Replication controller를 통해 HPA를 구성할 수 있다.
      .spec.minReplicas / maxReplicas - 최소 /최대 replicas의 개수에 대한 선언이다.
      .spec.scaleTargetRef – 스케일 대상 타겟 정의에 대한 선언이다.
      .spec.metrics.resource – HPA 구성 리소스 정의에 대한 선언이다.
      .spec.metrics.targetAverageValue - Memory사용률에 대한 선언이다.`,
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

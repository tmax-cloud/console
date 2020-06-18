import * as _ from 'lodash-es';
import * as React from 'react';

import { DaemonSetModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';

export const DaemonSetSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const samples = [
    {
      header: '데몬 셋 기본 샘플',
      details: `데몬셋은 모든 노드가 파드의 사본을 실행하도록 한다. 데몬셋은 로깅, 모니터링, 네트워킹 등을 위한 에이전트를 각 노드에 생성해야 할 때 사용할 수 있다.
      .apiVersion – kubernetes의 apps/v1 API를 사용 한다.
      .kind: DaemonSet - DaemonSet의 작업을 명시한다.
      .metadata.name - DaemonSet의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .metadata.labels - DaemonSet를 식별할 수 있는 레이블을 지정한다.
      .spec.template.spec.containers - 컨테이너 이름, 이미지, 포트 정보들을 지정한다.
      (https://kubernetes.io/ko/docs/concepts/workloads/controllers/daemonset/)`,
      templateName: 'daemonset-sample',
      kind: referenceForModel(DaemonSetModel),
    },
    {
      header: '데몬 셋 resource 지정 샘플',
      details: `리소스 선언을 통해 총 리소스 사용량을 자체적으로 제한하여 데몬셋을 통해 모든 노드에서 파드의 사본을 실행하도록 한다. 데몬셋은 로깅, 모니터링, 네트워킹 등을 위한 에이전트를 각 노드에 생성해야 할 때 사용할 수 있다.
      .apiVersion – kubernetes의 apps/v1 API를 사용 한다.
      .kind: DaemonSet - DaemonSet의 작업을 명시한다.
      .metadata.name - DaemonSet의 이름을 설정한다.
      .metadata.namespace - 네임스페이스를 지정 한다.
      .metadata.labels - DaemonSet를 식별할 수 있는 레이블을 지정한다.
      .spec.template.spec.container - 컨테이너 이름, 이미지, 포트 정보들을 지정한다.
      (https://kubernetes.io/ko/docs/concepts/workloads/controllers/daemonset/)`,
      templateName: 'daemonset-sample2',
      kind: referenceForModel(DaemonSetModel),
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

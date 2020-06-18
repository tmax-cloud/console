import * as _ from 'lodash-es';
import * as React from 'react';

import { DeploymentModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const DeploymentSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '디플로이먼트 기본 샘플',
      details: `디플로이먼트는 파드와 레플리카셋에 대한 선언적 업데이트를 제공하여, 배포 작업을 세분화하여 조작할 수 있는 기능을 제공한다.
      .apiVersion – kubernetes의 apps/v1 API를 사용 한다.
      .kind: Deployment - Deployment의 작업을 명시한다.
      .metadata.name - 디플로이먼트 이름 선언
      .spec.replicas - 디플로이먼트 레플리카 선언 (파드 유기 개수 설정)
      .spec.selector - 디플로이먼트가 관리할 파드를 찾는 정의
      .spec.template.metadata.label - 디플로이먼트가 관리할 파드를 찾는 정의`,
      templateName: 'deployment-sample',
      kind: referenceForModel(DeploymentModel),
    },
    {
      header: 'DB (mysql-wordpress-pd)디플로이먼트 기본 샘플',
      details: `mysql & workpress를 함께 디플로이먼트로 샘플과 같이 정의할 수 있다.
      .apiVersion – kubernetes의 apps/v1 API를 사용 한다.
      .kind: Deployment - Deployment의 작업을 명시한다.
      .metadata.name - 디플로이먼트 이름 선언`,
      templateName: 'deployment-sample2',
      kind: referenceForModel(DeploymentModel),
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

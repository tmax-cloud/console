import * as _ from 'lodash-es';
import * as React from 'react';

import { JobModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const JobSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      //   highlightText: t('CONTENT:LIMIT'),
      header: '단일 잡 샘플',
      details: `잡(job)은 작업이 완료 될 때까지 여러 복제본의 pod를 실행 및 관리한다. 단일 pod를 실행에서 종료의 라이프사이클을 가진 작업을 진행할 때 사용한다.
      .apiVersion – kubernetes의 batch/v1 API를 사용한다.
      .kind – Job의 작업으로 명시한다.
      .metadata.name – Job의 이름을 설정한다.
      .spec.template.spec.containers – 실행할 컨테이너의 template 설정을 저장한다.
      .spec.template.spec.containers.restartPolicy – Pod의 재시작 정책을 설정한다.
      (https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)`,
      templateName: 'job-sample',
      kind: referenceForModel(JobModel),
    },
    {
      header: '복수 잡 샘플',
      details: `잡(job)은 작업이 완료 될 때까지 여러 복제본의 pod를 실행 및 관리한다. 복수 pod를 실행에서 종료의 라이프사이클을 가진 작업을 진행할 때 사용한다.
      .apiVersion – kubernetes의 batch/v1 API를 사용한다.
      .kind – Job의 작업으로 명시한다.
      .metadata.name – Job의 이름을 설정한다.
      .spec.template.spec.containers – 실행할 컨테이너의 template 설정을 저장한다.
      .spec.template.spec.containers.restartPolicy – Pod의 재시작 정책을 설정한다.
      (https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)`,
      templateName: 'job-sample2',
      kind: referenceForModel(JobModel),
    },
    {
      header: '병렬  잡 샘플',
      details: `잡(job)은 작업이 완료 될 때까지 여러 복제본의 pod를 실행 및 관리한다. 복수 pod를 실행에서 종료의 라이프사이클을 가진 작업을 진행할 때 사용한다.
      .apiVersion – kubernetes의 batch/v1 API를 사용
      .kind – Job의 작업으로 명시
      .metadata.name – Job의 이름을 설정
      .spec.template.spec.containers – 실행할 컨테이너의 template 설정을 저장
      .spec.template.spec.containers.restartPolicy – Pod의 재시작 정책을 설정
      .spec.completions – n개의 pod가 정상 종료 될 경우 잡을 성공처리하는 설정
      .spec.parallelism – 한번에 n개의 pod를 실행하는 설정
      (https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)`,
      templateName: 'job-sample3',
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

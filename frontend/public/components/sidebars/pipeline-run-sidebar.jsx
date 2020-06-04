import * as _ from 'lodash-es';
import * as React from 'react';

import { PipelineRunModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const PipelineRunSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Pipeline Runs',
      details: `파이프라인의 실행을 정의하는 '파이프라인 런'을 생성할 수 있다.
      리소스 이름: 
      (1) serviceAccountName 네임스페이스 내부에 리소스를 생성하기 위해 권한을 가진 서비스 어카운트의 이름
      (2) pipelineRef 파이프라인 런에서 실행할 파이프라인의 이름 
      (3) resourceRef 태스크에서 실행될 컨테이너 이미지가 참조하는 파이프라인 리소스의 상세 명세`,
      templateName: 'pipelinerun-sample',
      kind: referenceForModel(PipelineRunModel),
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

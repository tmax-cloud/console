import * as _ from 'lodash-es';
import * as React from 'react';

import { PipelineResourceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const PipelineResourceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Creat Pipeline Resources',
      details: `파이프라인의 입력(예: Git 저장소) 또는 출력(예: Docker 이미지)을 정의하는 '파이프라인 리소스'를 생성할 수 있다.
      리소스 이름: 
      (1) name 파이프라인 리소스의 이름
      (2) type 파이프라인 리소스 유형
      (3) params 형상관리 저장소 및 레지스트리의 상세 명세`,
      // TODO: yaml 추가하기
      templateName: 'pipelineresource-sample',
      kind: referenceForModel(PipelineResourceModel),
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

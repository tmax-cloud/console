import * as _ from 'lodash-es';
import * as React from 'react';

import { TaskModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const TaskSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Task',
      details: `코드 컴파일, 테스트 실행 및 이미지 빌드와 배치 같은 빌드 단계 세트를 정의하는 태스크를 생성한다.
      리소스 이름: 
      (1) name 태스크의 이름
      (2) inputs 태스크에서 참조하는 파이프라인 리소스의 상세 명세
      (3) outputs 태스크 실행 완료 후 생성될 결과물의 상세 명세
      (4) params 실행할 컨테이너 이미지에 정의된 커맨드 인자(args)에서 참조하는 파라미터의 상세 명세
      (5) steps 실행할 컨테이너 이미지의 상세 명세`,
      templateName: 'task-sample',
      kind: referenceForModel(TaskModel),
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

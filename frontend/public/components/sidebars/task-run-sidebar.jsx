import * as _ from 'lodash-es';
import * as React from 'react';

import { TaskRunModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const TaskRunSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Task Runs',
      details: `태스크의 실행을 정의하는 '태스크 런'을 생성할 수 있다.
      리소스 이름: 
      (1) serviceAccountName 네임스페이스 내부에 리소스를 생성하기 위해 권한을 가진 서비스 어카운트의 이름
      (2) taskRef 태스크 런에서 실행할 태스크의 상세 명세
      (3) inputs 태스크에서 실행될 컨테이너 이미지가 참조하는 파이프라인 리소스의 상세 명세
      (4) outputs 태스크 실행 완료 후 생성될 결과물의 상세 명세
      (5) params 태스크에서 실행될 컨테이너 이미지가 참조하는 파라미터의 상세 명세`,
      // TODO: yaml 추가하기
      templateName: 'taskrun-sample',
      kind: referenceForModel(TaskRunModel),
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

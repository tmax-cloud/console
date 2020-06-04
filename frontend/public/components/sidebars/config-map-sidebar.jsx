import * as _ from 'lodash-es';
import * as React from 'react';

import { ConfigMapModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ConfigMapSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '컨피그 맵 샘플',
      details: '컨피그맵은 키가 아닌 값으로 비 기밀 데이터를 저장하는데 사용하는 API 객체이다. 포드는 환경 변수, command-line 인수 또는 볼륨의 구성 파일로 config maps를 사용할 수 있다. 컨피그맵을 사용하면 컨테이너 이미지에서 환경 별 구성을 분리할 수 있다.',
      templateName: 'configmap-sample',
      kind: referenceForModel(ConfigMapModel),
    },
    {
      header: 'db 컨피그 맵 샘플',
      details: '컨피그맵은 키가 아닌 값으로 비 기밀 데이터를 저장하는데 사용하는 API 객체이다. 포드는 환경 변수, command-line 인수 또는 볼륨의 구성 파일로 config maps를 사용할 수 있다.  컨피그맵을 사용하면 컨테이너 이미지에서 환경 별 구성을 분리할 수 있다.',
      templateName: 'configmap-sample2',
      kind: referenceForModel(ConfigMapModel),
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

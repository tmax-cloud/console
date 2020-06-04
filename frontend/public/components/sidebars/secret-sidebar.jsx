import * as _ from 'lodash-es';
import * as React from 'react';

import { SecretModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const SecretSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: '시크릿 샘플',
      details: '시크릿은 컨피그맵과 유사하지만 민감한 정보를 저장하는 용도로 사용한다. (ex. Password, token key, ssh key…)',
      templateName: 'secret-sample',
      kind: referenceForModel(SecretModel),
    },
    {
      header: '시크릿 샘플',
      details: '시크릿은 컨피그맵과 유사하지만 민감한 정보를 저장하는 용도로 사용한다. (ex. Password, token key, ssh key…)',
      templateName: 'secret-sample2',
      kind: referenceForModel(SecretModel),
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

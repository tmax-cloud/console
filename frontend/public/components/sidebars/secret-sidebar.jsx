import * as _ from 'lodash-es';
import * as React from 'react';

import { SecretModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const SecretSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:SECRET-SIDEBAR_0'),
      details: t('STRING:SECRET-SIDEBAR_1'),
      templateName: 'secret-sample',
      kind: referenceForModel(SecretModel),
    },
    {
      header: t('STRING:SECRET-SIDEBAR_2'),
      details: t('STRING:SECRET-SIDEBAR_3'),
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

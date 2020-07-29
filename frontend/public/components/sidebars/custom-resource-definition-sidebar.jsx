import * as _ from 'lodash-es';
import * as React from 'react';

import { CustomResourceDefinitionModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const CustomResourceDefinitionSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:CUSTOMRESOURCEDEFINITION-SIDEBAR_0'),
      details: t('STRING:CUSTOMRESOURCEDEFINITION-SIDEBAR_1'),
      templateName: 'customresourcedefinition-sample',
      kind: referenceForModel(CustomResourceDefinitionModel),
    },
    {
      header: t('STRING:CUSTOMRESOURCEDEFINITION-SIDEBAR_2'),
      details: t('STRING:CUSTOMRESOURCEDEFINITION-SIDEBAR_3'),
      templateName: 'customresourcedefinition-sample2',
      kind: referenceForModel(CustomResourceDefinitionModel),
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

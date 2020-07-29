import * as _ from 'lodash-es';
import * as React from 'react';

import { NamespaceClaimModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const NamespaceClaimSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:NAMESPACECLAIM-SIDEBAR_0'),
      details: t('STRING:NAMESPACECLAIM-SIDEBAR_1'),
      templateName: 'namespaceclaim-sample',
      kind: referenceForModel(NamespaceClaimModel),
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

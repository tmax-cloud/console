import * as _ from 'lodash-es';
import * as React from 'react';

import { FederatedNamespaceModel, FederatedDeploymentModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const FederatedResourceSidebar = ({ kindObj, loadSampleYaml, downloadSampleYaml, isCreateMode }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Federated Namespace',
      templateName: 'federated-namespace',
      kind: referenceForModel(FederatedNamespaceModel),
    },
    {
      header: 'Federated Deployment',
      templateName: 'federated-deployment',
      kind: referenceForModel(FederatedDeploymentModel),
    },
  ];
  const filteredSamples = isCreateMode ? samples : _.filter(samples, { kind: referenceForModel(kindObj) });
  console.log(filteredSamples);
  return (
    <ol className="co-resource-sidebar-list">
      {_.map(filteredSamples, sample => {
        return <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />;
      })}
    </ol>
  );
};

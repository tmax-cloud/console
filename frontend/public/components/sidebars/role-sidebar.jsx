import * as _ from 'lodash-es';
import * as React from 'react';

import { RoleModel, ClusterRoleModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const RoleSidebar = ({ kindObj, loadSampleYaml, downloadSampleYaml, isCreateMode }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:ROLE-SIDEBAR_0'),
      details: t('STRING:ROLE-SIDEBAR_1'),
      templateName: 'read-pods-within-ns',
      kind: referenceForModel(RoleModel),
    },
    {
      header: t('STRING:ROLE-SIDEBAR_2'),
      details: t('STRING:ROLE-SIDEBAR_3'),
      templateName: 'read-write-deployment-in-ext-and-apps-apis',
      kind: referenceForModel(RoleModel),
    },
    {
      header: t('STRING:ROLE-SIDEBAR_4'),
      details: t('STRING:ROLE-SIDEBAR_5'),
      templateName: 'read-pods-and-read-write-jobs',
      kind: referenceForModel(RoleModel),
    },
    {
      header: t('STRING:ROLE-SIDEBAR_6'),
      subheader: t('CONTENT:FORROLEBINDING'),
      details: t('STRING:ROLE-SIDEBAR_7'),
      templateName: 'read-configmap-within-ns',
      kind: referenceForModel(RoleModel),
    },
    {
      header: t('STRING:ROLE-SIDEBAR_8'),
      subheader: t('CONTENT:FORCLUSTERROLEBINDING'),
      details: t('STRING:ROLE-SIDEBAR_9'),
      templateName: 'read-nodes',
      kind: referenceForModel(ClusterRoleModel),
    },
    {
      header: t('STRING:ROLE-SIDEBAR_10'),
      subheader: t('CONTENT:FORCLUSTERROLEBINDING'),
      details: t('STRING:ROLE-SIDEBAR_11'),
      templateName: 'get-and-post-to-non-resource-endpoints',
      kind: referenceForModel(ClusterRoleModel),
    },
  ];
  const filteredSamples = isCreateMode ? samples : _.filter(samples, { 'kind': referenceForModel(kindObj) });
  return <ol className="co-resource-sidebar-list">
    {_.map(filteredSamples, (sample) => <SampleYaml
      key={sample.templateName}
      sample={sample}
      loadSampleYaml={loadSampleYaml}
      downloadSampleYaml={downloadSampleYaml} />)}
  </ol>;
};

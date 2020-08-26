import * as _ from 'lodash-es';
import * as React from 'react';

import { PodSecurityPolicyModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const PodSecurityPolicySidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      header: t('STRING:PODSECURITYPOLICY-SIDEBAR_0'),
      details: t('STRING:PODSECURITYPOLICY-SIDEBAR_1'),
      templateName: 'podsecuritypolicy-sample',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
    {
      header: t('STRING:PODSECURITYPOLICY-SIDEBAR_2'),
      details: t('STRING:PODSECURITYPOLICY-SIDEBAR_3'),
      templateName: 'podsecuritypolicy-sample2',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
    {
      header: t('STRING:PODSECURITYPOLICY-SIDEBAR_4'),
      details: t('STRING:PODSECURITYPOLICY-SIDEBAR_5'),
      templateName: 'podsecuritypolicy-sample3',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
    {
      header: t('STRING:PODSECURITYPOLICY-SIDEBAR_6'),
      details: t('STRING:PODSECURITYPOLICY-SIDEBAR_7'),
      templateName: 'podsecuritypolicy-sample4',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
    {
      header: t('STRING:PODSECURITYPOLICY-SIDEBAR_8'),
      details: t('STRING:PODSECURITYPOLICY-SIDEBAR_9'),
      templateName: 'podsecuritypolicy-sample5',
      kind: referenceForModel(PodSecurityPolicyModel),
    },
    {
      header: t('STRING:PODSECURITYPOLICY-SIDEBAR_10'),
      details: t('STRING:PODSECURITYPOLICY-SIDEBAR_11'),
      templateName: 'podsecuritypolicy-sample6',
      kind: referenceForModel(PodSecurityPolicyModel),
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

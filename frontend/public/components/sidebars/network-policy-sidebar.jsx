import * as _ from 'lodash-es';
import * as React from 'react';

import * as denyOtherNamespacesImg from '../../imgs/network-policy-samples/1-deny-other-namespaces.svg';
import * as limitCertainAppImg from '../../imgs/network-policy-samples/2-limit-certain-apps.svg';
import * as allowIngressImg from '../../imgs/network-policy-samples/3-allow-ingress.svg';
import * as defaultDenyAllImg from '../../imgs/network-policy-samples/4-default-deny-all.svg';
import * as webAllowExternalImg from '../../imgs/network-policy-samples/5-web-allow-external.svg';
import * as webDbAllowAllNsImg from '../../imgs/network-policy-samples/6-web-db-allow-all-ns.svg';
import * as webAllowProductionImg from '../../imgs/network-policy-samples/7-web-allow-production.svg';
import { NetworkPolicyModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';


export const NetworkPolicySidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  const { t } = useTranslation();
  const samples = [
    {
      highlightText: t('CONTENT:LIMIT'),
      header: t('STRING:NETWORKPOLICY-CREATE_0'),
      img: denyOtherNamespacesImg,
      details: t('STRING:NETWORKPOLICY-CREATE_1'),
      templateName: 'deny-other-namespaces',
      kind: referenceForModel(NetworkPolicyModel),
    },
    {
      highlightText: t('CONTENT:LIMIT'),
      header: t('STRING:NETWORKPOLICY-CREATE_2'),
      img: limitCertainAppImg,
      details: t('STRING:NETWORKPOLICY-CREATE_3'),
      templateName: 'db-or-api-allow-app',
      kind: referenceForModel(NetworkPolicyModel),
    },
    {
      highlightText: t('CONTENT:ALLOW'),
      header: t('STRING:NETWORKPOLICY-CREATE_4'),
      img: allowIngressImg,
      details: t('STRING:NETWORKPOLICY-CREATE_5'),
      templateName: 'api-allow-http-and-https',
      kind: referenceForModel(NetworkPolicyModel),
    },
    {
      highlightText: t('CONTENT:DENY'),
      header: t('STRING:NETWORKPOLICY-CREATE_6'),
      img: defaultDenyAllImg,
      details: t('STRING:NETWORKPOLICY-CREATE_7'),
      templateName: 'default-deny-all',
      kind: referenceForModel(NetworkPolicyModel),
    },
    {
      highlightText: t('CONTENT:ALLOW'),
      header: t('STRING:NETWORKPOLICY-CREATE_8'),
      img: webAllowExternalImg,
      details: t('STRING:NETWORKPOLICY-CREATE_9'),
      templateName: 'web-allow-external',
      kind: referenceForModel(NetworkPolicyModel),
    },
    {
      highlightText: t('CONTENT:ALLOW'),
      header: t('STRING:NETWORKPOLICY-CREATE_10'),
      img: webDbAllowAllNsImg,
      details: t('STRING:NETWORKPOLICY-CREATE_11'),
      templateName: 'web-db-allow-all-ns',
      kind: referenceForModel(NetworkPolicyModel),
    },
    {
      highlightText: t('CONTENT:ALLOW'),
      header: t('STRING:NETWORKPOLICY-CREATE_12'),
      img: webAllowProductionImg,
      details: t('STRING:NETWORKPOLICY-CREATE_13'),
      templateName: 'web-allow-production',
      kind: referenceForModel(NetworkPolicyModel),
    },
  ];

  return <ol className="co-resource-sidebar-list">
    {_.map(samples, (sample) => <SampleYaml
      key={sample.templateName}
      sample={sample}
      loadSampleYaml={loadSampleYaml}
      downloadSampleYaml={downloadSampleYaml} />)}
  </ol>
};

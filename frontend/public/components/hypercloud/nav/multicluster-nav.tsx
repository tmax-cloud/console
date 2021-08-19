import * as React from 'react';
// import { referenceForModel } from '../../module/k8s';
// import { ExternalLink, HrefLink, ResourceNSLink, ResourceClusterLink } from './items';
import { ResourceNSLink, Separator } from '../../nav/items';
import { NavSection } from '../../nav/section';
import { Translation } from 'react-i18next';
// import { ALL_NAMESPACES_KEY } from '../../../../packages/console-shared/src/constants/common';

const clustermanagersStartsWith = ['clustermanagers', 'clusterclaims', 'clusterregistrations'];

const MulticlusterNav = () => (
  <Translation>
    {t => (
      <>
        {/* <NavSection title={t('COMMON:MSG_LNB_MENU_105')} isSingleChild={true}>
          <ResourceNSLink resource="clusterclaims" name={t('COMMON:MSG_LNB_MENU_105')} />
        </NavSection> */}
        <NavSection title={t('COMMON:MSG_LNB_MENU_84')} isSingleChild={true}>
          <ResourceNSLink resource="clustermanagers" name={t('COMMON:MSG_LNB_MENU_84')} startsWith={clustermanagersStartsWith} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_201')} isSingleChild={true}>
          <ResourceNSLink resource="tfapplyclaims" name={t('COMMON:MSG_LNB_MENU_201')} />
        </NavSection>
        {/* <ResourceClusterLink resource="clustergroups" name="Cluster Groups" /> */}
        <NavSection title={t('COMMON:MSG_LNB_MENU_86')}>
          {/* <NavGroup title={t('COMMON:MSG_LNB_MENU_22')}> */}
          <ResourceNSLink resource="federatedpods" name={t('COMMON:MSG_LNB_MENU_23')} />
          <ResourceNSLink resource="federateddeployments" name={t('COMMON:MSG_LNB_MENU_24')} />
          <ResourceNSLink resource="federatedreplicasets" name={t('COMMON:MSG_LNB_MENU_31')} />
          <ResourceNSLink resource="federatedhorizontalpodautoscalers" name={t('COMMON:MSG_LNB_MENU_32')} />
          <ResourceNSLink resource="federateddaemonsets" name={t('COMMON:MSG_LNB_MENU_30')} />
          <ResourceNSLink resource="federatedstatefulsets" name={t('COMMON:MSG_LNB_MENU_25')} />
          <ResourceNSLink resource="federatedconfigmaps" name={t('COMMON:MSG_LNB_MENU_27')} />
          <ResourceNSLink resource="federatedsecrets" name={t('COMMON:MSG_LNB_MENU_26')} />
          <ResourceNSLink resource="federatedjobs" name={t('COMMON:MSG_LNB_MENU_29')} />
          <ResourceNSLink resource="federatedcronjobs" name={t('COMMON:MSG_LNB_MENU_28')} />
          {/* </NavGroup> */}
          <Separator name="WorkloadsSeparator" />
          {/* <NavGroup title={t('COMMON:MSG_LNB_MENU_46')}> */}
          <ResourceNSLink resource="federatedingresses" name={t('COMMON:MSG_LNB_MENU_48')} />
          <ResourceNSLink resource="federatedservices" name={t('COMMON:MSG_LNB_MENU_47')} />
          {/* </NavGroup> */}
          <Separator name="NetworksSeparator" />
          {/* <NavGroup title={t('COMMON:MSG_LNB_MENU_79')}> */}
          <ResourceNSLink resource="federatednamespaces" name={t('COMMON:MSG_LNB_MENU_3')} />
          {/* </NavGroup> */}
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_197')}>
          <ResourceNSLink resource="awxs" name={t('COMMON:MSG_LNB_MENU_199')} />
        </NavSection>
        {/* <NavSection title="Image">
      <ResourceClusterLink resource="federatedregistries" name="Registry" />
      <ResourceClusterLink resource="federatedimagesigners" name="Image Signer" />
      <ResourceClusterLink resource="federatedimagesignrequests" name="Image Sign Request" />
      <ResourceClusterLink resource="federatedimagetransfers" name="Image Transfer" />
    </NavSection> */}
      </>
    )}
  </Translation>
);

export default MulticlusterNav;

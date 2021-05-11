import * as React from 'react';

import { Translation } from 'react-i18next';
import { ResourceNSLink, ResourceClusterLink, NewTabLink, HrefLink } from '../../nav/items';
import { NavSection } from '../../nav/section';

const DeveloperNav = () => (
  <Translation>
    {t => (
      <>
        <NavSection title='+ Add' isSingleChild={true}>
          <HrefLink href='/add' activePath='/add/' name='+ Add' />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_10')}>
          <ResourceNSLink resource="servicebrokers" name={t('COMMON:MSG_LNB_MENU_11')} />
          <ResourceNSLink resource="serviceclasses" name={t('COMMON:MSG_LNB_MENU_12')} />
          {/* <ResourceNSLink resource="serviceplans" name="Service Plan" /> */}
          <ResourceClusterLink resource="clusterservicebrokers" name={t('COMMON:MSG_LNB_MENU_14')} />
          <ResourceClusterLink resource="clusterserviceclasses" name={t('COMMON:MSG_LNB_MENU_15')} />
          {/* <ResourceClusterLink resource="clusterserviceplans" name="Cluster Service Plan" /> */}
          <ResourceNSLink resource="serviceinstances" name={t('COMMON:MSG_LNB_MENU_17')} />
          <ResourceNSLink resource="servicebindings" name={t('COMMON:MSG_LNB_MENU_18')} />
          <ResourceNSLink resource="catalogserviceclaims" name={t('COMMON:MSG_LNB_MENU_19')} />
          <ResourceNSLink resource="templates" name={t('COMMON:MSG_LNB_MENU_20')} />
          <ResourceClusterLink resource="clustertemplates" name={t('COMMON:MSG_LNB_MENU_104')} />
          <ResourceNSLink resource="templateinstances" name={t('COMMON:MSG_LNB_MENU_21')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_35')}>
          <ResourceNSLink resource="virtualservices" name={t('COMMON:MSG_LNB_MENU_36')} />
          <ResourceNSLink resource="destinationrules" name={t('COMMON:MSG_LNB_MENU_37')} />
          <ResourceNSLink resource="envoyfilters" name={t('COMMON:MSG_LNB_MENU_38')} />
          <ResourceNSLink resource="gateways" name={t('COMMON:MSG_LNB_MENU_39')} />
          <ResourceNSLink resource="sidecars" name={t('COMMON:MSG_LNB_MENU_40')} />
          <ResourceNSLink resource="serviceentries" name={t('COMMON:MSG_LNB_MENU_41')} />
          <ResourceNSLink resource="requestauthentications" name={t('COMMON:MSG_LNB_MENU_42')} />
          <ResourceNSLink resource="peerauthentications" name={t('COMMON:MSG_LNB_MENU_43')} />
          <ResourceNSLink resource="authorizationpolicies" name={t('COMMON:MSG_LNB_MENU_44')} />
          {/* <HrefLink href="/kiali" name={t('COMMON:MSG_LNB_MENU_45')} /> */}
          <NewTabLink name={t('COMMON:MSG_LNB_MENU_45')} type="kiali" />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_56')}>
          <ResourceNSLink resource="tasks" name={t('COMMON:MSG_LNB_MENU_57')} />
          <ResourceClusterLink resource="clustertasks" name={t('COMMON:MSG_LNB_MENU_94')} />
          <ResourceNSLink resource="taskruns" name={t('COMMON:MSG_LNB_MENU_58')} />
          <ResourceNSLink resource="pipelines" name={t('COMMON:MSG_LNB_MENU_59')} />
          <ResourceNSLink resource="pipelineruns" name={t('COMMON:MSG_LNB_MENU_60')} />
          <ResourceNSLink resource="approvals" name={t('COMMON:MSG_LNB_MENU_61')} />
          <ResourceNSLink resource="pipelineresources" name={t('COMMON:MSG_LNB_MENU_62')} />
          <ResourceNSLink resource="integrationjobs" name={t('COMMON:MSG_LNB_MENU_185')} />
          <ResourceNSLink resource="integrationconfigs" name={t('COMMON:MSG_LNB_MENU_183')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_64')}>
          <ResourceNSLink resource="notebooks" name={t('COMMON:MSG_LNB_MENU_65')} />
          <ResourceNSLink resource="experiments" name="Experiment" />
          <ResourceNSLink resource="trainingjobs" name={t('COMMON:MSG_LNB_MENU_68')} />
          <ResourceNSLink resource="inferenceservices" name={t('COMMON:MSG_LNB_MENU_192')} />
          <ResourceNSLink resource="trainedmodels" name="Trained Model" />
          <ResourceNSLink resource="workflowtemplates" name={t('COMMON:MSG_LNB_MENU_69')} />
          <ResourceNSLink resource="workflows" name={t('COMMON:MSG_LNB_MENU_70')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_3')}>
          <ResourceNSLink resource="registries" name={t('COMMON:MSG_LNB_MENU_187')} />
          <ResourceNSLink resource="externalregistries" name={t('COMMON:MSG_LNB_MENU_189')} />
          <ResourceClusterLink resource="imagesigners" name={t('COMMON:MSG_LNB_MENU_91')} />
          <ResourceNSLink resource="imagesignrequests" name={t('COMMON:MSG_LNB_MENU_92')} />
          <ResourceNSLink resource="imagescanrequests" name={t('COMMON:MSG_LNB_MENU_95')} />
          <ResourceNSLink resource="signerpolicies" name={t('COMMON:MSG_LNB_MENU_96')} />
          <ResourceNSLink resource="imagereplicates" name={t('COMMON:MSG_LNB_MENU_93')} />
        </NavSection>
      </>
    )}
  </Translation>
);

export default DeveloperNav;
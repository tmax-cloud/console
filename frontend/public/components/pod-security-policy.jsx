import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete, Cog.factory.EditStatus];

const PodSecurityPolicyHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.privileged">
        {t('CONTENT:PRIVILEGED')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.seLinux.rule">
        {t('CONTENT:SELINUX')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.runAsUser.rule">
        {t('CONTENT:RUNASUSER')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.fsGroup.rule">
        {t('CONTENT:FSGROUP')}
      </ColHead>
      <ColHead {...props} className="col-xs-1 col-sm-1" sortField="spec.supplementalGroups.rule">
        {t('CONTENT:SUPPLEMENTALGROUP')}
      </ColHead>
      <ColHead {...props} className="col-sm-1 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const PodSecurityPolicyRow = () =>
  // eslint-disable-next-line no-shadow
  function PodSecurityPolicyRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="PodSecurityPolicy" resource={obj} />
          <ResourceLink kind="PodSecurityPolicy" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.privileged ? 'True' : 'False'}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.seLinux.rule}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.runAsUser.rule}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.fsGroup.rule}</div>
        <div className="col-xs-1 col-sm-1 hidden-xs">{obj.spec.supplementalGroups.rule}</div>
        <div className="col-xs-1 col-sm-1 hidden-xs">{obj.spec.privileged}</div>
        <div className="col-xs-1 col-sm-1 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

// const DetailsForKind = kind =>
//   function DetailsForKind_({ obj }) {
//     return (
//       <React.Fragment>
//         <div className="co-m-pane__body">
//           <SectionHeading text={`${kindForReference(kind)} Overview`} />
//           <ResourceSummary
//             resource={obj}
//             podSelector="spec.podSelector"
//             showNodeSelector={false}
//           />
//         </div>
//       </React.Fragment>
//     );
//   };

const Details = ({ obj: podsecuritypolicy }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('PodSecurityPolicy', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={podsecuritypolicy} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:PRIVILEGED')}</dt>
              <dd>{podsecuritypolicy.spec.privileged ? 'True' : 'False'}</dd>
              <dt>{t('CONTENT:SELINUX')}</dt>
              <dd>{podsecuritypolicy.spec.seLinux.rule}</dd>
              <dt>{t('CONTENT:RUNASUSER')}</dt>
              <dd>{podsecuritypolicy.spec.runAsUser.rule}</dd>
              <dt>{t('CONTENT:FSGROUP')}</dt>
              <dd>{podsecuritypolicy.spec.fsGroup.rule}</dd>
              <dt>{t('CONTENT:SUPPLEMENTALGROUP')}</dt>
              <dd>{podsecuritypolicy.spec.supplementalGroups.rule}</dd>
              {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const PodSecurityPolicyList = props => {
  const { kinds } = props;
  const Row = PodSecurityPolicyRow(kinds[0]);
  Row.displayName = 'PodSecurityPolicyRow';
  return <List {...props} Header={PodSecurityPolicyHeader} Row={Row} />;
};
PodSecurityPolicyList.displayName = PodSecurityPolicyList;

export const PodSecurityPoliciesPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={PodSecurityPolicyList} canCreate={true} kind="PodSecurityPolicy" createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};
PodSecurityPoliciesPage.displayName = 'PodSecurityPoliesPage';

export const PodSecurityPoliciesDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      // breadcrumbsFor={obj =>
      //   breadcrumbsForOwnerRefs(obj).concat({
      //     name: 'Namespace Claim Details',
      //     path: props.match.url,
      //   })
      // }
      kind="PodSecurityPolicy"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};

PodSecurityPoliciesDetailsPage.displayName = 'PodSecurityPoliciesDetailsPage';

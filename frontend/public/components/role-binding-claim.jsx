import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete, Cog.factory.EditStatus];

const RoleBindingClaimHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="status.status">
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="resourceName">
        {t('CONTENT:RESOURCENAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  )
};

const RoleBindingClaimRow = () =>
  // eslint-disable-next-line no-shadow
  function RoleBindingClaimRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="RoleBindingClaim" resource={obj} />
          <ResourceLink kind="RoleBindingClaim" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.status && obj.status.status}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.resourceName}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const Details = ({ obj: rolebindingclaim }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('ROLEBINDINGCLAIM', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={rolebindingclaim} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt> {t('CONTENT:RESOURCENAME')}</dt>
              <dd>{rolebindingclaim.resourceName}</dd>
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{rolebindingclaim.status && rolebindingclaim.status.status}</dd>
              {rolebindingclaim.status && rolebindingclaim.status.reason && <dt>{t('CONTENT:REASON')}</dt>}
              {rolebindingclaim.status && rolebindingclaim.status.reason && <dd>{rolebindingclaim.status.reason}</dd>}
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

export const RoleBindingClaimList = props => {
  const { kinds } = props;
  const Row = RoleBindingClaimRow(kinds[0]);
  Row.displayName = 'RoleBindingClaimRow';
  return <List {...props} Header={RoleBindingClaimHeader} Row={Row} />;
};
RoleBindingClaimList.displayName = RoleBindingClaimList;

export const RoleBindingClaimsPage = props => {
  const { t } = useTranslation();
  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };
  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/rolebindingclaims/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  return <ListPage {...props} ListComponent={RoleBindingClaimList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="RoleBindingClaim" createProps={createProps}{...props} />
};
RoleBindingClaimsPage.displayName = 'RoleBindingClaimsPage';

export const RoleBindingClaimsDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind="RoleBindingClaim"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  )
};

RoleBindingClaimsDetailsPage.displayName = 'RoleBindingClaimsDetailsPage';

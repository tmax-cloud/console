import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, MultiListPage, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];
const HDCModeFlag = window.SERVER_FLAGS.HDCModeFlag;

const FederatedResourceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-6 col-sm-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>

      <ColHead {...props} className="col-sm-6 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const FederatedResourceRow = () =>
  // eslint-disable-next-line no-shadow
  function FederatedResourceRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          {!HDCModeFlag && <ResourceCog actions={menuActions} kind={obj.kind} resource={obj} />}
          <ResourceLink kind={obj.kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-6 col-sm-6 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural(obj.kind, t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const FederatedResourceList = props => {
  const { kinds } = props;
  const Row = FederatedResourceRow(kinds[0]);
  Row.displayName = 'FederatedResourceRow';
  return <List {...props} Header={FederatedResourceHeader} Row={Row} />;
};
FederatedResourceList.displayName = FederatedResourceList;

export const FederatedResourcesPage = props => {
  const { t } = useTranslation();
  return HDCModeFlag ? (
    <ListPage {...props} ListComponent={FederatedResourceList} canCreate={false} kind={props.kind} />
  ) : (
    <MultiListPage
      ListComponent={FederatedResourceList}
      canCreate={true}
      // showTitle={show?space}
      createProps={{ to: `/k8s/ns/${props.namespace || 'default'}/federatedresources/new` }}
      // filterLabel="Roles by name"
      flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })}
      resources={[
        // { kind: 'FederatedNamespace', namespaced: true, optional: !projectsAvailable },
        // { kind: 'FederatedDeployment', namespaced: false, optional: true },
        { kind: 'FederatedNamespace', namespaced: true, optional: true },
        { kind: 'FederatedDeployment', namespaced: false, optional: true },
      ]}
      // rowFilters={[
      //   {
      //     type: 'role-kind',
      //     selected: ['cluster', 'namespace'],
      //     reducer: roleType,
      //     items: [
      //       { id: 'cluster', title: t('CONTENT:CLUSTER-WIDEROLES') },
      //       { id: 'namespace', title: t('CONTENT:NAMESPACEROLES') },
      //       { id: 'system', title: t('CONTENT:SYSTEMROLES') },
      //     ],
      //   },
      // ]}
      title="Federated Resource"
    />
  );

  // <ListPage {...props} ListComponent={FederatedResourceList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="FederatedResource" />;
};
FederatedResourcesPage.displayName = 'FederatedResourcesPage';

export const FederatedResourcesDetailsPage = props => {
  const { t } = useTranslation();
  let menu = HDCModeFlag ? null : menuActions;
  let page = HDCModeFlag ? [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW'))] : [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} kind={props.kind} menuActions={menu} pages={page} />;
};

FederatedResourcesDetailsPage.displayName = 'FederatedResourcesDetailsPage';

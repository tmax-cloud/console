import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ColHead, DetailsPage, List, ListHeader, MultiListPage, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, kindObj, ResourceIcon, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { referenceForCRD } from '../module/k8s';
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
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 col-xs-6" sortField="spec.group">
        {t('CONTENT:GROUP')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 hidden-xs" sortField="spec.version">
        {t('CONTENT:VERSION')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.scope">
        {t('CONTENT:NAMESPACED')}
      </ColHead>
      <ColHead {...props} className="col-lg-1 hidden-md hidden-sm hidden-xs">
        {t('CONTENT:ESTABLISHED')}
      </ColHead>
    </ListHeader>
  );
};

const isEstablished = conditions => {
  const condition = _.find(conditions, c => c.type === 'Established');
  return condition && condition.status === 'True';
};
const namespaced = crd => crd.spec.scope === 'Namespaced';

const FederatedResourceRow = () =>
  // eslint-disable-next-line no-shadow
  function FederatedResourceRow({ obj }) {
    let ko = kindObj(obj.spec.names.kind);
    let path;
    // default-resource 쓸건지, 따로 만든 페이지 쓸건지
    if (!_.isEmpty(ko)) {
      path = obj.spec && obj.spec.scope === 'Cluster' ? `/k8s/cluster/${obj.spec.names.plural}` : `/k8s/all-namespaces/${obj.spec.names.plural}`;
    } else {
      path = obj.spec && obj.spec.scope === 'Cluster' ? `/k8s/cluster/${referenceForCRD(obj)}` : `/k8s/all-namespaces/${referenceForCRD(obj)}`;
    }
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="CustomResourceDefinition" resource={obj} />
          <ResourceIcon kind="CustomResourceDefinition" />
          <Link to={path}>{_.get(obj, 'spec.names.kind', obj.metadata.name)}</Link>
          {/* {!HDCModeFlag && <ResourceCog actions={menuActions} kind={obj.kind} resource={obj} />}
          <ResourceLink kind={obj.kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} /> */}
        </div>
        <div className="col-lg-3 col-md-4 col-sm-4 col-xs-6 co-break-word">{obj.spec.group}</div>
        <div className="col-lg-2 col-md-2 col-sm-4 hidden-xs">{obj.spec.version}</div>
        {/* <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{namespaced(obj) ? t('CONTENT:YES') : t('CONTENT:NO')}</div> */}
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{namespaced(obj) ? 'YES' : 'NO'}</div>
        <div className="col-lg-1 hidden-md hidden-sm hidden-xs">
          {isEstablished(obj.status.conditions) ? (
            <span className="node-ready">
              <i className="fa fa-check-circle"></i>
            </span>
          ) : (
            <span className="node-not-ready">
              <i className="fa fa-minus-circle"></i>
            </span>
          )}
        </div>
        {/* <div className="col-xs-4 col-sm-4 hidden-xs">{obj.metadata.namespace}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div> */}
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

  const {
    match: {
      params: { ns },
    },
  } = props;

  let resources = [{ kind: 'CustomResourceDefinition', namespaced: false, group: 'types.kubefed.io' }];
  return HDCModeFlag ? (
    <ListPage {...props} ListComponent={FederatedResourceList} canCreate={false} kind={props.kind} />
  ) : (
    // <ListPage {...props} ListComponent={FederatedResourceList} canCreate={true} kind={props.kind} title="Federated Resource" />
    <MultiListPage
      ListComponent={FederatedResourceList}
      canCreate={false}
      createProps={{ to: `/k8s/ns/${props.namespace || 'default'}/federatedresources/new` }}
      flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: t('RESOURCE:FEDERATEDRESOURCE') })}
      resources={resources}
      namespace={ns}
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

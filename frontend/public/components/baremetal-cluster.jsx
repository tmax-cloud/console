import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];
const HDCModeFlag = window.SERVER_FLAGS.HDCModeFlag;

const Metal3ClusterHeader = props => {
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

const Metal3ClusterRow = () =>
  // eslint-disable-next-line no-shadow
  function Metal3ClusterRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          {!HDCModeFlag && <ResourceCog actions={menuActions} kind="Metal3Cluster" resource={obj} />}
          <ResourceLink kind="Metal3Cluster" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
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
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Metal3Cluster', t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const Metal3ClusterList = props => {
  const { kinds } = props;
  const Row = Metal3ClusterRow(kinds[0]);
  Row.displayName = 'Metal3ClusterRow';
  return <List {...props} Header={Metal3ClusterHeader} Row={Row} />;
};
Metal3ClusterList.displayName = Metal3ClusterList;

export const Metal3ClustersPage = props => {
  const { t } = useTranslation();
  return HDCModeFlag ? <ListPage {...props} ListComponent={Metal3ClusterList} canCreate={false} kind="Metal3Cluster" /> : <ListPage {...props} ListComponent={Metal3ClusterList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={false} kind="Metal3Cluster" />;
};
Metal3ClustersPage.displayName = 'Metal3ClustersPage';

export const Metal3ClustersDetailsPage = props => {
  const { t } = useTranslation();
  let menu = HDCModeFlag ? null : menuActions;
  let page = HDCModeFlag ? [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW'))] : [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} kind="Metal3Cluster" menuActions={menu} pages={page} />;
};

Metal3ClustersDetailsPage.displayName = 'Metal3ClustersDetailsPage';

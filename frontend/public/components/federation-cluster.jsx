import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];
const HDCModeFlag = window.SERVER_FLAGS.HDCModeFlag;

let getHyperLink = link => {
  // return <Link to={link}> {link}</Link>;
  link = 'https://' + link;
  return <a href={link}>{link}</a>;
};

const KubeFedClusterHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-3 col-sm-3 col-xs-3" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-3 col-sm-3 col-xs-3" sortField="metadata.namespace">
        {'Portal URL'}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const KubeFedClusterRow = () =>
  // eslint-disable-next-line no-shadow
  function KubeFedClusterRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          {!HDCModeFlag && <ResourceCog actions={menuActions} kind="KubeFedCluster" resource={obj} />}
          <ResourceLink kind="KubeFedCluster" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{obj.metadata.namespace}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{getHyperLink(obj.metadata.annotations.portalurl)}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('KubeFedCluster', t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const KubeFedClusterList = props => {
  const { kinds } = props;
  const Row = KubeFedClusterRow(kinds[0]);
  Row.displayName = 'KubeFedClusterRow';
  return <List {...props} Header={KubeFedClusterHeader} Row={Row} />;
};
KubeFedClusterList.displayName = KubeFedClusterList;

export const KubeFedClustersPage = props => {
  const { t } = useTranslation();
  return HDCModeFlag ? <ListPage {...props} ListComponent={KubeFedClusterList} canCreate={false} kind="KubeFedCluster" /> : <ListPage {...props} ListComponent={KubeFedClusterList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={false} kind="KubeFedCluster" />;
};
KubeFedClustersPage.displayName = 'KubeFedClustersPage';

export const KubeFedClustersDetailsPage = props => {
  const { t } = useTranslation();
  let menu = HDCModeFlag ? null : menuActions;
  let page = HDCModeFlag ? [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW'))] : [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} kind="KubeFedCluster" menuActions={menu} pages={page} />;
};

KubeFedClustersDetailsPage.displayName = 'KubeFedClustersDetailsPage';

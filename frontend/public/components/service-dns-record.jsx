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

const ServiceDNSRecordHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-4 col-md-4 col-sm-4 col-xs-4" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-4 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const ServiceDNSRecordRow = () =>
  // eslint-disable-next-line no-shadow
  function ServiceDNSRecordRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          {!HDCModeFlag && <ResourceCog actions={menuActions} kind="KubeFedCluster" resource={obj} />}
          <ResourceLink kind="KubeFedCluster" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{obj.metadata.namespace}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('ServiceDNSRecord', t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const ServiceDNSRecordList = props => {
  const { kinds } = props;
  const Row = ServiceDNSRecordRow(kinds[0]);
  Row.displayName = 'ServiceDNSRecordRow';
  return <List {...props} Header={ServiceDNSRecordHeader} Row={Row} />;
};
ServiceDNSRecordList.displayName = ServiceDNSRecordList;

export const ServiceDNSRecordsPage = props => {
  const { t } = useTranslation();
  return HDCModeFlag ? <ListPage {...props} ListComponent={ServiceDNSRecordList} canCreate={false} kind="ServiceDNSRecord" /> : <ListPage {...props} ListComponent={ServiceDNSRecordList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="ServiceDNSRecord" />;
};
ServiceDNSRecordsPage.displayName = 'ServiceDNSRecordsPage';

export const ServiceDNSRecordsDetailsPage = props => {
  const { t } = useTranslation();
  let menu = HDCModeFlag ? null : menuActions;
  let page = HDCModeFlag ? [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW'))] : [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} kind="ServiceDNSRecord" menuActions={menu} pages={page} />;
};

ServiceDNSRecordsDetailsPage.displayName = 'ServiceDNSRecordsDetailsPage';

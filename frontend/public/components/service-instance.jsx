import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ServiceInstanceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="spec.serviceClassName">
        {t('RESOURCE:CLUSTERSERVICECLASS')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="spec.servicePlanName">
        {t('RESOURCE:CLUSTERSERVICEPLAN')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  )
};

const ServiceInstanceRow = () =>
  function ServiceInstanceRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="ServiceInstance" resource={obj} />
          <ResourceLink kind="ServiceInstance" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.clusterServiceClassName}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.clusterServicePlanName}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };
const Details = ({ obj: clusterserviceinstance }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('SERVICEINSTANCE', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={clusterserviceinstance} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('RESOURCE:CLUSTERSERVICECLASS')}</dt>
              <dd>{clusterserviceinstance.spec.clusterServiceClassName}</dd>
              <dt>{t('RESOURCE:CLUSTERSERVICEPLAN')}</dt>
              <dd>{clusterserviceinstance.spec.clusterServicePlanName}</dd>
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

export const ServiceInstanceList = props => {
  const { kinds } = props;
  const Row = ServiceInstanceRow(kinds[0]);
  Row.displayName = 'ServiceInstanceRow';
  return <List {...props} Header={ServiceInstanceHeader} Row={Row} />;
};
ServiceInstanceList.displayName = ServiceInstanceList;

export const ServiceInstancesPage = props => {
  const { t } = useTranslation();
  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };
  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/serviceinstances/new/${type !== 'yaml' ? type : ''}`,
  };
  return (
    <ListPage
      {...props}
      ListComponent={ServiceInstanceList}
      canCreate={true}
      createProps={createProps}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })}
    />
  );
};
ServiceInstancesPage.displayName = 'ServiceInstancesPage';

export const ServiceInstancesDetailsPage = props => {
  const { t } = useTranslation();
  const pages = [navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};

ServiceInstancesDetailsPage.displayName = 'ServiceInstancesDetailsPage';

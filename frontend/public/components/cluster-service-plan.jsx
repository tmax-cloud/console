import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ScrollToTopOnMount, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ClusterServicePlanHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.bindable"
      >
        {t('CONTENT:BINDABLE')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.externalName"
      >
        {t('CONTENT:EXTERNALNAME')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.clusterServiceBrokerName"
      >
        {t('RESOURCE:CLUSTERSERVICEBROKER')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-1 hidden-xs"
        sortField="spec.serviceClassRef.name"
      >
        {t('RESOURCE:CLUSTERSERVICECLASS')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const ClusterServicePlanRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterServicePlanRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          {/* <ResourceCog actions={menuActions} kind="ClusterServicePlan" resource={obj} /> */}
          <ResourceLink kind="ClusterServicePlan" name={obj.metadata.name} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.bindable ? 'True' : 'False'}
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.externalName}
        </div>
        <div className="col-xs-1 col-sm-2 co-break-word">
          {obj.spec.clusterServiceBrokerName}
        </div>
        <div className="col-xs-1 col-sm-1 co-break-word">
          {obj.spec.clusterServiceClassRef.name}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const Details = ({ obj: ClusterServicePlan }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('CLUSTERSERVICEPLAN', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={ClusterServicePlan} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:BINDABLE')}</dt>
              <dd>{ClusterServicePlan.spec.bindable ? 'True' : 'False'}</dd>
              <dt>{t('CONTENT:EXTERNALNAME')}</dt>
              <dd>{ClusterServicePlan.spec.externalName}</dd>
              <dt> {t('RESOURCE:SERVICEBROKER')}</dt>
              <dd>{ClusterServicePlan.spec.clusterServiceBrokerName}</dd>
              <dt>{t('RESOURCE:SERVICECLASS')}</dt>
              <dd>{ClusterServicePlan.spec.clusterServiceClassRef.name}</dd>
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

export const ClusterServicePlanList = props => {
  const { kinds } = props;
  const Row = ClusterServicePlanRow(kinds[0]);
  Row.displayName = 'ClusterServicePlanRow';
  return <List {...props} Header={ClusterServicePlanHeader} Row={Row} />;
};
ClusterServicePlanList.displayName = ClusterServicePlanList;

export const ClusterServicePlansPage = props => <ListPage {...props} ListComponent={ClusterServicePlanList} kind="ClusterServicePlan" />;
ClusterServicePlansPage.displayName = 'ClusterServicePlansPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const ClusterServicePlansDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind="ClusterServicePlan"
      // menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW'))]}
    />
  )
};

ClusterServicePlansDetailsPage.displayName = 'ClusterServicePlansDetailsPage';

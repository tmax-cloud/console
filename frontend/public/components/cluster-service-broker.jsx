import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ScrollToTopOnMount, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ClusterServiceBrokerHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>

      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.url"
      >
        {t('CONTENT:URL')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="status.conditions.status"
      >
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-4 hidden-xs"
        sortField="metadata.creationTimestamp"
      >
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const ClusterServiceBrokerPhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Running';
        } else {
          phase = 'Error';
        }
      }
    });
    return phase;
  }
};

const ClusterServiceBrokerRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterServiceBrokerRow({ obj }) {
    let phase = ClusterServiceBrokerPhase(obj);
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="ClusterServiceBroker" resource={obj} />
          <ResourceLink kind="ClusterServiceBroker" name={obj.metadata.name} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.url}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {phase}
        </div>
        <div className="col-xs-4 col-sm-4 hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
      </div>
    );
  };

const Details = ({ obj: ClusterServiceBroker }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('CLUSTERSERVICEBROKER', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={ClusterServiceBroker} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{ClusterServiceBrokerPhase(ClusterServiceBroker)}</dd>
              <dt>{t('CONTENT:URL')}</dt>
              <dd>{ClusterServiceBroker.spec.url}</dd>
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

export const ClusterServiceBrokerList = props => {
  const { kinds } = props;
  const Row = ClusterServiceBrokerRow(kinds[0]);
  Row.displayName = 'ClusterServiceBrokerRow';
  return <List {...props} Header={ClusterServiceBrokerHeader} Row={Row} />;
};
ClusterServiceBrokerList.displayName = ClusterServiceBrokerList;

export const ClusterServiceBrokersPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={ClusterServiceBrokerList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="ClusterServiceBroker" />
};
ClusterServiceBrokersPage.displayName = 'ClusterServiceBrokersPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const ClusterServiceBrokersDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind="ClusterServiceBroker"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  )
};

ClusterServiceBrokersDetailsPage.displayName = 'ClusterServiceBrokersDetailsPage';

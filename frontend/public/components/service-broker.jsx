import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { ResourcePlural } from './utils/lang/resource-plural';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ResourceSummary,
  ScrollToTopOnMount
} from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { ResourcePlural } from './utils/lang/resource-plural';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const ServiceBrokerHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead
        {...props}
        className="col-xs-2"
        sortField="metadata.namespace"
      >
        {t('CONTENT:NAMESPACE')}
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
  )
}


// template-instance status 값
const ServiceBrokerPhase = instance => {
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

const ServiceBrokerRow = () =>
  // eslint-disable-next-line no-shadow
  function ServiceBrokerRow({ obj }) {
    let phase = ServiceBrokerPhase(obj);
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ServiceBroker"
            resource={obj}
          />
          <ResourceLink
            kind="ServiceBroker"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.metadata.namespace}
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

const Details = ({ obj: servicebroker }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('SERVICEBROKER', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={servicebroker} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{ServiceBrokerPhase(servicebroker)}</dd>
              <dt>{t('CONTENT:URL')}</dt>
              <dd>{servicebroker.spec.url}</dd>
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

export const ServiceBrokerList = props => {
  const { kinds } = props;
  const Row = ServiceBrokerRow(kinds[0]);
  Row.displayName = 'ServiceBrokerRow';
  return <List {...props} Header={ServiceBrokerHeader} Row={Row} />;
};
ServiceBrokerList.displayName = ServiceBrokerList;

export const ServiceBrokersPage = props => {
  const { t } = useTranslation();
  return (
    <ListPage
      {...props}
      ListComponent={ServiceBrokerList}
      canCreate={true}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('ServiceBroker', t) })}
      kind="ServiceBroker"
    />
  )
};
ServiceBrokersPage.displayName = 'ServiceBrokersPage';

export const ServiceBrokersDetailsPage = props => (
  <DetailsPage
    {...props}
    // breadcrumbsFor={obj =>
    //   breadcrumbsForOwnerRefs(obj).concat({
    //     name: 'ServiceBroker Details',
    //     path: props.match.url
    //   })
    // }
    kind="ServiceBroker"
    menuActions={menuActions}
    pages={[
      // navFactory.details(DetailsForKind(props.kind)),
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

ServiceBrokersDetailsPage.displayName = 'ServiceBrokersDetailsPage';

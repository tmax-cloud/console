import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ResourceSummary
} from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const ServiceBrokerHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-2" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-xs-2"
      sortField="metadata.namespace"
    >
      Namespace
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-2 hidden-xs"
      sortField="spec.url"
    >
      Broker URL
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-2 hidden-xs"
      sortField="status.conditions.status"
    >
      Status
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-4 hidden-xs"
      sortField="metadata.creationTimestamp"
    >
      Created
    </ColHead>
  </ListHeader>
);

// template-instance status 값
const ServiceBrokerPhase = instance => {
  let phase = '';

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

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={`${kindForReference(kind)} Overview`} />
          <ResourceSummary
            resource={obj}
            podSelector="spec.podSelector"
            showNodeSelector={false}
          />
        </div>
      </React.Fragment>
    );
  };

export const ServiceBrokerList = props => {
  const { kinds } = props;
  const Row = ServiceBrokerRow(kinds[0]);
  Row.displayName = 'ServiceBrokerRow';
  return <List {...props} Header={ServiceBrokerHeader} Row={Row} />;
};
ServiceBrokerList.displayName = ServiceBrokerList;

export const ServiceBrokersPage = props => (
  <ListPage
    {...props}
    ListComponent={ServiceBrokerList}
    canCreate={true}
    kind="ServiceBroker"
  />
);
ServiceBrokersPage.displayName = 'ServiceBrokersPage';

export const ServiceBrokersDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'ServiceBroker Details',
        path: props.match.url
      })
    }
    kind="ServiceBroker"
    menuActions={menuActions}
    pages={[
      navFactory.details(DetailsForKind(props.kind)),
      navFactory.editYaml()
    ]}
  />
);

ServiceBrokersDetailsPage.displayName = 'ServiceBrokersDetailsPage';

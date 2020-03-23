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

const ServicePlanHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-xs-2 col-sm-2"
      sortField="metadata.namespace"
    >
      Namespace
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-2 hidden-xs"
      sortField="spec.bindable"
    >
      Bindable
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-2 hidden-xs"
      sortField="spec.externalName"
    >
      External Name
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-1 hidden-xs"
      sortField="spec.serviceBrokerName"
    >
      Service Broker
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-1 hidden-xs"
      sortField="spec.serviceClassRef.name"
    >
      Service Class
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-2 hidden-xs"
      sortField="metadata.creationTimestamp"
    >
      Created
    </ColHead>
  </ListHeader>
);

const ServicePlanRow = () =>
  // eslint-disable-next-line no-shadow
  function ServicePlanRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ServicePlan"
            resource={obj}
          />
          <ResourceLink
            kind="ServicePlan"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.metadata.namespace}
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.bindable ? 'True' : 'False'}
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.externalName}
        </div>
        <div className="col-xs-1 col-sm-1 co-break-word">
          {obj.spec.serviceBrokerName}
        </div>
        <div className="col-xs-1 col-sm-1 co-break-word">
          {obj.spec.serviceClassRef.name}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
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

export const ServicePlanList = props => {
  const { kinds } = props;
  const Row = ServicePlanRow(kinds[0]);
  Row.displayName = 'ServicePlanRow';
  return <List {...props} Header={ServicePlanHeader} Row={Row} />;
};
ServicePlanList.displayName = ServicePlanList;

export const ServicePlansPage = props => (
  <ListPage
    {...props}
    ListComponent={ServicePlanList}
    canCreate={false}
    kind="ServicePlan"
  />
);
ServicePlansPage.displayName = 'ServicePlansPage';

export const ServicePlansDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'ServicePlan Details',
        path: props.match.url
      })
    }
    kind="ServicePlan"
    menuActions={menuActions}
    pages={[
      navFactory.details(DetailsForKind(props.kind)),
      navFactory.editYaml()
    ]}
  />
);

ServicePlansDetailsPage.displayName = 'ServicePlansDetailsPage';

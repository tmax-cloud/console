import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ServiceInstanceHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
      Namespace
    </ColHead>
    <ColHead {...props} className="col-sm-2 hidden-xs" sortField="spec.serviceClassName">
      Service Class
    </ColHead>
    <ColHead {...props} className="col-sm-2 hidden-xs" sortField="spec.servicePlanName">
      Service Plan
    </ColHead>
    <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
      Created
    </ColHead>
  </ListHeader>
);

const ServiceInstanceRow = () =>
  function ServiceInstanceRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="ServiceInstance" resource={obj} />
          <ResourceLink kind="ServiceInstance" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.serviceClassName}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{obj.spec.servicePlanName}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
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

const Details = ({ obj: serviceinstance }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={serviceinstance} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>Service Class</dt>
              <dd>{serviceinstance.spec.serviceClassName}</dd>
              <dt>Service Plan</dt>
              <dd>{serviceinstance.spec.servicePlanName}</dd>
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
  const createItems = {
    form: '인스턴스 (폼 에디터)',
    yaml: '인스턴스 (YAML 에디터)',
  };
  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'all-namespaces'}/serviceinstances/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  return (
    <ListPage
      {...props}
      ListComponent={ServiceInstanceList}
      canCreate={true}
      createProps={createProps}
      // FIXME
      // canCreate={props.canCreate || _.get(kindObj(props.kind), 'crd')}
    />
  );
};
ServiceInstancesPage.displayName = 'ServiceInstancesPage';

export const ServiceInstancesDetailsPage = props => {
  const pages = [navFactory.details(Details), navFactory.editYaml()];
  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};

ServiceInstancesDetailsPage.displayName = 'ServiceInstancesDetailsPage';

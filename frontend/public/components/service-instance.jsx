import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ResourceSummary,
} from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { CardList } from './card';


const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete,
];

const ServiceInstanceHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-6 col-sm-4" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-xs-6 col-sm-4"
      sortField="metadata.namespace"
    >
      Namespace
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

const ServiceInstanceRow = () =>
  function ServiceInstanceRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-4 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ServiceInstance"
            resource={obj}
          />
          <ResourceLink
            kind="ServiceInstance"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-6 col-sm-4 co-break-word">
          {obj.metadata.namespace ? (
            <ResourceLink
              kind="Namespace"
              name={obj.metadata.namespace}
              title={obj.metadata.namespace}
            />
          ) : (
            'None'
          )}
        </div>
        <div className="col-xs-6 col-sm-4 hidden-xs">
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

export const ServiceInstanceList = props => {
  const { kinds } = props;
  const Row = ServiceInstanceRow(kinds[0]);
  Row.displayName = 'ServiceInstanceRow';
  return (
    <List {...props} Header={ServiceInstanceHeader} Row={Row} />
  );
};
ServiceInstanceList.displayName = ServiceInstanceList;

export const ServiceInstancesPage = props => {
const createItems = {
    form: '인스턴스 (폼 에디터)',
    yaml: '인스턴스 (YAML 에디터)',
  };  
  const createProps = {
    items: createItems,
    createLink: (type) => `/k8s/ns/${props.namespace || 'default'}/serviceinstances/new${type !== 'yaml' ? '/' + type : ''}`
  };
  return <ListPage
    {...props}
    ListComponent={ServiceInstanceList}
    canCreate={true}
    createProps={createProps} 
    // FIXME
    // canCreate={props.canCreate || _.get(kindObj(props.kind), 'crd')}
  />
};
ServiceInstancesPage.displayName = 'ServiceInstancesPage';

export const ServiceInstancesDetailsPage = props => {
  const pages = [
    navFactory.details(DetailsForKind(props.kind)),
    navFactory.editYaml(),
  ];
  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};

ServiceInstancesDetailsPage.displayName = 'ServiceInstancesDetailsPage';

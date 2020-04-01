import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from '../factory';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ResourceSummary
} from '../utils';
import { fromNow } from '../utils/datetime';
import { kindForReference } from '../../module/k8s';
import { breadcrumbsForOwnerRefs } from '../utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const ClusterRoleHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-xs-3 col-sm-3"
      sortField="metadata.namespace"
    >
      Namespace
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-3 hidden-xs"
      sortField="metadata.creationTimestamp"
    >
      Created
    </ColHead>
  </ListHeader>
);

const ClusterRoleRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterRoleRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ClusterRole"
            resource={obj}
          />
          <ResourceLink
            kind="ClusterRole"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-3 col-sm-3 co-break-word">
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
        <div className="col-xs-3 col-sm-3 hidden-xs">
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

export const ClusterRoleList = props => {
  const { kinds } = props;
  const Row = ClusterRoleRow(kinds[0]);
  Row.displayName = 'ClusterRoleRow';
  return <List {...props} Header={ClusterRoleHeader} Row={Row} />;
};
ClusterRoleList.displayName = ClusterRoleList;

export const ClusterRolesPage = props => (
  <ListPage
    {...props}
    ListComponent={ClusterRoleList}
    canCreate={true}
    kind="ClusterRole"
  />
);
ClusterRolesPage.displayName = 'ClusterRolesPage';

export const ClusterRolesDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'ClusterRole Details',
        path: props.match.url
      })
    }
    kind="ClusterRole"
    menuActions={menuActions}
    pages={[
      navFactory.details(DetailsForKind(props.kind)),
      navFactory.editYaml()
    ]}
  />
);

ClusterRolesDetailsPage.displayName = 'ClusterRolesDetailsPage';

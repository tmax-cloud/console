import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ResourceSummary,
  ScrollToTopOnMount,
  kindObj
} from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete,
  Cog.factory.EditStatus
];

const RoleBindingClaimHeader = props => (
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
      className="col-xs-3 col-sm-3"
      sortField="status.status"
    >
      Status
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

const RoleBindingClaimRow = () =>
  // eslint-disable-next-line no-shadow
  function RoleBindingClaimRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="RoleBindingClaim"
            resource={obj}
          />
          <ResourceLink
            kind="RoleBindingClaim"
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
          {obj.status.status}
        </div>
        <div className="col-xs-3 col-sm-3 hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
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

const Details = ({ obj: rolebindingclaim }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={rolebindingclaim} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>Status</dt>
              <dd>{rolebindingclaim.status.status}</dd>
              {rolebindingclaim.status.status === 'Reject' && <dt>Reason</dt>}
              {rolebindingclaim.status.status === 'Reject' && <dd>{rolebindingclaim.status.reason}</dd>}
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

export const RoleBindingClaimList = props => {
  const { kinds } = props;
  const Row = RoleBindingClaimRow(kinds[0]);
  Row.displayName = 'RoleBindingClaimRow';
  return <List {...props} Header={RoleBindingClaimHeader} Row={Row} />;
};
RoleBindingClaimList.displayName = RoleBindingClaimList;

export const RoleBindingClaimsPage = props => (
  <ListPage
    {...props}
    ListComponent={RoleBindingClaimList}
    canCreate={true}
    kind="RoleBindingClaim"
  />
);
RoleBindingClaimsPage.displayName = 'RoleBindingClaimsPage';

export const RoleBindingClaimsDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'Role Binding Claim Details',
        path: props.match.url
      })
    }
    kind="RoleBindingClaim"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

RoleBindingClaimsDetailsPage.displayName = 'RoleBindingClaimsDetailsPage';

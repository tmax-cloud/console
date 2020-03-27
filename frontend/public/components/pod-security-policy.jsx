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

const PodSecurityPolicyHeader = props => (
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

const PodSecurityPolicyRow = () =>
  // eslint-disable-next-line no-shadow
  function PodSecurityPolicyRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="PodSecurityPolicy"
            resource={obj}
          />
          <ResourceLink
            kind="PodSecurityPolicy"
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


const Details = ({ obj: namespaceinstance }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={namespaceinstance} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const PodSecurityPolicyList = props => {
  const { kinds } = props;
  const Row = PodSecurityPolicyRow(kinds[0]);
  Row.displayName = 'PodSecurityPolicyRow';
  return <List {...props} Header={PodSecurityPolicyHeader} Row={Row} />;
};
PodSecurityPolicyList.displayName = PodSecurityPolicyList;

export const PodSecurityPoliciesPage = props => (
  <ListPage
    {...props}
    ListComponent={PodSecurityPolicyList}
    canCreate={true}
    kind="PodSecurityPolicy"
  />
);
PodSecurityPoliciesPage.displayName = 'PodSecurityPoliesPage';

export const PodSecurityPoliciesDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'Namespace Claim Details',
        path: props.match.url
      })
    }
    kind="PodSecurityPolicy"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

PodSecurityPoliciesDetailsPage.displayName = 'PodSecurityPoliciesDetailsPage';

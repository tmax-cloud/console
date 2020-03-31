import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ScrollToTopOnMount,
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

const VirtualMachineInstanceHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-xs-4 col-sm-4"
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

const VirtualMachineInstanceRow = () =>
  // eslint-disable-next-line no-shadow
  function VirtualMachineInstanceRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="VirtualMachineInstance"
            resource={obj}
          />
          <ResourceLink
            kind="VirtualMachineInstance"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-4 col-sm-4 co-break-word">
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
        <div className="col-xs-4 col-sm-4 hidden-xs">
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

const Details = ({ obj: VirtualMachineInstance }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={VirtualMachineInstance} />
          </div>
          {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
        </div>
      </div>
    </React.Fragment>
  )
}

export const VirtualMachineInstanceList = props => {
  const { kinds } = props;
  const Row = VirtualMachineInstanceRow(kinds[0]);
  Row.displayName = 'VirtualMachineInstanceRow';
  return <List {...props} Header={VirtualMachineInstanceHeader} Row={Row} />;
};
VirtualMachineInstanceList.displayName = VirtualMachineInstanceList;

export const VirtualMachineInstancesPage = props => (
  <ListPage
    {...props}
    ListComponent={VirtualMachineInstanceList}
    canCreate={true}
    kind="VirtualMachineInstance"
  />
);
VirtualMachineInstancesPage.displayName = 'VirtualMachineInstancesPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const VirtualMachineInstancesDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'VirtualMachineInstance Details',
        path: props.match.url
      })
    }
    kind="VirtualMachineInstance"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

VirtualMachineInstancesDetailsPage.displayName = 'VirtualMachineInstancesDetailsPage';

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

const RegistryHeader = props => (
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
      sortField="spec.image"
    >
      Image
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-2 hidden-xs"
      sortField="spec.persistentVolumeClaim.storageSize"
    >
      Capacity
    </ColHead>
    <ColHead
      {...props}
      className="col-xs-2 col-sm-2"
      sortField="status.phase"
    >
      Status
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

const RegistryRow = () =>
  // eslint-disable-next-line no-shadow
  function RegistryRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="Registry"
            resource={obj}
          />
          <ResourceLink
            kind="Registry"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
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
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {obj.spec.image}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {obj.spec.persistentVolumeClaim.storageSize}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {obj.status.phase}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
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

const Details = ({ obj: registry }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={registry} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>Status</dt>
              <dd>{registry.status.phase}</dd>
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
  )
}

export const RegistryList = props => {
  const { kinds } = props;
  const Row = RegistryRow(kinds[0]);
  Row.displayName = 'RegistryRow';
  return <List {...props} Header={RegistryHeader} Row={Row} />;
};
RegistryList.displayName = RegistryList;

export const RegistryPage = props => (
  <ListPage
    {...props}
    ListComponent={RegistryList}
    canCreate={true}
    kind="Registry"
  />
);
RegistryPage.displayName = 'RegistryPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const RegistryDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'Registry Details',
        path: props.match.url
      })
    }
    kind="Registry"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

RegistryDetailsPage.displayName = 'RegistryDetailsPage';

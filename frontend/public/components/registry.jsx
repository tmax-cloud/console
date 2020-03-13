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
import { kindForReference, referenceForModel } from '../module/k8s';
import { RegistryModel } from '../models';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const RegistryHeader = props => (
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
      sortField="metadata.namespace"
    >
      Object Count
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

const RegistryRow = () =>
  // eslint-disable-next-line no-shadow
  function RegistryRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind={referenceForModel(RegistryModel)}
            resource={obj}
          />
          <ResourceLink
            kind={referenceForModel(RegistryModel)}
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
        <div className="col-xs-3 col-sm-3 co-break-word">
          {(obj.objects && obj.objects.length) || 'None'}
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
    kind={referenceForModel(RegistryModel)}
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
    kind={referenceForModel(RegistryModel)}
    menuActions={menuActions}
    pages={[
      navFactory.details(DetailsForKind(props.kind)),
      navFactory.editYaml()
    ]}
  />
);

RegistryDetailsPage.displayName = 'RegistryDetailsPage';

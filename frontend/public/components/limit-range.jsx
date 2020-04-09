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

const LimitRangeHeader = props => (
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

const LimitRangeRow = () =>
  // eslint-disable-next-line no-shadow
  function LimitRangeRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="LimitRange"
            resource={obj}
          />
          <ResourceLink
            kind="LimitRange"
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

export const LimitRangeList = props => {
  const { kinds } = props;
  const Row = LimitRangeRow(kinds[0]);
  Row.displayName = 'LimitRangeRow';
  return <List {...props} Header={LimitRangeHeader} Row={Row} />;
};
LimitRangeList.displayName = LimitRangeList;

export const LimitRangesPage = props => (
  <ListPage
    {...props}
    ListComponent={LimitRangeList}
    canCreate={true}
    kind="LimitRange"
  />
);
LimitRangesPage.displayName = 'LimitRangesPage';

export const LimitRangesDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'Data Volume Details',
        path: props.match.url
      })
    }
    kind="LimitRange"
    menuActions={menuActions}
    pages={[
      navFactory.details(DetailsForKind(props.kind)),
      navFactory.editYaml()
    ]}
  />
);

LimitRangesDetailsPage.displayName = 'LimitRangesDetailsPage';

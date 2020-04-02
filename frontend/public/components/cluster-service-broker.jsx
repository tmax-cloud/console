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
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const ClusterServiceBrokerHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-4 hidden-xs"
      sortField="metadata.creationTimestamp" >
      Created
    </ColHead>
  </ListHeader>
);

const ClusterServiceBrokerRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterServiceBrokerRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ClusterServiceBroker"
            resource={obj}
          />
          <ResourceLink
            kind="ClusterServiceBroker"
            name={obj.metadata.name}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-4 col-sm-4 hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
      </div>
    );
  };


const Details = ({ obj: ClusterServiceBroker }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={ClusterServiceBroker} />
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

export const ClusterServiceBrokerList = props => {
  const { kinds } = props;
  const Row = ClusterServiceBrokerRow(kinds[0]);
  Row.displayName = 'ClusterServiceBrokerRow';
  return <List {...props} Header={ClusterServiceBrokerHeader} Row={Row} />;
};
ClusterServiceBrokerList.displayName = ClusterServiceBrokerList;

export const ClusterServiceBrokersPage = props => (
  <ListPage
    {...props}
    ListComponent={ClusterServiceBrokerList}
    canCreate={true}
    kind="ClusterServiceBroker"
  />
);
ClusterServiceBrokersPage.displayName = 'ClusterServiceBrokersPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const ClusterServiceBrokersDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'Cluster Service Broker Details',
        path: props.match.url
      })
    }
    kind="ClusterServiceBroker"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

ClusterServiceBrokersDetailsPage.displayName = 'ClusterServiceBrokersDetailsPage';

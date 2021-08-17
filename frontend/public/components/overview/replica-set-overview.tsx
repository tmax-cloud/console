import * as React from 'react';

import { ReplicaSetModel } from '../../models';
import { replicaSetMenuActions } from '../replicaset';
import { KebabAction, ResourceSummary } from '../utils';

// import { OverviewDetailsResourcesTab } from './resource-overview-page';
import { ResourceOverviewDetails } from './resource-overview-details';
import { OverviewItem } from '@console/shared';

const ReplicaSetOverviewDetails: React.SFC<ReplicaSetOverviewDetailsProps> = ({ item: { obj: ss, pods: pods, current, previous, isRollingOut } }) => (
  <div className="overview__sidebar-pane-body resource-overview__body">
    <ResourceSummary resource={ss} showPodSelector showNodeSelector showTolerations />
  </div>
);

const tabs = [
  {
    name: 'Details',
    component: ReplicaSetOverviewDetails,
  },
  // {
  //   name: 'Resources',
  //   component: OverviewDetailsResourcesTab,
  // },
];

export const ReplicaSetOverview: React.SFC<ReplicaSetOverviewProps> = ({ item, customActions }) => <ResourceOverviewDetails item={item} kindObj={ReplicaSetModel} menuActions={customActions ? [...customActions, ...replicaSetMenuActions] : replicaSetMenuActions} tabs={tabs} />;

type ReplicaSetOverviewDetailsProps = {
  item: OverviewItem;
};

type ReplicaSetOverviewProps = {
  item: OverviewItem;
  customActions?: KebabAction[];
};

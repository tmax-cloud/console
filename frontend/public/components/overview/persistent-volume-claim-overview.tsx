import * as React from 'react';

import { PersistentVolumeClaimModel } from '../../models';
import { menuActions } from '../persistent-volume-claim';
import { KebabAction, ResourceSummary } from '../utils';

// import { OverviewDetailsResourcesTab } from './resource-overview-page';
import { ResourceOverviewDetails } from './resource-overview-details';
import { OverviewItem } from '@console/shared';

const PersistentVolumeClaimOverviewDetails: React.SFC<PersistentVolumeClaimOverviewDetailsProps> = ({ item: { obj: ss, pods: pods, current, previous, isRollingOut } }) => (
  <div className="overview__sidebar-pane-body resource-overview__body">
    <ResourceSummary resource={ss} showPodSelector showNodeSelector showTolerations />
  </div>
);

const tabs = [
  {
    name: 'Details',
    component: PersistentVolumeClaimOverviewDetails,
  },
  // {
  //   name: 'Resources',
  //   component: OverviewDetailsResourcesTab,
  // },
];

export const PersistentVolumeClaimOverview: React.SFC<PersistentVolumeClaimOverviewProps> = ({ item, customActions }) => <ResourceOverviewDetails item={item} kindObj={PersistentVolumeClaimModel} menuActions={customActions ? [...customActions, ...menuActions] : menuActions} tabs={tabs} />;

type PersistentVolumeClaimOverviewDetailsProps = {
  item: OverviewItem;
};

type PersistentVolumeClaimOverviewProps = {
  item: OverviewItem;
  customActions?: KebabAction[];
};

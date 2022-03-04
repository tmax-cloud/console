import * as React from 'react';

import { IngressModel } from '../../models';
import { menuActions } from '../ingress';
import { KebabAction, ResourceSummary } from '../utils';

// import { OverviewDetailsResourcesTab } from './resource-overview-page';
import { ResourceOverviewDetails } from './resource-overview-details';
import { OverviewItem } from '@console/shared';

const IngressOverviewDetails: React.SFC<IngressOverviewDetailsProps> = ({ item: { obj: ss, pods: pods, current, previous, isRollingOut } }) => (
  <div className="overview__sidebar-pane-body resource-overview__body">
    <ResourceSummary resource={ss} showPodSelector showNodeSelector showTolerations />
  </div>
);

const tabs = [
  {
    name: 'Details',
    component: IngressOverviewDetails,
  },
  // {
  //   name: 'Resources',
  //   component: OverviewDetailsResourcesTab,
  // },
];

export const IngressOverview: React.SFC<IngressOverviewProps> = ({ item, customActions }) => <ResourceOverviewDetails item={item} kindObj={IngressModel} menuActions={customActions ? [...customActions, ...menuActions] : menuActions} tabs={tabs} />;

type IngressOverviewDetailsProps = {
  item: OverviewItem;
};

type IngressOverviewProps = {
  item: OverviewItem;
  customActions?: KebabAction[];
};

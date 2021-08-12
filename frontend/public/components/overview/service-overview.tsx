import * as React from 'react';

import { ServiceModel } from '../../models';
import { menuActions } from '../service';
import { KebabAction, ResourceSummary } from '../utils';

// import { OverviewDetailsResourcesTab } from './resource-overview-page';
import { ResourceOverviewDetails } from './resource-overview-details';
import { OverviewItem } from '@console/shared';

const ServiceOverviewDetails: React.SFC<ServiceOverviewDetailsProps> = ({ item: { obj: ss, pods: pods, current, previous, isRollingOut } }) => (
  <div className="overview__sidebar-pane-body resource-overview__body">
    <ResourceSummary resource={ss} showPodSelector showNodeSelector showTolerations />
  </div>
);

const tabs = [
  {
    name: 'Details',
    component: ServiceOverviewDetails,
  },
  // {
  //   name: 'Resources',
  //   component: OverviewDetailsResourcesTab,
  // },
];

export const ServiceOverview: React.SFC<ServiceOverviewProps> = ({ item, customActions }) => <ResourceOverviewDetails item={item} kindObj={ServiceModel} menuActions={customActions ? [...customActions, ...menuActions] : menuActions} tabs={tabs} />;

type ServiceOverviewDetailsProps = {
  item: OverviewItem;
};

type ServiceOverviewProps = {
  item: OverviewItem;
  customActions?: KebabAction[];
};

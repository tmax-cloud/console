import * as React from 'react';
import Dashboard from '@console/shared/src/components/dashboard/Dashboard';
import DashboardGrid from '@console/shared/src/components/dashboard/DashboardGrid';
import DetailCard from './namespace-overview-cards/detail-card';
import InventoryCard from './namespace-overview-cards/inventory-card';
import ClaimCard from './namespace-overview-cards/claim-card';
import StatusCard from './namespace-overview-cards/status-card';
import { UtilizationCard } from './namespace-overview-cards/utilization-card';
import ActivityCard from './namespace-overview-cards/activity-card';
import ResourceQuotaCard from './namespace-overview-cards/resource-quota-card';
import { isSingleClusterPerspective } from '@console/internal/hypercloud/perspectives';

const NamespaceOverview = props => {
  const isSingle = isSingleClusterPerspective();
  const statusCard = {
    Card: StatusCard,
    props: {
      status: props.obj.status.phase,
    },
  };
  const detailCard = {
    Card: DetailCard,
    props: {
      href: props.match.url.slice(-1) !== '/' ? `${props.match.url}/details` : `${props.match.url}details`,
      name: props.obj.metadata.name,
      requester: props.obj.metadata?.annotations?.creator,
      label: props.obj.metadata?.labels,
      kind: props.obj.kind,
    },
  };

  const inventoryCard = {
    Card: InventoryCard,
    props: {
      namespace: props.obj.metadata?.name,
    },
  };

  const claimCard = {
    Card: ClaimCard,
    props: {
      namespace: props.obj.metadata?.name,
    },
  };

  const utilizationCard = {
    Card: UtilizationCard,
    props: {
      namespace: props.obj.metadata?.name,
    },
  };

  const activityCard = {
    Card: ActivityCard,
    props: {
      namespace: props.obj.metadata?.name,
    },
  };

  const resourceQuotaCard = {
    Card: ResourceQuotaCard,
    props: {
      namespace: props.obj.metadata?.name,
    },
  };
  const mainCards = [statusCard, utilizationCard, resourceQuotaCard];
  const leftCards = [detailCard, inventoryCard];
  const rightCards = isSingle ? [activityCard] : [claimCard, activityCard];
  return (
    <Dashboard>
      <DashboardGrid mainCards={mainCards} leftCards={leftCards} rightCards={rightCards} />
    </Dashboard>
  );
};

export default NamespaceOverview;

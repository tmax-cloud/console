import * as React from 'react';

import Dashboard from '@console/shared/src/components/dashboard/Dashboard';
import DashboardGrid from '@console/shared/src/components/dashboard/DashboardGrid';
import { getActivePerspective, getActiveCluster } from '@console/internal/actions/ui';
import { StatusCard } from './status-card';
import { DetailsCard } from './details-card';
import { InventoryCard } from './inventory-card';
import { UtilizationCard } from './utilization-card';
import { ActivityCard } from './activity-card';
import { AccessDenied } from '../../../utils';
// import { useK8sGet } from '../../../utils/k8s-get-hook';
// import { InfrastructureModel } from '../../../../models';
// import { K8sResourceKind } from '../../../../module/k8s';
// import { ClusterDashboardContext } from './context';
import { k8sCreate } from '@console/internal/module/k8s';
import { SelfSubjectAccessReviewModel } from '../../../../models';
import { useTranslation } from 'react-i18next';
import { isSingleClusterPerspective } from '../../../../hypercloud/perspectives';


// const isSingleCluster = isSingleClusterPerspective()
/*
const mainCards = [{ Card: StatusCard }, { Card: UtilizationCard }];
const leftCards = [{ Card: DetailsCard }];
const rightCards = isSingleClusterPerspective() === true ? [{ Card: ActivityCard }] : [{ Card: InventoryCard }, { Card: ActivityCard }];
*/
// const mainCards = [];
// const leftCards = [];
// const rightCards = [{ Card: ActivityCard }];

export const ClusterDashboard: React.FC<{}> = () => {
  // const [infrastructure, infrastructureLoaded, infrastructureError] = useK8sGet<K8sResourceKind>(InfrastructureModel, 'cluster');

  // const context = {
  //   infrastructure,
  //   infrastructureLoaded,
  //   infrastructureError,
  // };

  const { t } = useTranslation();

  const [response, setResponse] = React.useState();
  const [isSingleCluster, setSingleCluster] = React.useState(isSingleClusterPerspective());
  const payload = {
    spec: {
      resourceAttributes: {
        resource: 'namespaces',
        verb: 'list',
      },
    },
    metadata: {},
  };
  React.useEffect(() => {
    const checkAuth = async () => {
      let res = await k8sCreate(SelfSubjectAccessReviewModel, payload);
      setResponse(res.status.allowed);
    };
    checkAuth();
  }, []);
  React.useEffect(() => {
    setSingleCluster(isSingleClusterPerspective());
  }, [getActivePerspective()]);

  const mainCards = [{ Card: StatusCard }, { Card: UtilizationCard }];
  const leftCards = [{ Card: DetailsCard }];
  const rightCards = isSingleCluster ? [{ Card: ActivityCard }] : [{ Card: InventoryCard }, { Card: ActivityCard }];

  const dashboard = <DashboardGrid mainCards={mainCards} leftCards={leftCards} rightCards={rightCards} isSingleCluster={isSingleCluster} />;
  const loading = <div></div>;
  const error = <AccessDenied message={t('COMMON:MSG_COMMON_ERROR_MESSAGE_27')} />;
  let content;

  if (response !== undefined) {
    if (response === true) {
      content = dashboard;
    } else {
      content = error;
    }
  } else {
    content = loading;
  }

  return (
    // <ClusterDashboardContext.Provider value={context}>
    <Dashboard>{content}</Dashboard>
    // </ClusterDashboardContext.Provider>
  );
};

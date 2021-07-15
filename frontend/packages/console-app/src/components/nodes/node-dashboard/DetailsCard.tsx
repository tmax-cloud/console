import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import { getNodeAddresses } from '@console/shared/src/selectors/node';
import { resourcePathFromModel } from '@console/internal/components/utils';
import { NodeModel } from '@console/internal/models';

import NodeIPList from '../NodeIPList';
import NodeRoles from '../NodeRoles';
import { NodeDashboardContext } from './NodeDashboardContext';
import { useTranslation } from 'react-i18next';

const DetailsCard: React.FC = () => {
  const { t } = useTranslation();
  const { obj } = React.useContext(NodeDashboardContext);
  const detailsLink = `${resourcePathFromModel(NodeModel, obj.metadata.name)}/details`;
  // const instanceType = obj.metadata.labels?.['beta.kubernetes.io/instance-type'];
  // const zone = obj.metadata.labels?.['topology.kubernetes.io/zone'];
  return (
    <DashboardCard data-test-id="details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_1')}</DashboardCardTitle>
        <DashboardCardLink to={detailsLink}>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVEROPERATOR_ALL_1')}</DashboardCardLink>
      </DashboardCardHeader>
      <DashboardCardBody>
        <DetailsBody>
          <DetailItem isLoading={!obj} title={t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_CARDDETAILS_4')}>
            {obj.metadata.name}
          </DetailItem>
          <DetailItem isLoading={!obj} title={t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_CARDDETAILS_5')}>
            <NodeRoles node={obj} />
          </DetailItem>
          {/* <DetailItem isLoading={!obj} title="Instance Type" error={!instanceType}>
            {instanceType}
          </DetailItem>
          <DetailItem isLoading={!obj} title="Zone" error={!zone}>
            {zone}
          </DetailItem> */}
          <DetailItem isLoading={!obj} title={t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_CARDDETAILS_3')}>
            <NodeIPList ips={getNodeAddresses(obj)} expand />
          </DetailItem>
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default DetailsCard;

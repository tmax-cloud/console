import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import { useTranslation } from 'react-i18next';
import { Status } from '@console/shared';
import '../../components/dashboard/dashboards-page/cluster-dashboard/details-card.scss';
import './namespace-overview.scss';

const StatusCard = ({ status }) => {
  const { t } = useTranslation();
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t('COMMON:MSG_MAIN_TABLEHEADER_3')}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <DetailsBody>
          <Status status={status} />
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default React.memo(StatusCard);

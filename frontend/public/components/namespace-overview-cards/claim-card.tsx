import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import { useTranslation } from 'react-i18next';
import * as classNames from 'classnames';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import '../../components/dashboard/dashboards-page/cluster-dashboard/details-card.scss';
import { coFetchJSON } from '@console/internal/co-fetch';
import { ClusterTemplateClaimModel, RoleBindingClaimModel } from '../../../public/models';
import { resourceListPathFromModel } from '@console/internal/components/utils';
import { resourceURL } from '../../module/k8s/resource';
import './namespace-overview.scss';
import { Link } from 'react-router-dom';

const InventoryList = ({ namespace }) => {
  // TODO: need to change this component into ClusterInventoryItems for productivity
  const { t } = useTranslation();

  const [cscNum, setCSCNum] = React.useState(0);
  const [rbcNum, setRBCNum] = React.useState(0);

  React.useEffect(() => {
    const fetchJSON = async (url, setState) => {
      let num = await coFetchJSON(url);
      setState(num?.items?.length);
    };
    fetchJSON(resourceURL(ClusterTemplateClaimModel, { ns: namespace }), setCSCNum);
    fetchJSON(resourceURL(RoleBindingClaimModel, { ns: namespace }), setRBCNum);
  }, []);
  return (
    <div className={classNames('detail-list__inventory-list')}>
      <div>
        <Link to={resourceListPathFromModel(ClusterTemplateClaimModel, namespace)}>
          {cscNum} {t('COMMON:MSG_LNB_MENU_19')}
        </Link>
      </div>
      <div>
        <Link to={resourceListPathFromModel(RoleBindingClaimModel, namespace)}>
          {rbcNum} {t('COMMON:MSG_LNB_MENU_178')}
        </Link>
      </div>
    </div>
  );
};

const InventoryCard = ({ namespace }) => {
  const { t } = useTranslation();
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t('COMMON:MSG_MAIN_TABLEHEADER_13')}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody className={classNames('details-card__body-style')}>
        <DetailsBody>
          <InventoryList namespace={namespace} />
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default React.memo(InventoryCard);

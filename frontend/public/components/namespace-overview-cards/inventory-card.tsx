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
import { PodModel, DeploymentModel, StatefulSetModel, PersistentVolumeClaimModel, ServiceModel, SecretModel } from '../../../public/models';
import { resourceListPathFromModel } from '@console/internal/components/utils';
import { resourceURL } from '../../module/k8s/resource';
import './namespace-overview.scss';
import { Link } from 'react-router-dom';

const InventoryList = ({ namespace }) => {
  // TODO: need to change this component into ClusterInventoryItems for productivity
  const { t } = useTranslation();

  const [deploymentsNum, setdeploymentsNum] = React.useState(0);
  const [statefulsetsNum, setstatefulsetsNum] = React.useState(0);
  const [podsNum, setPodsNum] = React.useState(0);
  const [pvcNum, setPvcNum] = React.useState(0);
  const [servicesNum, setServicesNum] = React.useState(0);
  const [secretsNum, setSecretsNum] = React.useState(0);

  React.useEffect(() => {
    const fetchJSON = async (url, setState) => {
      let num = await coFetchJSON(url);
      setState(num?.items?.length);
    };
    fetchJSON(resourceURL(DeploymentModel, { ns: namespace }), setdeploymentsNum);
    fetchJSON(resourceURL(StatefulSetModel, { ns: namespace }), setstatefulsetsNum);
    fetchJSON(resourceURL(PodModel, { ns: namespace }), setPodsNum);
    fetchJSON(resourceURL(PersistentVolumeClaimModel, { ns: namespace }), setPvcNum);
    fetchJSON(resourceURL(ServiceModel, { ns: namespace }), setServicesNum);
    fetchJSON(resourceURL(SecretModel, { ns: namespace }), setSecretsNum);
  }, []);
  return (
    <div className={classNames('detail-list__inventory-list')}>
      <div>
        <Link to={resourceListPathFromModel(DeploymentModel, namespace)}>
          {deploymentsNum} {t('SINGLE:MSG_HORIZONTALPODAUTOSCALERS_CREATEFORM_DIV2_5')}
        </Link>
      </div>
      <div>
        <Link to={resourceListPathFromModel(StatefulSetModel, namespace)}>
          {statefulsetsNum} {t('SINGLE:MSG_STATEFULSETS_CREATEYAML_DIV3_1')}
        </Link>
      </div>
      <div>
        <Link to={resourceListPathFromModel(PodModel, namespace)}>
          {podsNum} {t('COMMON:MSG_DETAILS_TAB_10')}
        </Link>
      </div>
      <div>
        <Link to={resourceListPathFromModel(PersistentVolumeClaimModel, namespace)}>
          {pvcNum} {t('COMMON:MSG_LNB_MENU_141')}
        </Link>
      </div>
      <div>
        <Link to={resourceListPathFromModel(ServiceModel, namespace)}>
          {servicesNum} {t('COMMON:MSG_LNB_MENU_137')}
        </Link>
      </div>
      <div>
        <Link to={resourceListPathFromModel(SecretModel, namespace)}>
          {secretsNum} {t('COMMON:MSG_LNB_MENU_26')}
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
        <DashboardCardTitle>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDINVENTORY_1')}</DashboardCardTitle>
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

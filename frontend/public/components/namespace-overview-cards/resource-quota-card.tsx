import * as React from 'react';
import * as _ from 'lodash-es';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import { useTranslation } from 'react-i18next';
import '../../components/dashboard/dashboards-page/cluster-dashboard/details-card.scss';
import '/home/syoh/console/frontend/public/components/namespace-overview-cards/namespace-overview.scss';
import * as classNames from 'classnames';
import './namespace-overview.scss';
import { Link } from 'react-router-dom';
import { resourceURL } from '../../module/k8s/resource';
import { coFetchJSON } from '@console/internal/co-fetch';
import { ResourceQuotaModel, ClusterResourceQuotaModel } from '../../../public/models';
import { getQuotaResourceTypes, hasComputeResources, QuotaGaugeCharts } from '../resource-quota';
import { referenceForModel } from '../../module/k8s';

import { ResourceLink } from '../utils';
const isClusterQuota = quota => !quota.metadata.namespace;
const quotaKind = quota => (isClusterQuota(quota) ? referenceForModel(ClusterResourceQuotaModel) : referenceForModel(ResourceQuotaModel));

const ResourceQuotaCardDiagram = ({ namespace, rq }) => {
  const resourceTypes = getQuotaResourceTypes(rq?.items?.[0]);
  const showChartRow = hasComputeResources(resourceTypes);

  return <div>{showChartRow && <QuotaGaugeCharts quota={rq} resourceTypes={resourceTypes} />}</div>;
};
const ResourceQuotaLink = ({ rq }) => {
  return <ResourceLink kind={quotaKind(rq)} name={rq?.metadata?.name} namespace={rq?.metadata?.namespace} className="co-resource-item__resource-name" />;
};
const ResourceQuotaCard = ({ namespace }) => {
  const { t } = useTranslation();

  const [resourceQuota, setResourceQuota] = React.useState();
  React.useEffect(() => {
    const fetchJSON = async (url, setState) => {
      try {
        let num = await coFetchJSON(url);
        setState(num);
      } catch (err) {
        console.log(err);
      }
    };
    let url = resourceURL(ResourceQuotaModel, { ns: namespace });
    fetchJSON(url, setResourceQuota);
  }, []);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className={classNames('details-card__head-style')}>
          <div>{t('COMMON:MSG_DETAILS_TABRESOURCEQUOTAS_1')}</div>
          <Link to={''}>{t('COMMON:MSG_COMMON_ACTIONBUTTON_9')}</Link>
        </DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        {resourceQuota && <ResourceQuotaLink rq={resourceQuota} />}
        {resourceQuota && <ResourceQuotaCardDiagram namespace={namespace} rq={resourceQuota} />}
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default React.memo(ResourceQuotaCard);

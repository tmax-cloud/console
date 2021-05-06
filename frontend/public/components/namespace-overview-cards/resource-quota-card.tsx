import * as React from 'react';
import * as _ from 'lodash-es';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import { useTranslation } from 'react-i18next';
import '../../components/dashboard/dashboards-page/cluster-dashboard/details-card.scss';
import * as classNames from 'classnames';
import './namespace-overview.scss';
import { Link } from 'react-router-dom';
import { resourceURL } from '../../module/k8s/resource';
import { coFetchJSON } from '@console/internal/co-fetch';
import { ResourceQuotaModel, ResourceQuotaClaimModel, ClusterResourceQuotaModel, SelfSubjectAccessReviewModel } from '../../../public/models';
import { getQuotaResourceTypes, hasComputeResources, QuotaGaugeCharts } from '../resource-quota';
import { referenceForModel } from '../../module/k8s';
import { k8sCreate } from '@console/internal/module/k8s';

import { ResourceLink, resourcePathFromModel } from '../utils';
const isClusterQuota = quota => !quota.metadata.namespace;
const quotaKind = quota => (isClusterQuota(quota) ? referenceForModel(ClusterResourceQuotaModel) : referenceForModel(ResourceQuotaModel));

const ResourceQuotaBody = ({ rq }) => {
  const resourceTypes = getQuotaResourceTypes(rq);
  const showChartRow = hasComputeResources(resourceTypes);

  return (
    <div>
      {showChartRow && (
        <>
          <div style={{ paddingTop: '1.2rem' }}>
            <ResourceLink kind={quotaKind(rq)} name={rq?.metadata?.name} namespace={rq?.metadata?.namespace} className="co-resource-item__resource-name" />
          </div>
          <div>
            <QuotaGaugeCharts quota={rq} resourceTypes={resourceTypes} />
          </div>
        </>
      )}
    </div>
  );
};
const ResourceQuotaCard = ({ namespace }) => {
  const { t } = useTranslation();

  const [resourceQuotas, setResourceQuota] = React.useState<any>();
  const [resourceQuotaPermission, setResourceQuotaPermission] = React.useState();
  React.useEffect(() => {
    const fetchJSON = async () => {
      try {
        const payload = {
          spec: {
            resourceAttributes: {
              resource: 'resourcequota',
              verb: 'create',
            },
          },
          metadata: {},
        };
        const resourcequota = await coFetchJSON(resourceURL(ResourceQuotaModel, { ns: namespace }));
        const permission = await k8sCreate(SelfSubjectAccessReviewModel, payload);

        setResourceQuota(resourcequota);
        setResourceQuotaPermission(permission.status.allowed);
      } catch (err) {
        console.log(err);
      }
    };
    fetchJSON();
  }, []);

  // const resourceQuotaCreate = () => {
  //   if (resourceQuotaPermission) {
  //     return <Link to={''}>{t('COMMON:MSG_COMMON_ACTIONBUTTON_9')}</Link>;
  //   } else {
  //     return <Link to={''}>{t('COMMON:MSG_COMMON_ACTIONBUTTON_12')}</Link>;
  //   }
  // };
  let resourceQuotaCreate, href;

  if (resourceQuotaPermission === undefined) {
    resourceQuotaCreate = <div></div>;
  } else {
    if (resourceQuotaPermission) {
      href = resourcePathFromModel(ResourceQuotaModel, undefined, namespace) + '/~new';
      resourceQuotaCreate = <Link to={href}>{t('COMMON:MSG_COMMON_ACTIONBUTTON_9')}</Link>;
    } else {
      href = resourcePathFromModel(ResourceQuotaClaimModel, undefined, namespace) + '/~new';
      resourceQuotaCreate = <Link to={href}>{t('COMMON:MSG_COMMON_ACTIONBUTTON_12')}</Link>;
    }
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className={classNames('details-card__head-style')}>
          <div>{t('COMMON:MSG_DETAILS_TABRESOURCEQUOTAS_1')}</div>
          {resourceQuotaCreate}
        </DashboardCardTitle>
      </DashboardCardHeader>
      {resourceQuotas && _.map(resourceQuotas.items, rq => <DashboardCardBody key={rq?.metadata?.name}>{<ResourceQuotaBody rq={rq} />}</DashboardCardBody>)}
    </DashboardCard>
  );
};

export default React.memo(ResourceQuotaCard);

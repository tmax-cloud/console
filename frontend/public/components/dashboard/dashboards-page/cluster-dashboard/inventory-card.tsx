import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import { ResourceInventoryItem, StatusGroupMapper } from '@console/shared/src/components/dashboard/inventory-card/InventoryItem';
import { DashboardItemProps, withDashboardResources } from '../../with-dashboard-resources';
import { K8sKind, referenceForModel, K8sResourceCommon } from '../../../../module/k8s';
import { AsyncComponent } from '../../../utils';
import { useExtensions, DashboardsOverviewInventoryItem, isDashboardsOverviewInventoryItem, LazyLoader } from '@console/plugin-sdk';
import { useK8sWatchResource, useK8sWatchResources, WatchK8sResources } from '../../../utils/k8s-watch-hook';
import { useTranslation } from 'react-i18next';
import { getActivePerspective } from '@console/internal/actions/ui';
import { isSingleClusterPerspective } from '../../../../hypercloud/perspectives';
// import { find } from 'lodash';
import { NamespaceClaimModel, ResourceQuotaClaimModel } from '../../../../models/hypercloud';
import { NodeModel, PersistentVolumeClaimModel, PodModel, ServiceModel } from '../../../../models';

import * as classNames from 'classnames';

const getFirehoseResource = (model: K8sKind) => ({
  isList: true,
  kind: model.crd ? referenceForModel(model) : model.kind,
  prop: 'resource',
});

const ClusterInventoryItem = withDashboardResources<ClusterInventoryItemProps>(
  React.memo(({ model, mapper, useAbbr, additionalResources, expandedComponent }: ClusterInventoryItemProps) => {
    const mainResource = React.useMemo(() => getFirehoseResource(model), [model]);
    const otherResources = React.useMemo(() => additionalResources || {}, [additionalResources]);
    let [resourceData, resourceLoaded, resourceLoadError] = useK8sWatchResource<K8sResourceCommon[]>(mainResource);
    // useK8sWatchResource에 반환값이 null일 경우, 해당 값이 ResourceInventoryItem의 props로 들어갈 경우 forEach에서 에러 발생, 이를 해결하기 위해 null일 경우 [] (empty array) 를 할당
    if (resourceData === null) {
      resourceData = [];
    }
    const resources = useK8sWatchResources(otherResources);

    const additionalResourcesData = {};
    let additionalResourcesLoaded = true;
    let additionalResourcesLoadError = false;
    if (additionalResources) {
      additionalResourcesLoaded = Object.keys(additionalResources)
        .filter(key => !additionalResources[key].optional)
        .every(key => resources[key].loaded);
      Object.keys(additionalResources).forEach(key => {
        additionalResourcesData[key] = resources[key].data;
      });
      additionalResourcesLoadError = Object.keys(additionalResources)
        .filter(key => !additionalResources[key].optional)
        .some(key => !!resources[key].loadError);
    }

    const ExpandedComponent = React.useCallback(() => <AsyncComponent loader={expandedComponent} resource={resourceData} additionalResources={additionalResourcesData} />, [resourceData, additionalResourcesData, expandedComponent]);

    return <ResourceInventoryItem isLoading={!resourceLoaded || !additionalResourcesLoaded} error={!!resourceLoadError || additionalResourcesLoadError} kind={model} resources={resourceData} mapper={mapper} useAbbr={useAbbr} additionalResources={additionalResourcesData} ExpandedComponent={expandedComponent ? ExpandedComponent : null} />;
  }),
);

const splitItems = (items: DashboardsOverviewInventoryItem[]) => {
  const RESOURCE_KINDS = [NodeModel.kind, PodModel.kind, ServiceModel.kind, PersistentVolumeClaimModel.kind];
  const CLAIM_KINDS = [NamespaceClaimModel.kind, ResourceQuotaClaimModel.kind];
  const resourceItems = items.filter(item => RESOURCE_KINDS.includes(item.properties.model.kind));
  const claimItems = items.filter(item => CLAIM_KINDS.includes(item.properties.model.kind));
  return { resourceItems, claimItems };
};

const RCCard: React.FC<RCCardProps> = React.memo(({ rcItems }) => {
  return (
    <div>
      {rcItems.map(item => (
        <ClusterInventoryItem key={item.properties.model.kind} model={item.properties.model} mapper={item.properties.mapper} additionalResources={item.properties.additionalResources} useAbbr={item.properties.useAbbr} expandedComponent={item.properties.expandedComponent} />
      ))}
    </div>
  );
});

export const InventoryCard = () => {
  const itemExtensions = useExtensions<DashboardsOverviewInventoryItem>(isDashboardsOverviewInventoryItem);
  const { resourceItems, claimItems } = React.useMemo(() => splitItems(itemExtensions), [itemExtensions]);
  const [isSingleCluster, setSingleCluster] = React.useState(isSingleClusterPerspective());
  const { t } = useTranslation();

  React.useEffect(() => {
    setSingleCluster(isSingleClusterPerspective());
  }, [getActivePerspective()]);

  return (
    <DashboardCard data-test-id="inventory-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDRESOURCES_TITLE_1')}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <RCCard rcItems={resourceItems} />
        {isSingleCluster ? null : <div className={classNames('co-status-card__alerts-body', 'co-dashboard-card__body--top-margin')}>
          <RCCard rcItems={claimItems} />
        </div> }
      </DashboardCardBody>
    </DashboardCard>
  );
};

type ClusterInventoryItemProps = DashboardItemProps & {
  model: K8sKind;
  mapper?: StatusGroupMapper;
  useAbbr?: boolean;
  additionalResources?: WatchK8sResources<any>;
  expandedComponent?: LazyLoader;
};

type RCCardProps = {
  // rcItems: ExtensionWithMetadata[];
  rcItems: any;
};

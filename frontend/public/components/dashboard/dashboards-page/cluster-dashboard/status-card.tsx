import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import { useExtensions, DashboardsOverviewHealthSubsystem, DashboardsOverviewHealthPrometheusSubsystem, isDashboardsOverviewHealthSubsystem, isDashboardsOverviewHealthURLSubsystem, DashboardsOverviewHealthURLSubsystem, isDashboardsOverviewHealthPrometheusSubsystem, isDashboardsOverviewHealthResourceSubsystem } from '@console/plugin-sdk';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import { getInfrastructurePlatform } from '@console/shared';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import HealthBody from '@console/shared/src/components/dashboard/status-card/HealthBody';
import { K8sKind } from '../../../../module/k8s';
import { RootState } from '../../../../redux';
import { PrometheusHealthItem, URLHealthItem, ResourceHealthItem } from './health-item';
import { ClusterDashboardContext } from './context';
import { useTranslation } from 'react-i18next';

const filterSubsystems = (subsystems: DashboardsOverviewHealthSubsystem[], k8sModels: ImmutableMap<string, K8sKind>) =>
  subsystems.filter(s => {
    if (isDashboardsOverviewHealthURLSubsystem(s) || isDashboardsOverviewHealthPrometheusSubsystem(s)) {
      const subsystem = s as DashboardsOverviewHealthPrometheusSubsystem | DashboardsOverviewHealthURLSubsystem;
      return subsystem.properties.additionalResource && !subsystem.properties.additionalResource.optional ? !!k8sModels.get(subsystem.properties.additionalResource.kind) : true;
    }
    return true;
  });

const mapStateToProps = (state: RootState) => ({
  k8sModels: state.k8s.getIn(['RESOURCES', 'models']),
});

export const StatusCard = connect<StatusCardProps>(mapStateToProps)(({ k8sModels }) => {
  const { t } = useTranslation();
  const subsystemExtensions = useExtensions<DashboardsOverviewHealthSubsystem>(isDashboardsOverviewHealthSubsystem);

  const subsystems = React.useMemo(() => filterSubsystems(subsystemExtensions, k8sModels), [subsystemExtensions, k8sModels]);

  // const operatorSubsystemIndex = React.useMemo(() => subsystems.findIndex(isDashboardsOverviewHealthOperator), [subsystems]);
  const { infrastructure, infrastructureLoaded } = React.useContext(ClusterDashboardContext);

  const healthItems: { title: string; Component: React.ReactNode }[] = [];
  subsystems.forEach(subsystem => {
    if (isDashboardsOverviewHealthURLSubsystem(subsystem)) {
      healthItems.push({
        title: subsystem.properties.title,
        Component: <URLHealthItem subsystem={subsystem.properties} models={k8sModels} />,
      });
    } else if (isDashboardsOverviewHealthPrometheusSubsystem(subsystem)) {
      const { disallowedProviders } = subsystem.properties;
      const subsystemItem = { ...subsystem.properties, title: t('SINGLE:MSG_OVERVIEW_MAIN_CARDSTATUS_CONTROLPLANE_1'), popupTitle: t('SINGLE:MSG_OVERVIEW_MAIN_POPOVERCONTROLPLANE_TITLE_1') };
      if (disallowedProviders?.length && (!infrastructureLoaded || disallowedProviders.includes(getInfrastructurePlatform(infrastructure)))) {
        return;
      }
      healthItems.push({
        title: subsystemItem.title,
        Component: <PrometheusHealthItem subsystem={subsystemItem} models={k8sModels} />,
      });
    } else if (isDashboardsOverviewHealthResourceSubsystem(subsystem)) {
      healthItems.push({
        title: subsystem.properties.title,
        Component: <ResourceHealthItem subsystem={subsystem.properties} />,
      });
    }
  });

  // MEMO : Dashboard 상태에서 오퍼레이터부분 제거
  // if (operatorSubsystemIndex !== -1) {
  //   const operatorSubsystems = subsystems.filter(isDashboardsOverviewHealthOperator);
  //   healthItems.splice(operatorSubsystemIndex, 0, {
  //     title: t('SINGLE:MSG_OVERVIEW_MAIN_CARDSTATUS_OPERATORS_1'),
  //     Component: <OperatorHealthItem operatorExtensions={operatorSubsystems} />,
  //   });
  // }

  return (
    <DashboardCard gradient data-test-id="status-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDSTATUS_TITLE_1')}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <HealthBody>
          <Gallery className="co-overview-status__health" gutter="md">
            {healthItems.map(item => {
              return <GalleryItem key={item.title}>{item.Component}</GalleryItem>;
            })}
          </Gallery>
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
});

type StatusCardProps = {
  k8sModels: ImmutableMap<string, K8sKind>;
};

import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from '@patternfly/react-core';
import { ArrowCircleUpIcon, InProgressIcon } from '@patternfly/react-icons';
import { FLAGS, getInfrastructureAPIURL, getInfrastructurePlatform } from '@console/shared';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
import { DashboardItemProps, withDashboardResources } from '../../with-dashboard-resources';
import { ClusterVersionModel } from '../../../../models';
import { referenceForModel, getOpenShiftVersion, ClusterVersionKind, getClusterID, getDesiredClusterVersion, getLastCompletedUpdate, getClusterUpdateStatus, getClusterVersionChannel, ClusterUpdateStatus, getOCMLink } from '../../../../module/k8s';
import { flagPending, featureReducerName } from '../../../../reducers/features';
import { ExternalLink } from '../../../utils';
import { RootState } from '../../../../redux';
import { clusterUpdateModal } from '../../../modals';
import { Link } from 'react-router-dom';
import { useK8sWatchResource, WatchK8sResource } from '../../../utils/k8s-watch-hook';
import { ClusterDashboardContext } from './context';
import { getAccessToken } from '../../../../hypercloud/auth';
import { getActivePerspective, getActiveCluster } from '../../../../actions/ui';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import './details-card.scss';

import { GreenCheckCircleIcon, RedExclamationCircleIcon } from '../../../../../../frontend/packages/console-shared/src/components/status/icons';
import { DashboardCardPopupLink } from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';

const ClusterVersion: React.FC<ClusterVersionProps> = ({ cv }) => {
  const desiredVersion = getDesiredClusterVersion(cv);
  const lastVersion = getLastCompletedUpdate(cv);
  const status = getClusterUpdateStatus(cv);

  switch (status) {
    case ClusterUpdateStatus.Updating:
      return (
        <>
          <span className="co-select-to-copy">{desiredVersion}</span>
          <div>
            <Link to="/settings/cluster/">
              <InProgressIcon className="co-icon-and-text__icon" />
              Updating
            </Link>
          </div>
        </>
      );
    case ClusterUpdateStatus.UpdatesAvailable:
      return (
        <>
          <span className="co-select-to-copy">{desiredVersion}</span>
          <div>
            <Button variant="link" className="btn-link--no-btn-default-values" onClick={() => clusterUpdateModal({ cv })} icon={<ArrowCircleUpIcon />} isInline>
              Update
            </Button>
          </div>
        </>
      );
    default:
      return lastVersion ? <span className="co-select-to-copy">{lastVersion}</span> : <span className="text-secondary">Not available</span>;
  }
};

const clusterVersionResource: WatchK8sResource = {
  kind: referenceForModel(ClusterVersionModel),
  namespaced: false,
  name: 'version',
  isList: false,
};

const mapStateToProps = (state: RootState) => ({
  openshiftFlag: state[featureReducerName].get(FLAGS.OPENSHIFT),
});

const ModuleStatus = ({ status }) => {
  switch (status) {
    case 'Normal':
      return <GreenCheckCircleIcon />;
    case 'Not Installed':
      return <RedExclamationCircleIcon />;
    default:
      return <div></div>;
  }
};

export const DetailsCardPopup: React.FC<DetailsCardPopupProps> = React.memo(({ list }) => {
  const { t } = useTranslation();
  return (
    <DashboardCardPopupLink linkTitle={String(Object.keys(list).length)} popupTitle={t('SINGLE:MSG_OVERVIEW_MAIN_POPOVERSOFTWARE_TITLE_1')} className="co-status-card__popup">
      <p>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVERSOFTWARE_DESCRIPTION_1')}</p>
      <div className={classNames('details-card__popup-subtitle')}>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVERSOFTWARE_SOFTWARE_1')}</div>
      {_.map(list, item => (
        <div key={_.get(item, 'name')}>{_.get(item, 'name')}</div>
      ))}
    </DashboardCardPopupLink>
  );
});

const DetailsSubHeader: React.FC<DetailsSubHeaderProps> = React.memo(({ hcVersion }) => {
  const { t } = useTranslation();
  console.log(typeof hcVersion);
  return (
    <DashboardCardHeader>
      <div className={classNames('details-card__popup-style')}>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDSOFTWARE_INSTALLATION_1')}</div>
      <DetailsCardPopup list={_.filter(hcVersion, item => item.status === 'Not Installed')} />
    </DashboardCardHeader>
  );
});
const DetailsModuleList: React.FC<DetailsModuleListProps> = React.memo(({ hcVersion, hcVersionError }: DetailsModuleListProps) => {
  return (
    <>
      {_.map(hcVersion, item => (
        <div key={_.get(item, 'name')} className={classNames('details-card__head-style')}>
          <div>
            <DetailItem title={_.get(item, 'name')} error={!!hcVersionError || (item && !_.get(item, 'version'))} isLoading={!item} valueClassName="co-select-to-copy">
              {_.get(item, 'version')}
            </DetailItem>
          </div>
          <div className={classNames('details-card__body-icon')}>
            <ModuleStatus status={_.get(item, 'status')} />
          </div>
        </div>
      ))}
    </>
  );
});

export const DetailsCard_ = connect(mapStateToProps)(({ watchK8sResource, stopWatchK8sResource, openshiftFlag }: DetailsCardProps) => {
  const { infrastructure, infrastructureLoaded, infrastructureError } = React.useContext(ClusterDashboardContext);
  const [hcVersion, setHcVersion] = React.useState<Response[]>();
  const [hcVersionError, setHcVersionError] = React.useState();
  const { t } = useTranslation();
  const [clusterVersionData, clusterVersionLoaded, clusterVersionError] = useK8sWatchResource<ClusterVersionKind>(clusterVersionResource);
  React.useEffect(() => {
    if (flagPending(openshiftFlag)) {
      return;
    }
    const fetchHcVersion = async () => {
      let url;
      let headers;
      if (getActivePerspective() === 'master') {
        url = 'api/hypercloud/version';
      } else {
        url = `api/${getActiveCluster()}/version`;
        headers = new Headers();
        headers.append('Authorization', `Bearer ${getAccessToken()}`);
      }
      try {
        let version = await (await fetch(url)).json();
        setHcVersion(version);
      } catch (error) {
        setHcVersionError(error);
      }
    };
    fetchHcVersion();
  }, [openshiftFlag, watchK8sResource, stopWatchK8sResource]);

  const clusterId = getClusterID(clusterVersionData);
  const openShiftVersion = getOpenShiftVersion(clusterVersionData);
  const cvChannel = getClusterVersionChannel(clusterVersionData);

  const infrastructurePlatform = getInfrastructurePlatform(infrastructure);
  const infrastuctureApiUrl = getInfrastructureAPIURL(infrastructure);
  return (
    <DashboardCard data-test-id="details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('COMMON:MSG_DETAILS_TAB_1')}</DashboardCardTitle>
        {/* <DashboardCardLink to="/settings/cluster/">View settings</DashboardCardLink> */}
      </DashboardCardHeader>
      <DetailsSubHeader hcVersion={hcVersion} />
      <DashboardCardBody isLoading={flagPending(openshiftFlag)}>
        <DetailsBody>
          {openshiftFlag ? (
            <>
              <DetailItem title="Cluster API address" isLoading={!infrastructureLoaded} error={!!infrastructureError || (infrastructure && !infrastuctureApiUrl)} valueClassName="co-select-to-copy">
                {infrastuctureApiUrl}
              </DetailItem>
              <DetailItem title="Cluster ID" error={!!clusterVersionError || (clusterVersionLoaded && !clusterId)} isLoading={!clusterVersionLoaded}>
                <div className="co-select-to-copy">{clusterId}</div>
                <ExternalLink text="OpenShift Cluster Manager" href={getOCMLink(clusterId)} />
              </DetailItem>
              <DetailItem title="Provider" error={!!infrastructureError || (infrastructure && !infrastructurePlatform)} isLoading={!infrastructureLoaded} valueClassName="co-select-to-copy">
                {infrastructurePlatform}
              </DetailItem>
              <DetailItem title="OpenShift version" error={!!clusterVersionError || (clusterVersionLoaded && !openShiftVersion)} isLoading={!clusterVersionLoaded}>
                <ClusterVersion cv={clusterVersionData} />
              </DetailItem>
              <DetailItem title="Update channel" isLoading={!clusterVersionLoaded && !clusterVersionError} error={!!clusterVersionError || (clusterVersionLoaded && !cvChannel)} valueClassName="co-select-to-copy">
                {cvChannel}
              </DetailItem>
            </>
          ) : (
            <DetailsModuleList hcVersion={hcVersion} hcVersionError={hcVersionError} />
          )}
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
});

export const DetailsCard = withDashboardResources(DetailsCard_);

type DetailsCardProps = DashboardItemProps & {
  openshiftFlag: boolean;
};

type ClusterVersionProps = {
  cv: ClusterVersionKind;
};

type DetailsSubHeaderProps = {
  hcVersion: any;
};

type DetailsModuleListProps = {
  hcVersion: any;
  hcVersionError: any;
};

type DetailsCardPopupProps = {
  list: any;
};

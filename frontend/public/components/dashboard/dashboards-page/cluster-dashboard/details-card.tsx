import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
import { DashboardItemProps, withDashboardResources } from '../../with-dashboard-resources';
import { getActivePerspective, getActiveCluster } from '../../../../actions/ui';
import { PerspectiveType } from '@console/internal/hypercloud/perspectives';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import { coFetchJSON } from '@console/internal/co-fetch';
import './details-card.scss';

import { GreenCheckCircleIcon, RedExclamationCircleIcon } from '../../../../../../frontend/packages/console-shared/src/components/status/icons';
import { DashboardCardPopupLink } from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';

const ModuleStatus = ({ status }) => {
  switch (status) {
    case 'Normal':
      return <GreenCheckCircleIcon />;
    case 'Abnormal':
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
  return (
    <DashboardCardHeader>
      <div className={classNames('details-card__popup-style')}>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDSOFTWARE_INSTALLATION_1')}</div>
      <DetailsCardPopup list={hcVersion} />
    </DashboardCardHeader>
  );
});
const DetailsModuleList: React.FC<DetailsModuleListProps> = React.memo(({ hcVersion, hcVersionError }: DetailsModuleListProps) => {
  return (
    <>
      {_.map(hcVersion, item => (
        <div key={_.get(item, 'name')} className={classNames('details-card__head-style')}>
          <div>
            <DetailItem title={_.get(item, 'name')} error={!!hcVersionError || (item && !_.get(item, 'version'))} isLoading={!item}>
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

export const DetailsCard_ = ({ watchK8sResource, stopWatchK8sResource }: DetailsCardProps) => {
  const [hcVersion, setHcVersion] = React.useState<Response[]>([]);
  const [hcVersionError, setHcVersionError] = React.useState();
  const { t } = useTranslation();
  const [notInstalled, setNotInstalled] = React.useState([]);
  React.useEffect(() => {
    const fetchHcVersion = async () => {
      let url;
      if (getActivePerspective() === PerspectiveType.MASTER) {
        url = 'api/hypercloud/version';
      } else {
        url = `api/${getActiveCluster()}/version`;
      }
      try {
        let version = await coFetchJSON(url);
        let notInstalledItems = _.filter(version, item => item.status === 'Not Installed');
        setHcVersion(_.filter(version, item => item.status !== 'Not Installed'));
        setNotInstalled(notInstalledItems);
      } catch (error) {
        setHcVersionError(error);
      }
    };
    fetchHcVersion();
  }, [watchK8sResource, stopWatchK8sResource]);

  return (
    <DashboardCard data-test-id="details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('COMMON:MSG_DETAILS_TAB_1')}</DashboardCardTitle>
        {/* <DashboardCardLink to="/settings/cluster/">View settings</DashboardCardLink> */}
      </DashboardCardHeader>
      {notInstalled.length !== 0 && <DetailsSubHeader hcVersion={notInstalled} />}
      <DashboardCardBody isLoading={hcVersion.length > 0 ? false : true} className={classNames('details-card__body-style')}>
        <DetailsBody>{hcVersion.length > 0 && <DetailsModuleList hcVersion={hcVersion} hcVersionError={hcVersionError} />}</DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const DetailsCard = withDashboardResources(DetailsCard_);

type DetailsCardProps = DashboardItemProps;

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

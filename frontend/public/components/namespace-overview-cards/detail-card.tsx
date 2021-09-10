import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import { useTranslation } from 'react-i18next';
import * as classNames from 'classnames';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
import '../../components/dashboard/dashboards-page/cluster-dashboard/details-card.scss';
import { Link } from 'react-router-dom';
import { LabelList } from '../utils';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import * as _ from 'lodash';

const DetailsList = ({ name, requester, label, href, kind }) => {
  const { t } = useTranslation();
  const keys = _.keys(label).sort();
  const labelsSubset = _.take(keys, 3);
  const firstThreelabels = _.pick(label, labelsSubset);
  return (
    <div>
      <DetailItem title={t('COMMON:MSG_MAIN_TABLEHEADER_1')}>{name}</DetailItem>
      <DetailItem title={t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABOVERVIEW_1')}>{requester ? <div>{requester}</div> : <div style={{ color: 'gray' }}>{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABOVERVIEW_2')}</div>}</DetailItem>
      <DetailItem title={t('COMMON:MSG_MAIN_TABLEHEADER_15')}>
        <LabelList kind={kind} labels={firstThreelabels} />
        {keys.length > 3 && <DashboardCardLink to={href}>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVEROPERATOR_ALL_1')}</DashboardCardLink>}
      </DetailItem>
    </div>
  );
};

const DetailCard = ({ href, name, requester, label, kind }) => {
  const { t } = useTranslation();
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className={classNames('details-card__head-style')}>
          <div>{t('COMMON:MSG_DETAILS_TAB_1')}</div>
          <Link to={href}>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVEROPERATOR_ALL_1')}</Link>
        </DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody className={classNames('details-card__body-style')}>
        <DetailsBody>
          <DetailsList name={name} requester={requester} label={label} href={href} kind={kind} />
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default React.memo(DetailCard);

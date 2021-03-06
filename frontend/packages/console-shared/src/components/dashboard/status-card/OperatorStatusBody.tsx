import * as React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { GetOperatorsWithStatuses, LazyLoader } from '@console/plugin-sdk';
import { AsyncComponent, FirehoseResourcesResult } from '@console/internal/components/utils';
import { HealthState } from './states';
import { getMostImportantStatuses } from './state-utils';
import { useTranslation } from 'react-i18next';

import './operator-body.scss';

export const OperatorsSection: React.FC<OperatorsSectionProps> = ({ resources, getOperatorsWithStatuses, title, linkTo, rowLoader }) => {
  const { t } = useTranslation();
  const error = _.values(resources).some(r => r.loadError);
  const operatorStatuses = getOperatorsWithStatuses(resources);
  const sortedOperatorStatuses = getMostImportantStatuses(operatorStatuses).sort((a, b) => a.operators[0].metadata.name.localeCompare(b.operators[0].metadata.name));
  const operatorsHealthy = sortedOperatorStatuses.every(o => o.status.health === HealthState.OK);
  const RowLoading = React.useCallback(() => <div className="co-status__operator-skeleton" />, []);
  return (
    <div className="co-status-popup__section">
      <div className="co-status-popup__row">
        <div>
          <span className="co-status-popup__text--bold">{t('SINGLE:MSG_OVERVIEW_MAIN_CARDSTATUS_OPERATORS_1')}</span>
          <span className="text-secondary">{` (${operatorStatuses.length} installed)`}</span>
        </div>
        <div className="text-secondary">{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVEROPERATOR_STATUS_1')}</div>
      </div>
      {error ? <div className="text-secondary">{t('SINGLE:MSG_OVERVIEW_MAIN_CARDSTATUS_1')}</div> : !operatorsHealthy && sortedOperatorStatuses.map(operatorStatus => <AsyncComponent key={operatorStatus.operators[0].metadata.uid} operatorStatus={operatorStatus} loader={rowLoader} LoadingComponent={RowLoading} />)}
      <div className="co-status-popup__row">
        <Link to={linkTo}>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVEROPERATOR_ALL_1')}</Link>
        {!error && operatorsHealthy && operatorStatuses.length && (
          <div className="co-status-popup__status">
            <div className="text-secondary">All {operatorStatuses[0].status.title.toLowerCase()}</div>
            <div className="co-status-popup__icon">{operatorStatuses[0].status.icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};

type OperatorsSectionProps = {
  resources: FirehoseResourcesResult;
  getOperatorsWithStatuses: GetOperatorsWithStatuses;
  title: string;
  linkTo: string;
  rowLoader: LazyLoader;
};

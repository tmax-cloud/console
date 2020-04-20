import * as React from 'react';
import * as _ from 'lodash-es';

import { Timestamp } from './utils';
import { fromNow } from './utils/datetime';
import { CamelCaseWrap } from './utils/camel-case-wrap';
import { useTranslation } from 'react-i18next';

export const Conditions: React.SFC<ConditionsProps> = ({ conditions }) => {
  const { t } = useTranslation();
  const rows = _.map(conditions, condition => (
    <div className="row" key={condition.type}>
      <div className="col-xs-4 col-sm-2 col-md-2">
        <CamelCaseWrap value={condition.type} />
      </div>
      <div className="col-xs-4 col-sm-2 col-md-2">{condition.status}</div>
      <div className="hidden-xs hidden-sm col-md-2">{fromNow(condition.lastUpdateTime || condition.lastTransitionTime)}</div>
      <div className="col-xs-4 col-sm-3 col-md-2">
        <CamelCaseWrap value={condition.reason} />
      </div>
      {/* remove initial newline which appears in route messages */}
      <div className="hidden-xs col-sm-5 col-md-4 co-break-word co-pre-line">{_.trim(condition.message) || '-'}</div>
    </div>
  ));

  return (
    <React.Fragment>
      {conditions ? (
        <div className="co-m-table-grid co-m-table-grid--bordered">
          <div className="row co-m-table-grid__head">
            <div className="col-xs-4 col-sm-2 col-md-2">{t('CONTENT:TYPE')}</div>
            <div className="col-xs-4 col-sm-2 col-md-2">{t('CONTENT:STATUS')}</div>
            <div className="hidden-xs hidden-sm col-md-2">{t('CONTENT:UPDATED')}</div>
            <div className="col-xs-4 col-sm-3 col-md-2">{t('CONTENT:REASON')}</div>
            <div className="hidden-xs col-sm-5 col-md-4">{t('CONTENT:MESSAGE')}</div>
          </div>
          <div className="co-m-table-grid__body">{rows}</div>
        </div>
      ) : (
        <div className="cos-status-box">
          <div className="text-center">{t('CONTENT:NOCONDITIONSFOUND')}</div>
        </div>
      )}
    </React.Fragment>
  );
};

/* eslint-disable no-undef */
export type conditionProps = {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastUpdateTime?: string;
  lastTransitionTime?: string;
};

export type ConditionsProps = {
  conditions: conditionProps[];
  title?: string;
  subTitle?: string;
};
/* eslint-enable no-undef */

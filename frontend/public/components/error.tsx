import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import { ErrorBoundaryFallbackProps } from '@console/shared/src/components/error/error-boundary';
import { CopyToClipboard, getQueryArgument, PageHeading, ExpandCollapse } from './utils';
import * as restrictedSignImg from '../imgs/restricted-sign.svg';

const getMessage = (type: string, id: string): string => {
  // User messages for error_types returned in auth.go
  const messages = {
    auth: {
      /* eslint-disable camelcase */
      oauth_error: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_9'),
      login_state_error: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_8'),
      cookie_error: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_13'),
      missing_code: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_13'),
      missing_state: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_12'),
      invalid_code: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_10'),
      invalid_state: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_14'),
      logout_error: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_11'),
      /* eslint-enable camelcase */
      default: i18next.t('COMMON:MSG_COMMON_ERROR_MESSAGE_1'),
    },
  };
  return _.get(messages, `${type}.${id}`) || _.get(messages, `${type}.default`) || '';
};

const urlMessage = () => {
  const type = getQueryArgument('error_type');
  const error = getQueryArgument('error');
  return type && error ? getMessage(type, error) : '';
};

const getErrMessage = () => {
  const msg = getQueryArgument('error_msg');
  if (msg) {
    try {
      return decodeURIComponent(msg);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
  return '';
};

const ErrorComponent: React.SFC<ErrorComponentProps> = ({ title, message, errMessage, img }) => {
  const { t } = useTranslation();
  return (
    <>
      <PageHeading title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_5')} detail />
      <div className="co-m-pane__body" data-test-id="error-page">
        {img && <img className="co-m-pane__heading-img" src={img} />}
        <h1 className="co-m-pane__heading co-m-pane__heading--center co-m-pane__heading-error-h1">{title}</h1>
        {message && <div className="text-center">{message}</div>}
        {errMessage && <div className="text-center text-muted">{errMessage}</div>}
      </div>
    </>
  );
};

export const ErrorPage: React.SFC<ErrorPageProps> = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Helmet>
        <title>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_5')}</title>
      </Helmet>
      <ErrorComponent title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_6')} message={urlMessage()} errMessage={getErrMessage()} />
    </div>
  );
};

export const ErrorPage404: React.SFC<ErrorPage404Props> = props => {
  const { t } = useTranslation();
  return (
    <div>
      <Helmet>
        <title>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_7')}</title>
      </Helmet>
      <ErrorComponent title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_45')} message={props.message || t('COMMON:MSG_COMMON_ERROR_MESSAGE_46')} errMessage={props.errMessage} img={restrictedSignImg} />
    </div>
  );
};

export const ErrorBoundaryFallback: React.SFC<ErrorBoundaryFallbackProps> = props => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <h1 className="co-m-pane__heading co-m-pane__heading--center">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_6')}</h1>
      <ExpandCollapse textCollapsed={t('COMMON:MSG_COMMON_ERROR_MESSAGE_56')} textExpanded={t('COMMON:MSG_COMMON_ERROR_MESSAGE_57')}>
        <h3 className="co-section-heading-tertiary">{props.title}</h3>
        <div className="form-group">
          <label htmlFor="description">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_58')}</label>
          <p>{props.errorMessage}</p>
        </div>
        <div className="form-group">
          <label htmlFor="componentTrace">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_59')}</label>
          <div className="co-copy-to-clipboard__stacktrace-width-height">
            <CopyToClipboard value={props.componentStack.trim()} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="stackTrace">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_60')}</label>
          <div className="co-copy-to-clipboard__stacktrace-width-height">
            <CopyToClipboard value={props.stack.trim()} />
          </div>
        </div>
      </ExpandCollapse>
    </div>
  );
};

export const IngressCheckPage: React.SFC<ErrorPageProps> = () => {
  //const { t } = useTranslation();
  const ingressLabelValue = getQueryArgument('ingresslabelvalue');
  const message = ingressLabelValue ? '레이블이 ingress.tamxcloud.org/name=' + ingressLabelValue + ' 인그레스를 확인해 주세요' : '인그레스를 확인해 주세요';
  
  return (
    <div>
      <Helmet>
        <title>인그레스를 확인해 주세요</title>
      </Helmet>
      <ErrorComponent title='인그레스를 확인해 주세요' message={message} />
    </div>
  );
};

export type ErrorComponentProps = {
  title: string;
  message?: string;
  errMessage?: string;
  img?: any;
};

export type ErrorPageProps = {};
export type ErrorPage404Props = Omit<ErrorComponentProps, 'title'>;

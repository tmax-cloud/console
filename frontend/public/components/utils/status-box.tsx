import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { Alert, Button } from '@patternfly/react-core';

import * as restrictedSignImg from '../../imgs/restricted-sign.svg';
import * as imgNoResource from '../../imgs/hypercloud/img_no_resource.svg';
import { TimeoutError } from '../../co-fetch';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Box: React.FC<BoxProps> = ({ children, className }) => <div className={classNames('cos-status-box', className)}>{children}</div>;

export const LoadError: React.FC<LoadErrorProps> = ({ label, className, message, canRetry = true }) => {
  const { t } = useTranslation();
  return (
    <Box className={className}>
      <div className="text-center cos-error-title">{_.isString(message) ? t('COMMON:MSG_COMMON_ERROR_MESSAGE_62', { 0: label, 1: message }) : t('COMMON:MSG_COMMON_ERROR_MESSAGE_61', { 0: label })}</div>
      {canRetry && (
        <div className="text-center">
          <Button type="button" onClick={window.location.reload.bind(window.location)} variant="link" isInline>
            {t('COMMON:MSG_COMMON_ERROR_MESSAGE_26')}
          </Button>
        </div>
      )}
    </Box>
  );
};
LoadError.displayName = 'LoadError';

export const Loading: React.FC<LoadingProps> = ({ className }) => (
  <div className={classNames('co-m-loader co-an-fade-in-out', className)}>
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);
Loading.displayName = 'Loading';

export const LoadingInline: React.FC<{}> = () => <Loading className="co-m-loader--inline" />;
LoadingInline.displayName = 'LoadingInline';

export const LoadingBox: React.FC<LoadingBoxProps> = ({ className, message }) => (
  <Box className={classNames('cos-status-box--loading', className)}>
    <Loading />
    {message && <div className="cos-status-box__loading-message">{message}</div>}
  </Box>
);
LoadingBox.displayName = 'LoadingBox';

export const EmptyBox: React.FC<EmptyBoxProps> = props => {
  const { t } = useTranslation();
  const { label, kind } = props;
  return (
    <Box>
      <div className="text-center">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_22', { something: label || kind })}</div>
    </Box>
  );
};
EmptyBox.displayName = 'EmptyBox';

export const MsgBox: React.FC<MsgBoxProps> = ({ title, detail, className = '' }) => (
  <Box className={className}>
    {title && <div className="cos-status-box__title">{title}</div>}
    {detail && <div className="text-center cos-status-box__detail">{detail}</div>}
  </Box>
);
MsgBox.displayName = 'MsgBox';

export const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Box className="text-center">
        <img className="cos-status-box__access-denied-icon" src={restrictedSignImg} />
        <MsgBox title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_24')} detail={t('COMMON:MSG_COMMON_ERROR_MESSAGE_27')} />
      </Box>
      {_.isString(message) && (
        <Alert isInline className="co-alert co-alert-space" variant="danger" title={t('COMMON:MSG_MAIN_POPOVER_1')}>
          {message}
        </Alert>
      )}
    </div>
  );
};
AccessDenied.displayName = 'AccessDenied';

export const CrdNotFound: React.FC<CrdNotFoundProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Box className="text-center">
        <img className="cos-status-box__access-denied-icon" src={imgNoResource} />
        <MsgBox title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_29')} detail={t('COMMON:MSG_COMMON_ERROR_MESSAGE_42')} className="co-pre-wrap" />
        <Link to={'/k8s/cluster/customresourcedefinitions'}>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_43')}</Link>
      </Box>
      {_.isString(message) && (
        <Alert isInline className="co-alert co-alert-space" variant="danger" title={t('COMMON:MSG_MAIN_POPOVER_1')}>
          {message}
        </Alert>
      )}
    </div>
  );
};
CrdNotFound.displayName = 'CrdNotFound';

const Data: React.FC<DataProps> = props => {
  const { NoDataEmptyMsg, EmptyMsg, label, data, unfilteredData, children } = props;
  if (NoDataEmptyMsg && _.isEmpty(unfilteredData)) {
    return <div className="loading-box loading-box__loaded">{NoDataEmptyMsg ? <NoDataEmptyMsg /> : <EmptyBox label={label} />}</div>;
  }

  if (!data || _.isEmpty(data)) {
    return <div className="loading-box loading-box__loaded">{EmptyMsg ? <EmptyMsg /> : <EmptyBox label={label} kind={props['aria-label']} />}</div>;
  }
  return <div className="loading-box loading-box__loaded">{children}</div>;
};
Data.displayName = 'Data';

export const StatusBox: React.FC<StatusBoxProps> = props => {
  const { loadError, loaded, skeleton, noCrd, ...dataProps } = props;
  const { t } = useTranslation();

  if (noCrd) {
    return <CrdNotFound message={loadError?.message} />;
  }

  if (loadError) {
    const status = _.get(loadError, 'response.status');
    if (status === 404) {
      return (
        <div className="co-m-pane__body">
          <h1 className="co-m-pane__heading co-m-pane__heading--center">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_2')}</h1>
        </div>
      );
    }
    if (status === 403) {
      return <AccessDenied message={loadError.message} />;
    }

    if (loaded && loadError instanceof TimeoutError) {
      return (
        <Data {...dataProps}>
          <div className="co-m-timeout-error text-muted">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_25')}</div>
          {props.children}
        </Data>
      );
    }

    return <LoadError message={loadError.message} label={props.label} className="loading-box loading-box__errored" />;
  }

  if (!loaded) {
    return skeleton ? <>{skeleton}</> : <LoadingBox className="loading-box loading-box__loading" />;
  }
  return <Data {...dataProps} />;
};
StatusBox.displayName = 'StatusBox';

type BoxProps = {
  children: React.ReactNode;
  className?: string;
};

type LoadErrorProps = {
  label: string;
  className?: string;
  message?: string;
  canRetry?: boolean;
};

type LoadingProps = {
  className?: string;
};

type LoadingBoxProps = {
  className?: string;
  message?: string;
};

type EmptyBoxProps = {
  label?: string;
  kind?: string;
};

type MsgBoxProps = {
  title?: string;
  detail?: React.ReactNode;
  className?: string;
};

type AccessDeniedProps = {
  message?: string;
};

type CrdNotFoundProps = {
  message?: string;
};

type DataProps = {
  NoDataEmptyMsg?: React.ComponentType;
  EmptyMsg?: React.ComponentType;
  label?: string;
  unfilteredData?: any;
  data?: any;
  children?: React.ReactNode;
};

type StatusBoxProps = {
  label?: string;
  loadError?: any;
  loaded?: boolean;
  data?: any;
  unfilteredData?: any;
  skeleton?: React.ReactNode;
  NoDataEmptyMsg?: React.ComponentType;
  EmptyMsg?: React.ComponentType;
  children?: React.ReactNode;
  noCrd?: boolean;
};

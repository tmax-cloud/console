import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';

import * as restrictedSignImg from '../../imgs/img_403error.svg';
import { TimeoutError } from '../../co-fetch';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';

export const Box = ({ children, className }) => <div className={classNames('cos-status-box', className)}>{children}</div>;

/** @type {React.SFC<{className?: string, label: string, message?: string, canRetry?: boolean}>} */
export const LoadError = ({ label, className, message, kind, canRetry = true }) => {
  const { t } = useTranslation();
  return (
    <Box className={className}>
      <div className="text-center cos-error-title">
        {t('ADDITIONAL:ERRORLOADING', { something: ResourcePlural(kind, t) })}
        {_.isString(message) ? `: ${message}` : ''}
      </div>
      {canRetry && (
        <div className="text-center">
          <a onClick={window.location.reload.bind(window.location)}>{t('CONTENT:TRYAGAIN')}</a>.
        </div>
      )}
    </Box>
  );
};

export const Loading = ({ className }) => (
  <div className={classNames('co-m-loader co-an-fade-in-out', className)}>
    <div className="co-m-loader-dot__one"></div>
    <div className="co-m-loader-dot__two"></div>
    <div className="co-m-loader-dot__three"></div>
  </div>
);

export const LoadingInline = () => <Loading className="co-m-loader--inline" />;

/** @type {React.SFC<{className?: string}>} */
export const LoadingBox = ({ className }) => (
  <Box className={className}>
    <Loading />
  </Box>
);
LoadingBox.displayName = 'LoadingBox';

export const EmptyBox = ({ label }) => {
  const { t } = useTranslation();
  return (
    <Box>
      <div className="text-center">{label ? t('STRING:EMPTYBOX') : t('CONTENT:NOTFOUND')}</div>
    </Box>
  );
};
EmptyBox.displayName = 'EmptyBox';

export const MsgBox = ({ title, detail, className = '' }) => (
  <Box className={className}>
    {title && <div className="text-center" style={{ fontSize: '30px' }}>{title}</div>}
    {detail && <div className="text-center" style={{ fontSize: '30px' }}>{detail}</div>}
  </Box>
);
MsgBox.displayName = 'MsgBox';

export const AccessDenied = ({ message }) => {
  const { t } = useTranslation();
  const [errorDetail, setErrorDetail] = React.useState({ show: false, icon: 'fa-angle-down' });
  const onClickErrorDetail = () => {
    errorDetail.show ? setErrorDetail({ ...errorDetail, show: false, icon: 'fa-angle-down' }) : setErrorDetail({ ...errorDetail, show: true, icon: 'fa-angle-up' })
  };
  return (
    <Box className="text-center">
      <img className="cos-status-box__access-denied-icon" src={restrictedSignImg} />
      <MsgBox title={t('STRING:RESTRICTED_0')} detail={t('STRING:RESTRICTED_1')} />
      {_.isString(message) && (
        <div>
          <p className="alert-danger text-center" style={{ fontSize: '18px' }} >
            {t('STRING:RESTRICTED_2')}
            <span className={`fa ${errorDetail.icon} fa-fw`} aria-hidden="true" value={errorDetail} onClick={onClickErrorDetail}></span>
          </p>
          {errorDetail.show && <div className="alert alert-danger text-center">
            {message}
          </div>}

        </div>
      )}
    </Box>
  );
};
AccessDenied.displayName = 'AccessDenied';

const Data = props => {
  const { EmptyMsg, label, data } = props;
  let component = props.children;
  if (!data || _.isEmpty(data)) {
    component = EmptyMsg ? <EmptyMsg /> : <EmptyBox label={label} />;
    return <div className="loading-box loading-box__loaded">{component}</div>;
  }

  return <div className="loading-box loading-box__loaded">{props.children}</div>;
};

export const StatusBox = props => {
  const { label, loadError, loaded, kinds, data } = props;
  let kind = kinds ? kinds[0] : data.kind;
  const { t } = useTranslation();
  if (loadError) {
    const status = _.get(loadError, 'response.status');
    if (status === 404) {
      return (
        <div className="co-m-pane__body">
          <h1 className="co-m-pane__heading co-m-pane__heading--center">404: Not Found</h1>
        </div>
      );
    }
    if (status === 403 || _.includes(_.toLower(loadError), 'access denied')) {
      return <AccessDenied message={loadError.message} />;
    }

    if (loaded && loadError instanceof TimeoutError) {
      return (
        <Data {...props}>
          <div className="co-m-timeout-error text-muted">{t('STRING:STATUSBOX_0')}</div>
          {props.children}
        </Data>
      );
    }

    return <LoadError message={loadError.message} label={label} kind={kind} className="loading-box loading-box__errored" />;
  }

  if (!loaded) {
    return <LoadingBox className="loading-box loading-box__loading" />;
  }
  return <Data {...props} />;
};

StatusBox.displayName = 'StatusBox';

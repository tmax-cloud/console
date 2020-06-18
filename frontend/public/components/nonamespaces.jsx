import * as React from 'react';

import * as restrictedSignImg from '../imgs/img_403error.svg';
import { useTranslation } from 'react-i18next';
import { Box, MsgBox } from './utils/status-box';

export const NoNamespace = () => {
  const { t } = useTranslation();
  const [errorDetail, setErrorDetail] = React.useState({ show: false, icon: 'fa-angle-down' });
  const onClickErrorDetail = () => {
    errorDetail.show ? setErrorDetail({ ...errorDetail, show: false, icon: 'fa-angle-down' }) : setErrorDetail({ ...errorDetail, show: true, icon: 'fa-angle-up' });
  };
  return (
    <Box className="text-center">
      <img className="cos-status-box__access-denied-icon" src={restrictedSignImg} style={{ marginTop: '165px' }} />
      <MsgBox title={t('STRING:RESTRICTED_0')} detail={t('STRING:RESTRICTED_1')} />
      <div>
        <p className="alert-danger text-center" style={{ fontSize: '18px' }}>
          {t('STRING:RESTRICTED_2')}
          <span className={`fa ${errorDetail.icon} fa-fw`} aria-hidden="true" value={errorDetail} onClick={onClickErrorDetail}></span>
        </p>
        {errorDetail.show && <div className="alert alert-danger text-center">Cannot Access Any NameSpace</div>}
      </div>
    </Box>
  );
};
NoNamespace.displayName = 'NoNamespace';

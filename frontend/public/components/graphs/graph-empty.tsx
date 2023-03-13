import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const GraphEmpty: React.FC<GraphEmptyProps> = ({ height = 180, loading = false, status }) => {
  const { t } = useTranslation();
  const fsText: string = t('COMMON:MSG_DETAILS_TABDETAILS_DESCRIPTION_1');
  const fsTextArr: Array<string> = fsText.split('\n');

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height,
        justifyContent: 'center',
        padding: '5px',
        width: '100%',
      }}
    >
      {loading ? (
        <div className="skeleton-chart" />
      ) : status === 'Running' ? (
        <div>
          <div className="text-secondary">{fsTextArr[0]}</div>
          <div className="text-secondary">{fsTextArr[1]}</div>
        </div>
      ) : (
        <div className="text-secondary">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_28')}</div>
      )}
    </div>
  );
};

type GraphEmptyProps = {
  height?: number | string;
  loading?: boolean;
  status?: string;
};

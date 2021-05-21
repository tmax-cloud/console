import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const GraphEmpty: React.FC<GraphEmptyProps> = ({ height = 180, loading = false }) => {
  const { t } = useTranslation();
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
      {loading ? <div className="skeleton-chart" /> : <div className="text-secondary">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_28')}</div>}
    </div>
  );
};
type GraphEmptyProps = {
  height?: number | string;
  loading?: boolean;
};

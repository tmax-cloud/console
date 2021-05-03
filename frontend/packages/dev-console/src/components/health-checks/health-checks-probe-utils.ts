import { HealthChecksProbeType, RequestType, HealthCheckProbe } from './health-checks-types';
// import { useTranslation } from 'react-i18next';

export const getHealthChecksProbeConfig = (probe: string, t) => {
  //   const { t } = useTranslation();
  switch (probe) {
    case HealthChecksProbeType.ReadinessProbe: {
      return {
        formTitle: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_4'),
        formSubtitle: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_5'),
      };
    }
    case HealthChecksProbeType.LivenessProbe: {
      return {
        formTitle: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_7'),
        formSubtitle: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_8'),
      };
    }
    case HealthChecksProbeType.StartupProbe: {
      return {
        formTitle: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_10'),
        formSubtitle: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_11'),
      };
    }
    default:
      return undefined;
  }
};

export const healthChecksDefaultValues: HealthCheckProbe = {
  showForm: false,
  enabled: false,
  modified: false,
  data: {
    failureThreshold: 3,
    requestType: RequestType.HTTPGET,
    httpGet: {
      scheme: 'HTTP',
      path: '/',
      port: 8080,
      httpHeaders: [],
    },
    tcpSocket: {
      port: 8080,
    },
    exec: { command: [''] },
    initialDelaySeconds: 0,
    periodSeconds: 10,
    timeoutSeconds: 1,
    successThreshold: 1,
  },
};

export const healthChecksProbeInitialData = {
  readinessProbe: healthChecksDefaultValues,
  livenessProbe: healthChecksDefaultValues,
  startupProbe: healthChecksDefaultValues,
};

import { NO_STATUS } from '@console/shared/src/components/status';
import * as _ from 'lodash-es';

export const baseStatusReducer = (depth1: string, depth2: string) => (obj: any): string => {
  return !!obj[depth1] ? obj[depth1][depth2] : NO_STATUS;
};

export const ServiceBrokerStatusReducer = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Running';
        } else {
          phase = 'Error';
        }
      }
    });
    return phase;
  } else {
    return NO_STATUS;
  }
};

export const ClusterServiceBrokerReducer = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Running';
        } else {
          phase = 'Error';
        }
      }
    });
    return phase;
  } else {
    return NO_STATUS;
  }
};

export const ServiceInstanceStatusReducer = (serviceInstance: any): string => baseStatusReducer('status', 'lastConditionState')(serviceInstance);

export const ClusterTemplateClaimReducer = (clusterTemplateClaim: any): string => baseStatusReducer('status', 'status')(clusterTemplateClaim);

export const TemplateInstanceStatusReducer = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === '') {
        phase = cur.status;
      }
    });
    return phase;
  } else {
    return NO_STATUS;
  }
};

export const NotebookStatusReducer = notebook => {
  return !!notebook.status ? notebook.status.conditions?.[0]?.type : NO_STATUS || '';
};

export const ExperimentStatusReducer = experiment => {
  if (experiment.status) {
    const conditions = experiment.status?.conditions;
    return !!conditions ? conditions[conditions.length - 1]?.type : '-';
  } else {
    return NO_STATUS;
  }
};

export const ClusterClaimStatusReducer = (clusterClaim: any): string => baseStatusReducer('status', 'phase')(clusterClaim);

export const awxStatusReducer = (awx: any): string => {
  if (!awx.status) return NO_STATUS;
  const conditions = _.get(awx, ['status', 'conditions'], []);
  if (conditions.length === 0) return '-';
  return conditions[0].reason === 'Successful' ? 'Succeeded' : conditions[0].reason === 'Running' ? 'Deploying' : conditions[0].reason;
};

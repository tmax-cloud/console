import * as _ from 'lodash-es';
export const NO_STATUS = 'No Status';

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

export const ServiceInstanceStatusReducer = (serviceInstance: any): string => {
  return !!serviceInstance.status ? serviceInstance.status.lastConditionState : NO_STATUS;
};

export const ClusterTemplateClaimReducer = (clusterTemplateClaim: any): string => {
  return !!clusterTemplateClaim.status ? clusterTemplateClaim.status.status : NO_STATUS;
};

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

export const ClusterClaimStatusReducer = (clusterClaim: any): string => {
  return !!clusterClaim.status ? clusterClaim.status.phase : NO_STATUS;
};

export const AwxStatusReducer = (awx: any): string => {
  if (!awx.status) {
    return NO_STATUS;
  }
  const conditions = _.get(awx, ['status', 'conditions'], []);
  if (conditions.length === 0) {
    return '-';
  }
  return conditions[0].reason === 'Successful' ? 'Succeeded' : conditions[0].reason === 'Running' ? 'Deploying' : conditions[0].reason;
};

export const NamespaceClaimReducer = (namespaceClaim: any): string => {
  return !!namespaceClaim.status ? namespaceClaim.status.status : NO_STATUS;
};

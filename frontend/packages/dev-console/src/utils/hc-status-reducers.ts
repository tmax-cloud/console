import { NO_STATUS } from '@console/shared/src/components/status';

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

export const TerraformClaimStatusReducer = (clusterClaim: any): string => {
  return !!clusterClaim.status ? clusterClaim.status.phase : NO_STATUS;
};

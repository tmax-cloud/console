import * as _ from 'lodash-es';
import { NodeCondition } from '@console/shared/src/types';
import { CMP_PRIMARY_KEY } from '@console/internal/hypercloud/menu/menu-types';
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

export const TrainingJobStatusReducer = tj => {
  if (!tj.status) {
    return NO_STATUS;
  }

  const len = tj.status.conditions.length;
  for (let i = len - 1; i >= 0; i--) {
    if (tj.status.conditions[i].status) {
      return tj.status.conditions[i].type;
    } else {
      return NO_STATUS;
    }
  }
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

export const PersistentVolumeReducer = (persistentVolume: any): string => {
  let phase = '';
  phase = persistentVolume.metadata.deletionTimestamp ? 'Terminating' : persistentVolume.status.phase;
  return !!persistentVolume.status ? phase : NO_STATUS;
};

export const PersistentVolumeClaimReducer = (persistentVolumeClaim: any): string => {
  let phase = '';
  phase = persistentVolumeClaim.metadata.deletionTimestamp ? 'Terminating' : persistentVolumeClaim.status.phase;
  return !!persistentVolumeClaim.status ? phase : NO_STATUS;
};

export const RoleBindingClaimReducer = (roleBindingClaim: any): string => {
  return !!roleBindingClaim.status ? roleBindingClaim.status.status : NO_STATUS;
};

export const PipelineRunReducer = (pipelineRun: any): string => {
  const conditions = _.get(pipelineRun, ['status', 'conditions'], []);
  const isCancelled = conditions.find(c => ['PipelineRunCancelled', 'TaskRunCancelled'].some(cancel => cancel === c.reason));
  if (isCancelled) {
    return 'Cancelled';
  }
  if (conditions.length === 0) return null;

  const condition = conditions.find(c => c.type === 'Succeeded');
  let status = !condition || !condition.status ? null : condition.status === 'True' ? 'Completed' : condition.status === 'False' ? 'Failed' : 'Running';

  return !!pipelineRun.status.conditions ? status : NO_STATUS;
};

export const PipelineApprovalReducer = (pipelineApproval: any): string => {
  return !!pipelineApproval.status ? pipelineApproval.status.result : NO_STATUS;
};

export const IntegrationConfigReducer = (integrationConfig: any): string => {
  let phase = '';
  if (integrationConfig.status) {
    integrationConfig.status.conditions?.forEach(cur => {
      if (cur.type === 'ready') {
        if (cur.status === 'True') {
          phase = 'Ready';
        } else {
          phase = 'UnReady';
        }
      }
    });
  }
  return !!integrationConfig.status ? phase : NO_STATUS;
};

export const InferenceServiceReducer = (inferenceService: any): string => {
  let phase = '';
  if (inferenceService.status) {
    inferenceService.status.conditions?.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Ready';
        } else if (cur.status === 'Unknown') {
          phase = 'Unknown';
        } else {
          phase = 'Not Ready';
        }
      }
    });
  }
  return !!inferenceService.status ? phase : NO_STATUS;
};

export const TrainedModelReducer = (trainedModel: any): string => {
  let phase = '';
  if (trainedModel.status) {
    trainedModel.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Ready';
        } else {
          phase = 'Not Ready';
        }
      }
    });
  }
  return !!trainedModel.status ? phase : NO_STATUS;
};

export const NodeStatusReducer = (node: any): string => {
  const conditions = _.get(node, 'status.conditions', []);
  const readyState = _.find(conditions, { type: 'Ready' }) as NodeCondition;

  return readyState ? (readyState.status === 'True' ? 'Ready' : 'Not Ready') : NO_STATUS;
};

export const ClusterRegistrationStatusReducer = (cr: any): string => {
  const status = _.get(cr, 'status');
  if (!!status) {
    const phase = status.phase || '';
    if (phase === 'Failed' || phase === 'Success' || phase === 'Deleted') {
      return phase;
    } else {
      return 'Validation/Validated';
    }
  } else {
    return NO_STATUS;
  }
};

export const ClusterMenuPolicyStatusReducer = (cmp: any): string => {
  const labels = cmp?.metadata?.labels;
  const primaryValue = _.get(labels, CMP_PRIMARY_KEY);
  if (primaryValue === 'true') {
    return 'Activated';
  } else {
    return 'Deactivated';
  }
};

export const BareMetalHostStatusReducer = (bmh: any): string => {
  return bmh.status?.provisioning?.state;
};

export const HelmReleaseStatusReducer = (hr: any): string => {
  return hr === null ? NO_STATUS : hr?.info?.status;
};

export const ServiceBindingStatusReducer = (sb: any): string => {
  for (const c of sb.status.conditions) {
    if (c.type=="Ready") {
      if (c.status=="True") {
        return "Succeeded"
      }
      else if (c.status=="False") {
        return "Failed"
      }
      else {
        return "Unknown"
      }
    }
  }

}

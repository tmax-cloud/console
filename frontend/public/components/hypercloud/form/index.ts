import * as models from '../../../models';
import { allModels } from '../../../module/k8s';

enum SCHEMA_DIRECTORY {
  MANAGEMENT = 'management',
  NETWORK = 'network',
  STORAGE = 'storage',
  WORKLOAD = 'workload',
}

export const resourceSchemaBasedMenuMap = new Map([
  [models.ClusterRoleModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'ClusterRole.json' }],
  [models.ClusterRoleBindingModel.kind, { directory: '', file: '' }], // not form
  [models.CustomResourceDefinitionModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'CustomResourceDefinition.json' }],
  [models.LimitRangeModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'LimitRange.json' }],
  [models.NamespaceModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'Namespace.json' }],
  [models.NodeModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'Node.json' }],
  [models.ResourceQuotaModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'ResourceQuota.json' }],
  [models.RoleModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'Role.json' }],
  [models.RoleBindingModel.kind, { directory: '', file: '' }], // not form
  [models.ServiceAccountModel.kind, { directory: SCHEMA_DIRECTORY.MANAGEMENT, file: 'ServiceAccount.json' }],
  [models.IngressModel.kind, { directory: SCHEMA_DIRECTORY.NETWORK, file: 'Ingress.json' }],
  [models.NetworkPolicyModel.kind, { directory: SCHEMA_DIRECTORY.NETWORK, file: 'NetworkPolicy.json' }],
  [models.ServiceModel.kind, { directory: SCHEMA_DIRECTORY.NETWORK, file: 'Service.json' }],
  [models.PersistentVolumeModel.kind, { directory: SCHEMA_DIRECTORY.STORAGE, file: 'PersistentVolume.json' }],
  [models.PersistentVolumeClaimModel.kind, { directory: SCHEMA_DIRECTORY.STORAGE, file: 'PersistentVolumeClaim.json' }],
  [models.StorageClassModel.kind, { directory: SCHEMA_DIRECTORY.STORAGE, file: 'StorageClass.json' }],
  [models.ConfigMapModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'ConfigMap.json' }],
  [models.CronJobModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'CronJob.json' }],
  [models.DaemonSetModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'DaemonSet.json' }],
  [models.DeploymentModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'Deployment.json' }],
  [models.HorizontalPodAutoscalerModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'HorizontalPodAutoscaler.json' }],
  [models.JobModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'Job.json' }],
  [models.PodModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'Pod.json' }],
  [models.PodSecurityPolicyModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'PodSecurityPolicy.json' }],
  [models.ReplicaSetModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'ReplicaSet.json' }],
  [models.SecretModel.kind, { directory: '', file: '' }], // not form
  [models.StatefulSetModel.kind, { directory: SCHEMA_DIRECTORY.WORKLOAD, file: 'StatefulSet.json' }],
]);

const isCreateManualSet = new Set([models.RoleModel.kind, models.ClusterRoleModel.kind, models.ServiceInstanceModel.kind, models.TemplateInstanceModel.kind, models.TaskModel.kind, models.ClusterTaskModel.kind, models.TaskRunModel.kind, models.PipelineRunModel.kind, models.PipelineResourceModel.kind, models.RoleBindingModel.kind, models.ClusterRoleBindingModel.kind, models.RoleBindingClaimModel.kind, models.PipelineModel.kind]);

export const pluralToKind = (plural: string) => allModels().find(model => model.plural === plural)?.kind;

export const isCreateManual = (kind: string) => isCreateManualSet.has(kind);

export const isResourceSchemaBasedMenu = (kind: string) => resourceSchemaBasedMenuMap.has(kind);

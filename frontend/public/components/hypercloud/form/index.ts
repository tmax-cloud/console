import * as models from '../../../models';
import { CustomResourceDefinitionModel } from '../../../models';
import { allModels, getK8sAPIPath, K8sKind } from '../../../module/k8s';

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

const isCreateManualSet = new Set([models.RoleModel.kind, models.ClusterRoleModel.kind, models.ServiceInstanceModel.kind, models.TemplateInstanceModel.kind, models.TaskModel.kind, models.ClusterTaskModel.kind, models.TaskRunModel.kind, models.PipelineRunModel.kind, models.PipelineResourceModel.kind, models.RoleBindingModel.kind, models.ClusterRoleBindingModel.kind, models.RoleBindingClaimModel.kind, models.PipelineModel.kind, models.SecretModel.kind, models.ServiceBindingModel.kind]);

export const pluralToKind = (plural: string) => allModels().find(model => model.plural === plural)?.kind;

export const isCreateManual = (kind: string) => isCreateManualSet.has(kind);

export const isResourceSchemaBasedMenu = (kind: string) => resourceSchemaBasedMenuMap.has(kind);

export const getResourceSchemaUrl = (model: K8sKind, isCustomResourceType: boolean) => {
  let url = null;
  if (isCustomResourceType) {
    // structural schema로 해야하는 거
    const { apiGroup, apiVersion } = CustomResourceDefinitionModel;
    url = `${document.location.origin}${getK8sAPIPath({ apiGroup, apiVersion })}/customresourcedefinitions/${model.plural}.${model.apiGroup}`;
  } else {
    // github에 저장해둔거로 해야하는 거
    const { directory, file } = resourceSchemaBasedMenuMap.get(model.kind);
    if (directory && file) {
      url = `https://raw.githubusercontent.com/tmax-cloud/resource-schema/main/${directory}/key-mapping/${file}`;
    }
  }
  return url;
};

// 폼 생성 시 기본값으로 포함되어야할 템플릿 정의
export const defaultTemplateMap = new Map([
  [
    models.TaskModel.kind,
    {
      metadata: {
        name: 'example-name',
      },
    },
  ],
  [
    models.PipelineResourceModel.kind,
    {
      metadata: {
        name: 'example-name',
      },
      spec: {
        type: 'git',
      },
    },
  ],
  [
    models.ClusterTaskModel.kind,
    {
      metadata: {
        name: 'example-name',
      },
    },
  ],
  [
    models.PipelineRunModel.kind,
    {
      metadata: {
        name: 'example-name',
      },
    },
  ],
  [
    models.TaskRunModel.kind,
    {
      metadata: {
        name: 'example-name',
      },
    },
  ],
]);

// 빈 값으로 정의되어야 하는 것들 정의
export const shouldNotPruneMap = new Map([
  [models.TaskModel.kind, ['emptyDir']],
  [models.PipelineResourceModel.kind, ['emptyDir']],
  [models.ClusterTaskModel.kind, ['emptyDir']],
  [models.PipelineRunModel.kind, ['emptyDir']],
  [models.TaskRunModel.kind, ['emptyDir']],
]);

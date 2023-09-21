import { CustomMenusMap, MenuType, MenuContainerLabels } from '@console/internal/hypercloud/menu/menu-types';
import * as Models from '@console/internal/models';

const MasterNavMenus = [
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.home,
    innerMenus: [CustomMenusMap.Dashboard.kind, Models.NamespaceModel.kind, CustomMenusMap.Search.kind, CustomMenusMap.Audit.kind, CustomMenusMap.Events.kind, CustomMenusMap.ArgoCD.kind, CustomMenusMap.Rollout.kind, CustomMenusMap.Grafana.kind, CustomMenusMap.Git.kind, CustomMenusMap.Harbor.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.workload,
    innerMenus: [Models.PodModel.kind, Models.DeploymentModel.kind, Models.StatefulSetModel.kind, Models.SecretModel.kind, Models.ConfigMapModel.kind, Models.CronJobModel.kind, Models.JobModel.kind, Models.DaemonSetModel.kind, Models.ReplicaSetModel.kind, Models.HorizontalPodAutoscalerModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.networking,
    innerMenus: [Models.ServiceModel.kind, Models.IngressModel.kind, Models.NetworkPolicyModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.storage,
    innerMenus: [Models.PersistentVolumeModel.kind, Models.PersistentVolumeClaimModel.kind, Models.StorageClassModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.host,
    innerMenus: [Models.NodeModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.authentications,
    innerMenus: [Models.ServiceAccountModel.kind, Models.RoleModel.kind, Models.RoleBindingModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.management,
    innerMenus: [Models.ResourceQuotaModel.kind, Models.LimitRangeModel.kind, Models.CustomResourceDefinitionModel.kind],
  },
];

const DeveloperNavMenus = [
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: CustomMenusMap.Add.kind,
  },
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: CustomMenusMap.Topology.kind,
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.servicecatalogs,
    innerMenus: [ Models.TemplateModel.kind, Models.ClusterTemplateModel.kind, Models.ClusterTemplateClaimModel.kind, Models.TemplateInstanceModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.helm,
    innerMenus: [CustomMenusMap.HelmRepository.kind, CustomMenusMap.HelmChart.kind, CustomMenusMap.HelmRelease.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.servicemesh,
    innerMenus: [Models.VirtualServiceModel.kind, Models.DestinationRuleModel.kind, Models.EnvoyFilterModel.kind, Models.GatewayModel.kind, Models.SidecarModel.kind, Models.ServiceEntryModel.kind, Models.RequestAuthenticationModel.kind, Models.PeerAuthenticationModel.kind, Models.AuthorizationPolicyModel.kind, CustomMenusMap.Kiali.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels['ci/cd'],
    innerMenus: [Models.TaskModel.kind, Models.ClusterTaskModel.kind, Models.TaskRunModel.kind, Models.PipelineModel.kind, Models.PipelineRunModel.kind, Models.ApprovalModel.kind, Models.PipelineResourceModel.kind, Models.IntegrationJobModel.kind, Models.IntegrationConfigModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.aidevops,
    innerMenus: [Models.NotebookModel.kind, Models.ExperimentModel.kind, Models.TrainingJobModel.kind, Models.InferenceServiceModel.kind, Models.TrainedModelModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.kafka,
    innerMenus: [Models.KafkaClusterModel.kind, Models.KafkaConnectModel.kind, Models.KafkaConnectorModel.kind, Models.KafkaBridgeModel.kind, Models.KafkaMirrorMaker2Model.kind, Models.KafkaRebalanceModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.redis,
    innerMenus: [Models.RedisModel.kind, Models.RedisClusterModel.kind],
  },
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: Models.ServiceBindingModel.kind,
  },
];

const MultiNavMenus = [
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: Models.ClusterManagerModel.kind,
  },
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: Models.TFApplyClaimModel.kind,
  },
  // { MEMO : 추후 페더레이션 메뉴 활성화하려면 주석 처리 풀어주면 됨.
  //   menuType: MenuType.CONTAINER,
  //   label: MenuContainerLabels.federation,
  //   innerMenus: [
  //     Models.FederatedPodModel.kind,
  //     Models.FederatedDeploymentModel.kind,
  //     Models.FederatedReplicaSetModel.kind,
  //     Models.FederatedHPAModel.kind,
  //     Models.FederatedDaemonSetModel.kind,
  //     Models.FederatedStatefulSetModel.kind,
  //     Models.FederatedConfigMapModel.kind,
  //     Models.FederatedSecretModel.kind,
  //     Models.FederatedJobModel.kind,
  //     Models.FederatedCronJobModel.kind,
  //     MenuType.SEPERATOR,
  //     Models.FederatedIngressModel.kind,
  //     Models.FederatedServiceModel.kind,
  //     MenuType.SEPERATOR,
  //     Models.FederatedNamespaceModel.kind,
  //   ],
  // },
];

const SingleNavMenus = [
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.home,
    innerMenus: [CustomMenusMap.Dashboard.kind, Models.NamespaceModel.kind, CustomMenusMap.Search.kind, CustomMenusMap.Events.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.workload,
    innerMenus: [Models.PodModel.kind, Models.DeploymentModel.kind, Models.StatefulSetModel.kind, Models.SecretModel.kind, Models.ConfigMapModel.kind, Models.CronJobModel.kind, Models.JobModel.kind, Models.DaemonSetModel.kind, Models.ReplicaSetModel.kind, Models.HorizontalPodAutoscalerModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.networking,
    innerMenus: [Models.ServiceModel.kind, Models.IngressModel.kind, Models.NetworkPolicyModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.storage,
    innerMenus: [Models.StorageClassModel.kind, Models.PersistentVolumeClaimModel.kind, Models.PersistentVolumeModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.host,
    innerMenus: [Models.NodeModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.authentications,
    innerMenus: [Models.RoleModel.kind, Models.RoleBindingModel.kind, Models.ServiceAccountModel.kind, Models.PodSecurityPolicyModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.management,
    innerMenus: [Models.LimitRangeModel.kind, Models.ResourceQuotaModel.kind, Models.CustomResourceDefinitionModel.kind],
  },
];

const BaremetalNavMenus = [
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.ansible,
    innerMenus: [Models.AWXModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.provisioning,
    innerMenus: [Models.NodeConfigModel.kind, Models.BareMetalHostModel.kind],
  },
];

const SasNavMenus = [
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: 'SasApp',
  },
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: 'SasService',
  },
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: 'SasController',
  },
  {
    menuType: MenuType.REGISTERED_MENU,
    kind: 'SasNode',
  },
];

const CustomNavMenus = [
  {
    kind: 'Add',
    menuType: MenuType.REGISTERED_MENU,
  },
];

export default { MasterNavMenus, DeveloperNavMenus, MultiNavMenus, SingleNavMenus, BaremetalNavMenus, CustomNavMenus, SasNavMenus };

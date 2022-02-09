import { CustomMenusMap, MenuType, MenuContainerLabels } from '@console/internal/hypercloud/menu/menu-types';
import * as Models from '@console/internal/models';

const MasterNavMenus = [
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.home,
    innerMenus: [CustomMenusMap.Dashboard.kind, Models.NamespaceModel.kind, CustomMenusMap.Search.kind, CustomMenusMap.Audit.kind, CustomMenusMap.Events.kind, CustomMenusMap.ArgoCD.kind, CustomMenusMap.Grafana.kind, CustomMenusMap.Kibana.kind, CustomMenusMap.Git.kind, CustomMenusMap.Harbor.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.workload,
    innerMenus: [Models.PodModel.kind, Models.DeploymentModel.kind, Models.ReplicaSetModel.kind, Models.HorizontalPodAutoscalerModel.kind, Models.DaemonSetModel.kind, Models.StatefulSetModel.kind, Models.ConfigMapModel.kind, Models.SecretModel.kind, Models.JobModel.kind, Models.CronJobModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.helm,
    innerMenus: [Models.HelmReleaseModel.kind],
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
    label: MenuContainerLabels.management,
    innerMenus: [Models.LimitRangeModel.kind, Models.ResourceQuotaModel.kind, Models.PodSecurityPolicyModel.kind, Models.CustomResourceDefinitionModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.host,
    innerMenus: [Models.NodeModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.authentications,
    innerMenus: [Models.RoleModel.kind, Models.RoleBindingModel.kind, Models.ServiceAccountModel.kind],
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
    innerMenus: [Models.ServiceBrokerModel.kind, Models.ServiceClassModel.kind, Models.ClusterServiceBrokerModel.kind, Models.ClusterServiceClassModel.kind, Models.ServiceInstanceModel.kind, , Models.ServiceBindingModel.kind, Models.ClusterTemplateClaimModel.kind, Models.TemplateModel.kind, Models.ClusterTemplateModel.kind, Models.TemplateInstanceModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.servicemesh,
    innerMenus: [Models.VirtualServiceModel.kind, Models.DestinationRuleModel.kind, Models.EnvoyFilterModel.kind, Models.GatewayModel.kind, Models.SidecarModel.kind, , Models.ServiceEntryModel.kind, Models.RequestAuthenticationModel.kind, Models.PeerAuthenticationModel.kind, Models.AuthorizationPolicyModel.kind, CustomMenusMap.Kiali.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels['ci/cd'],
    innerMenus: [Models.TaskModel.kind, Models.ClusterTaskModel.kind, Models.TaskRunModel.kind, Models.PipelineModel.kind, Models.PipelineRunModel.kind, , Models.ApprovalModel.kind, Models.PipelineResourceModel.kind, Models.IntegrationJobModel.kind, Models.IntegrationConfigModel.kind, Models.ApplicationModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.aidevops,
    innerMenus: [Models.NotebookModel.kind, Models.ExperimentModel.kind, Models.TrainingJobModel.kind, Models.InferenceServiceModel.kind, Models.TrainedModelModel.kind],
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
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.federation,
    innerMenus: [
      Models.FederatedPodModel.kind,
      Models.FederatedDeploymentModel.kind,
      Models.FederatedReplicaSetModel.kind,
      Models.FederatedHPAModel.kind,
      Models.FederatedDaemonSetModel.kind,
      Models.FederatedStatefulSetModel.kind,
      Models.FederatedConfigMapModel.kind,
      Models.FederatedSecretModel.kind,
      Models.FederatedJobModel.kind,
      Models.FederatedCronJobModel.kind,
      MenuType.SEPERATOR,
      Models.FederatedIngressModel.kind,
      Models.FederatedServiceModel.kind,
      MenuType.SEPERATOR,
      Models.FederatedNamespaceModel.kind,
    ],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.ansible,
    innerMenus: [Models.AWXModel.kind],
  },
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
    innerMenus: [Models.PodModel.kind, Models.DeploymentModel.kind, Models.ReplicaSetModel.kind, Models.HorizontalPodAutoscalerModel.kind, Models.DaemonSetModel.kind, , Models.StatefulSetModel.kind, Models.ConfigMapModel.kind, Models.SecretModel.kind, Models.JobModel.kind, Models.CronJobModel.kind],
  },
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.helm,
    innerMenus: [Models.HelmReleaseModel.kind],
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
    label: MenuContainerLabels.management,
    innerMenus: [Models.LimitRangeModel.kind, Models.ResourceQuotaModel.kind, Models.CustomResourceDefinitionModel.kind],
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
  {
    menuType: MenuType.CONTAINER,
    label: MenuContainerLabels.provisioning2,
    innerMenus: [Models.NodeConfig2Model.kind, Models.BareMetalHost2Model.kind],
  },
];

const CustomNavMenus = [
  {
    kind: 'Add',
    menuType: MenuType.REGISTERED_MENU,
  },
];

export default { MasterNavMenus, DeveloperNavMenus, MultiNavMenus, SingleNavMenus, BaremetalNavMenus, CustomNavMenus };

import { Map as ImmutableMap } from 'immutable';
import { referenceForModel, GroupVersionKind } from '../../module/k8s';
import {
  PodSecurityPolicyModel,
  NamespaceClaimModel,
  ResourceQuotaClaimModel,
  RoleBindingClaimModel,
  ClusterManagerModel,
  FederatedConfigMapModel,
  FederatedDeploymentModel,
  FederatedIngressModel,
  FederatedNamespaceModel,
  FederatedJobModel,
  FederatedReplicaSetModel,
  FederatedSecretModel,
  FederatedServiceModel,
  FederatedPodModel,
  FederatedHPAModel,
  FederatedDaemonSetModel,
  FederatedStatefulSetModel,
  FederatedCronJobModel,
  VirtualMachineModel,
  VirtualMachineInstanceModel,
  VirtualServiceModel,
  DestinationRuleModel,
  EnvoyFilterModel,
  GatewayModel,
  SidecarModel,
  ServiceEntryModel,
  RequestAuthenticationModel,
  PeerAuthenticationModel,
  AuthorizationPolicyModel,
  DataVolumeModel,
  ServiceBrokerModel,
  ServiceClassModel,
  ServicePlanModel,
  ClusterServiceBrokerModel,
  ClusterServiceClassModel,
  ClusterServicePlanModel,
  ServiceInstanceModel,
  ServiceBindingModel,
  ClusterTemplateClaimModel,
  ClusterTemplateModel,
  TemplateModel,
  TemplateInstanceModel,
  TaskModel,
  ClusterTaskModel,
  TaskRunModel,
  PipelineModel,
  PipelineRunModel,
  ApprovalModel,
  PipelineResourceModel,
  RegistryModel,
  ExternalRegistryModel,
  ImageSignerModel,
  ImageSignRequestModel,
  ImageScanRequestModel,
  SignerPolicyModel,
  ImageReplicateModel,
  IntegrationConfigModel,
  IntegrationJobModel,
  ClusterClaimModel,
  RepositoryModel,
  NotebookModel,
  ExperimentModel,
  TrainingJobModel,
  TFJobModel,
  PyTorchJobModel,
  InferenceServiceModel,
  TrainedModelModel,
  WorkflowModel,
  WorkflowTemplateModel,
  TFApplyClaimModel,
  HelmReleaseModel,
  AWXModel,
  ClusterRegistrationModel,
  ApplicationModel,
  ClusterMenuPolicyModel,
  NodeConfigModel,
  BareMetalHostModel,
  KafkaBrokerModel,
  KafkaRebalanceModel,
  KafkaMirrorMaker2Model,
  KafkaBridgeModel,
  KafkaConnectorModel,
  KafkaConnectModel,
} from '../../models';

type ResourceMapKey = GroupVersionKind | string;
type ResourceMapValue = () => Promise<React.ComponentType<any>>;

export const hyperCloudDetailsPages = ImmutableMap<ResourceMapKey, ResourceMapValue>()
  .set(referenceForModel(PodSecurityPolicyModel), () => import('./pod-security-policy' /* webpackChunkName: "podsecuritypolicy" */).then(m => m.PodSecurityPoliciesDetailsPage))
  .set(referenceForModel(ResourceQuotaClaimModel), () => import('./resource-quota-claim' /* webpackChunkName: "resourcequotaclaim" */).then(m => m.ResourceQuotaClaimsDetailsPage))
  .set(referenceForModel(RoleBindingClaimModel), () => import('./role-binding-claim' /* webpackChunkName: "rolebindingclaim" */).then(m => m.RoleBindingClaimsDetailsPage))
  .set(referenceForModel(NamespaceClaimModel), () => import('./namespace-claim' /* webpackChunkName: "namespaceclaim" */).then(m => m.NamespaceClaimsDetailsPage))
  .set(referenceForModel(ClusterManagerModel), () => import('./cluster' /* webpackChunkName: "cluster" */).then(m => m.ClustersDetailsPage))
  .set(referenceForModel(ClusterClaimModel), () => import('./cluster-claim' /* webpackChunkName: "cluster-claim" */).then(m => m.ClusterClaimsDetailsPage))
  .set(referenceForModel(FederatedConfigMapModel), () => import('./federated-config-map' /* webpackChunkName: "configmap" */).then(m => m.FederatedConfigMapsDetailsPage))
  .set(referenceForModel(FederatedDeploymentModel), () => import('./federated-deployment' /* webpackChunkName: "deployment" */).then(m => m.FederatedDeploymentsDetailsPage))
  .set(referenceForModel(FederatedIngressModel), () => import('./federated-ingress' /* webpackChunkName: "ingress" */).then(m => m.FederatedIngressesDetailsPage))
  .set(referenceForModel(FederatedNamespaceModel), () => import('./federated-namespace' /* webpackChunkName: "namespace" */).then(m => m.FederatedNamespacesDetailsPage))
  .set(referenceForModel(FederatedJobModel), () => import('./federated-job' /* webpackChunkName: "job" */).then(m => m.FederatedJobsDetailsPage))
  .set(referenceForModel(FederatedReplicaSetModel), () => import('./federated-replica-set' /* webpackChunkName: "replica-set" */).then(m => m.FederatedReplicaSetsDetailsPage))
  .set(referenceForModel(FederatedSecretModel), () => import('./federated-secret' /* webpackChunkName: "secret" */).then(m => m.FederatedSecretsDetailsPage))
  .set(referenceForModel(FederatedServiceModel), () => import('./federated-service' /* webpackChunkName: "service" */).then(m => m.FederatedServicesDetailsPage))
  .set(referenceForModel(FederatedPodModel), () => import('./federated-pod' /* webpackChunkName: "pod" */).then(m => m.FederatedPodsDetailsPage))
  .set(referenceForModel(FederatedHPAModel), () => import('./federated-horizontalpodautoscaler' /* webpackChunkName: "horizontalpodautoscaler" */).then(m => m.FederatedHPAsDetailsPage))
  .set(referenceForModel(FederatedDaemonSetModel), () => import('./federated-daemonset' /* webpackChunkName: "daemonset" */).then(m => m.FederatedDaemonSetsDetailsPage))
  .set(referenceForModel(FederatedStatefulSetModel), () => import('./federated-statefulset' /* webpackChunkName: "statefulset" */).then(m => m.FederatedStatefulSetsDetailsPage))
  .set(referenceForModel(FederatedCronJobModel), () => import('./federated-cronjob' /* webpackChunkName: "cronjob" */).then(m => m.FederatedCronJobsDetailsPage))
  .set(referenceForModel(TaskModel), () => import('./task' /* webpackChunkName: "task" */).then(m => m.TasksDetailsPage))
  .set(referenceForModel(ClusterTaskModel), () => import('./cluster-task' /* webpackChunkName: "cluster-task" */).then(m => m.ClusterTasksDetailsPage))
  .set(referenceForModel(TaskRunModel), () => import('./task-run' /* webpackChunkName: "task-run" */).then(m => m.TaskRunsDetailsPage))
  .set(referenceForModel(PipelineModel), () => import('./pipeline' /* webpackChunkName: "pipeline" */).then(m => m.PipelinesDetailsPage))
  .set(referenceForModel(PipelineRunModel), () => import('./pipeline-run' /* webpackChunkName: "pipeline-run" */).then(m => m.PipelineRunsDetailsPage))
  .set(referenceForModel(ApprovalModel), () => import('./pipeline-approval' /* webpackChunkName: "pipeline-approval" */).then(m => m.PipelineApprovalsDetailsPage))
  .set(referenceForModel(PipelineResourceModel), () => import('./pipeline-resource' /* webpackChunkName: "pipeline-resource" */).then(m => m.PipelineResourcesDetailsPage))
  .set(referenceForModel(IntegrationConfigModel), () => import('./integration-config' /* webpackChunkName: "integration-config" */).then(m => m.IntegrationConfigsDetailsPage))
  .set(referenceForModel(IntegrationJobModel), () => import('./integration-job' /* webpackChunkName: "integration-job" */).then(m => m.IntegrationJobsDetailsPage))
  .set(referenceForModel(VirtualMachineModel), () => import('./virtual-machine' /* webpackChunkName: "virtual-machine" */).then(m => m.VirtualMachinesDetailsPage))
  .set(referenceForModel(VirtualMachineInstanceModel), () => import('./virtual-machine-instance' /* webpackChunkName: "virtual-machine-instance" */).then(m => m.VirtualMachineInstancesDetailsPage))
  .set(referenceForModel(VirtualServiceModel), () => import('./virtual-service' /* webpackChunkName: "virtual-service" */).then(m => m.VirtualServicesDetailsPage))
  .set(referenceForModel(DestinationRuleModel), () => import('./destination-rule' /* webpackChunkName: "destination-rule" */).then(m => m.DestinationRulesDetailsPage))
  .set(referenceForModel(EnvoyFilterModel), () => import('./envoy-filter' /* webpackChunkName: "envoy-filter" */).then(m => m.EnvoyFiltersDetailsPage))
  .set(referenceForModel(GatewayModel), () => import('./gateway' /* webpackChunkName: "gateway" */).then(m => m.GatewaysDetailsPage))
  .set(referenceForModel(SidecarModel), () => import('./sidecar' /* webpackChunkName: "sidecar" */).then(m => m.SidecarsDetailsPage))
  .set(referenceForModel(ServiceEntryModel), () => import('./service-entry' /* webpackChunkName: "service-entry" */).then(m => m.ServiceEntriesDetailsPage))
  .set(referenceForModel(RequestAuthenticationModel), () => import('./request-authentication' /* webpackChunkName: "request-authentication" */).then(m => m.RequestAuthenticationsDetailsPage))
  .set(referenceForModel(PeerAuthenticationModel), () => import('./peer-authentication' /* webpackChunkName: "peer-authentication" */).then(m => m.PeerAuthenticationsDetailsPage))
  .set(referenceForModel(AuthorizationPolicyModel), () => import('./authentication-policy' /* webpackChunkName: "authentication-policy" */).then(m => m.AuthorizationPoliciesDetailsPage))
  .set(referenceForModel(DataVolumeModel), () => import('./data-volume' /* webpackChunkName: "data-volume" */).then(m => m.DataVolumesDetailsPage))
  .set(referenceForModel(ServiceBrokerModel), () => import('./service-broker' /* webpackChunkName: "servicebroker" */).then(m => m.ServiceBrokersDetailsPage))
  .set(referenceForModel(ServiceClassModel), () => import('./service-class' /* webpackChunkName: "serviceclass" */).then(m => m.ServiceClassesDetailsPage))
  .set(referenceForModel(ServicePlanModel), () => import('./service-plan' /* webpackChunkName: "serviceplan" */).then(m => m.ServicePlansDetailsPage))
  .set(referenceForModel(ClusterServiceBrokerModel), () => import('./cluster-service-broker' /* webpackChunkName: "clusterservicebroker" */).then(m => m.ClusterServiceBrokersDetailsPage))
  .set(referenceForModel(ClusterServiceClassModel), () => import('./cluster-service-class' /* webpackChunkName: "clusterserviceclass" */).then(m => m.ClusterServiceClassesDetailsPage))
  .set(referenceForModel(ClusterServicePlanModel), () => import('./cluster-service-plan' /* webpackChunkName: "clusterserviceplan" */).then(m => m.ClusterServicePlansDetailsPage))
  .set(referenceForModel(ServiceInstanceModel), () => import('./service-instance' /* webpackChunkName: "serviceinstance" */).then(m => m.ServiceInstancesDetailsPage))
  .set(referenceForModel(ServiceBindingModel), () => import('./service-binding' /* webpackChunkName: "servicebinding" */).then(m => m.ServiceBindingsDetailsPage))
  .set(referenceForModel(ClusterTemplateClaimModel), () => import('./cluster-template-claim' /* webpackChunkName: "clustertemplateclaim" */).then(m => m.ClusterTemplateClaimsDetailsPage))
  .set(referenceForModel(ClusterTemplateModel), () => import('./cluster-template' /* webpackChunkName: "clustertemplate" */).then(m => m.ClusterTemplatesDetailsPage))
  .set(referenceForModel(TemplateModel), () => import('./template' /* webpackChunkName: "template" */).then(m => m.TemplatesDetailsPage))
  .set(referenceForModel(TemplateInstanceModel), () => import('./template-instance' /* webpackChunkName: "templateinstance" */).then(m => m.TemplateInstancesDetailsPage))
  .set(referenceForModel(RegistryModel), () => import('./registry' /* webpackChunkName: "registry" */).then(m => m.RegistriesDetailsPage))
  .set(referenceForModel(ExternalRegistryModel), () => import('./external-registry' /* webpackChunkName: "external-registry" */).then(m => m.ExternalRegistriesDetailsPage))
  .set(referenceForModel(RepositoryModel), () => import('./repository' /* webpackChunkName: "repository" */).then(m => m.RepositoriesDetailsPage))
  .set(referenceForModel(ImageSignerModel), () => import('./image-signer' /* webpackChunkName: "image-signer" */).then(m => m.ImageSignersDetailsPage))
  .set(referenceForModel(ImageSignRequestModel), () => import('./image-sign-request' /* webpackChunkName: "image-sign-request" */).then(m => m.ImageSignRequestsDetailsPage))
  .set(referenceForModel(SignerPolicyModel), () => import('./signer-policy' /* webpackChunkName: "image-sign-request" */).then(m => m.SignerPoliciesDetailsPage))
  .set(referenceForModel(ImageScanRequestModel), () => import('./image-scan-request' /* webpackChunkName: "image-sign-request" */).then(m => m.ImageScanRequestsDetailsPage))
  .set(referenceForModel(NotebookModel), () => import('./notebook' /* webpackChunkName: "notebook" */).then(m => m.NotebooksDetailsPage))
  .set(referenceForModel(ExperimentModel), () => import('./experiment' /* webpackChunkName: "experiment" */).then(m => m.ExperimentsDetailsPage))
  .set(referenceForModel(TFJobModel), () => import('./training-job' /* webpackChunkName: "training-job" */).then(m => m.TrainingJobsDetailsPage))
  .set(referenceForModel(PyTorchJobModel), () => import('./training-job' /* webpackChunkName: "training-job" */).then(m => m.TrainingJobsDetailsPage))
  .set(referenceForModel(InferenceServiceModel), () => import('./inference-service' /* webpackChunkName: "inference-service" */).then(m => m.InferenceServicesDetailsPage))
  .set(referenceForModel(TrainedModelModel), () => import('./trained-model' /* webpackChunkName: "trained-model" */).then(m => m.TrainedModelsDetailsPage))
  .set(referenceForModel(WorkflowModel), () => import('./workflow' /* webpackChunkName: "workflow" */).then(m => m.WorkflowsDetailsPage))
  .set(referenceForModel(WorkflowTemplateModel), () => import('./workflow-template' /* webpackChunkName: "workflow-template" */).then(m => m.WorkflowTemplatesDetailsPage))
  .set(referenceForModel(ImageReplicateModel), () => import('./image-replicate' /* webpackChunkName: "image-sign-request" */).then(m => m.ImageReplicatesDetailsPage))
  .set(referenceForModel(TFApplyClaimModel), () => import('./terraform-apply-claim' /* webpackChunkName: "image-sign-request" */).then(m => m.TFApplyClaimsDetailsPage))
  .set(referenceForModel(HelmReleaseModel), () => import('./helm-release' /* webpackChunkName: "helm-release" */).then(m => m.HelmReleaseDetailsPage))
  .set(referenceForModel(AWXModel), () => import('./awx' /* webpackChunkName: "awx" */).then(m => m.AWXsDetailsPage))
  .set(referenceForModel(ClusterRegistrationModel), () => import('./cluster-registration' /* webpackChunkName: "cluster-registration" */).then(m => m.ClusterRegistrationsDetailsPage))
  .set(referenceForModel(ApplicationModel), () => import('./application' /* webpackChunkName: "application" */).then(m => m.ApplicationsDetailsPage))
  .set(referenceForModel(ClusterMenuPolicyModel), () => import('./cluster-menu-policy' /* webpackChunkName: "cluster-menu-policy" */).then(m => m.ClusterMenuPoliciesDetailsPage))
  .set(referenceForModel(NodeConfigModel), () => import('./nodeconfig' /* webpackChunkName: "nodeconfig" */).then(m => m.NodeConfigsDetailsPage))
  .set(referenceForModel(BareMetalHostModel), () => import('./baremetal-host' /* webpackChunkName: "baremetal-host" */).then(m => m.BareMetalHostsDetailsPage))
  .set(referenceForModel(KafkaBrokerModel), () => import('./kafkabroker' /* webpackChunkName: "kafkabroker" */).then(m => m.KafkaBrokersDetailsPage))
  .set(referenceForModel(KafkaRebalanceModel), () => import('./kafkarebalance' /* webpackChunkName: "kafkarebalance" */).then(m => m.KafkaRebalancesDetailsPage))
  .set(referenceForModel(KafkaMirrorMaker2Model), () => import('./kafkamirrormaker2' /* webpackChunkName: "kafkamirrormaker2" */).then(m => m.KafkaMirrorMaker2sDetailsPage))
  .set(referenceForModel(KafkaBridgeModel), () => import('./kafkabridge' /* webpackChunkName: "kafkabridge" */).then(m => m.KafkaBridgesDetailsPage))
  .set(referenceForModel(KafkaConnectorModel), () => import('./kafka-connector' /* webpackChunkName: "kafka-connector" */).then(m => m.KafkaConnectorsDetailsPage))
  .set(referenceForModel(KafkaConnectModel), () => import('./kafka-connect' /* webpackChunkName: "kafka-connect" */).then(m => m.KafkaConnectsDetailsPage));

export const hyperCloudListPages = ImmutableMap<ResourceMapKey, ResourceMapValue>()
  .set(referenceForModel(PodSecurityPolicyModel), () => import('./pod-security-policy' /* webpackChunkName: "pod-security-policy" */).then(m => m.PodSecurityPoliciesPage))
  .set(referenceForModel(ClusterManagerModel), () => import('./cluster' /* webpackChunkName: "cluster" */).then(m => m.ClustersPage))
  .set(referenceForModel(ClusterClaimModel), () => import('./cluster-claim' /* webpackChunkName: "cluster-claim" */).then(m => m.ClusterClaimsPage))
  .set(referenceForModel(FederatedConfigMapModel), () => import('./federated-config-map' /* webpackChunkName: "configmap" */).then(m => m.FederatedConfigMapsPage))
  .set(referenceForModel(FederatedDeploymentModel), () => import('./federated-deployment' /* webpackChunkName: "deployment" */).then(m => m.FederatedDeploymentsPage))
  .set(referenceForModel(FederatedIngressModel), () => import('./federated-ingress' /* webpackChunkName: "ingress" */).then(m => m.FederatedIngressesPage))
  .set(referenceForModel(FederatedNamespaceModel), () => import('./federated-namespace' /* webpackChunkName: "namespace" */).then(m => m.FederatedNamespacesPage))
  .set(referenceForModel(FederatedJobModel), () => import('./federated-job' /* webpackChunkName: "job" */).then(m => m.FederatedJobsPage))
  .set(referenceForModel(FederatedReplicaSetModel), () => import('./federated-replica-set' /* webpackChunkName: "replica-set" */).then(m => m.FederatedReplicaSetsPage))
  .set(referenceForModel(FederatedSecretModel), () => import('./federated-secret' /* webpackChunkName: "secret" */).then(m => m.FederatedSecretsPage))
  .set(referenceForModel(FederatedServiceModel), () => import('./federated-service' /* webpackChunkName: "service" */).then(m => m.FederatedServicesPage))
  .set(referenceForModel(FederatedPodModel), () => import('./federated-pod' /* webpackChunkName: "pod" */).then(m => m.FederatedPodsPage))
  .set(referenceForModel(FederatedHPAModel), () => import('./federated-horizontalpodautoscaler' /* webpackChunkName: "horizontalpodautoscaler" */).then(m => m.FederatedHPAsPage))
  .set(referenceForModel(FederatedDaemonSetModel), () => import('./federated-daemonset' /* webpackChunkName: "daemonset" */).then(m => m.FederatedDaemonSetsPage))
  .set(referenceForModel(FederatedStatefulSetModel), () => import('./federated-statefulset' /* webpackChunkName: "statefulset" */).then(m => m.FederatedStatefulSetsPage))
  .set(referenceForModel(FederatedCronJobModel), () => import('./federated-cronjob' /* webpackChunkName: "cronjob" */).then(m => m.FederatedCronJobsPage))
  .set(referenceForModel(TaskModel), () => import('./task' /* webpackChunkName: "task" */).then(m => m.TasksPage))
  .set(referenceForModel(ClusterTaskModel), () => import('./cluster-task' /* webpackChunkName: "cluster-task" */).then(m => m.ClusterTasksPage))
  .set(referenceForModel(TaskRunModel), () => import('./task-run' /* webpackChunkName: "task-run" */).then(m => m.TaskRunsPage))
  .set(referenceForModel(PipelineModel), () => import('./pipeline' /* webpackChunkName: "pipeline" */).then(m => m.PipelinesPage))
  .set(referenceForModel(PipelineRunModel), () => import('./pipeline-run' /* webpackChunkName: "pipeline-run" */).then(m => m.PipelineRunsPage))
  .set(referenceForModel(ApprovalModel), () => import('./pipeline-approval' /* webpackChunkName: "pipeline-approval" */).then(m => m.PipelineApprovalsPage))
  .set(referenceForModel(PipelineResourceModel), () => import('./pipeline-resource' /* webpackChunkName: "pipeline-resource" */).then(m => m.PipelineResourcesPage))
  .set(referenceForModel(IntegrationConfigModel), () => import('./integration-config' /* webpackChunkName: "integration-config" */).then(m => m.IntegrationConfigsPage))
  .set(referenceForModel(IntegrationJobModel), () => import('./integration-job' /* webpackChunkName: "integration-job" */).then(m => m.IntegrationJobsPage))
  .set(referenceForModel(VirtualMachineModel), () => import('./virtual-machine' /* webpackChunkName: "virtual-machine" */).then(m => m.VirtualMachinesPage))
  .set(referenceForModel(VirtualMachineInstanceModel), () => import('./virtual-machine-instance' /* webpackChunkName: "virtual-machine-instance" */).then(m => m.VirtualMachineInstancesPage))
  .set(referenceForModel(VirtualServiceModel), () => import('./virtual-service' /* webpackChunkName: "virtual-service" */).then(m => m.VirtualServicesPage))
  .set(referenceForModel(DestinationRuleModel), () => import('./destination-rule' /* webpackChunkName: "destination-rule" */).then(m => m.DestinationRulesPage))
  .set(referenceForModel(EnvoyFilterModel), () => import('./envoy-filter' /* webpackChunkName: "envoy-filter" */).then(m => m.EnvoyFiltersPage))
  .set(referenceForModel(GatewayModel), () => import('./gateway' /* webpackChunkName: "gateway" */).then(m => m.GatewaysPage))
  .set(referenceForModel(SidecarModel), () => import('./sidecar' /* webpackChunkName: "sidecar" */).then(m => m.SidecarsPage))
  .set(referenceForModel(ServiceEntryModel), () => import('./service-entry' /* webpackChunkName: "service-entry" */).then(m => m.ServiceEntriesPage))
  .set(referenceForModel(RequestAuthenticationModel), () => import('./request-authentication' /* webpackChunkName: "request-authentication" */).then(m => m.RequestAuthenticationsPage))
  .set(referenceForModel(PeerAuthenticationModel), () => import('./peer-authentication' /* webpackChunkName: "peer-authentication" */).then(m => m.PeerAuthenticationsPage))
  .set(referenceForModel(AuthorizationPolicyModel), () => import('./authentication-policy' /* webpackChunkName: "authentication-policy" */).then(m => m.AuthorizationPoliciesPage))
  .set(referenceForModel(DataVolumeModel), () => import('./data-volume' /* webpackChunkName: "data-volume" */).then(m => m.DataVolumesPage))
  .set(referenceForModel(ResourceQuotaClaimModel), () => import('./resource-quota-claim' /* webpackChunkName: "resourcequotaclaim" */).then(m => m.ResourceQuotaClaimsPage))
  .set(referenceForModel(RoleBindingClaimModel), () => import('./role-binding-claim' /* webpackChunkName: "rolebindingclaim" */).then(m => m.RoleBindingClaimsPage))
  .set(referenceForModel(NamespaceClaimModel), () => import('./namespace-claim' /* webpackChunkName: "namespaceclaim" */).then(m => m.NamespaceClaimsPage))
  .set(referenceForModel(ServiceBrokerModel), () => import('./service-broker' /* webpackChunkName: "servicebroker" */).then(m => m.ServiceBrokersPage))
  .set(referenceForModel(ServiceClassModel), () => import('./service-class' /* webpackChunkName: "serviceclass" */).then(m => m.ServiceClassesPage))
  .set(referenceForModel(ServicePlanModel), () => import('./service-plan' /* webpackChunkName: "serviceplan" */).then(m => m.ServicePlansPage))
  .set(referenceForModel(ClusterServiceBrokerModel), () => import('./cluster-service-broker' /* webpackChunkName: "clusterservicebroker" */).then(m => m.ClusterServiceBrokersPage))
  .set(referenceForModel(ClusterServiceClassModel), () => import('./cluster-service-class' /* webpackChunkName: "clusterserviceclass" */).then(m => m.ClusterServiceClassesPage))
  .set(referenceForModel(ClusterServicePlanModel), () => import('./cluster-service-plan' /* webpackChunkName: "clusterserviceplan" */).then(m => m.ClusterServicePlansPage))
  .set(referenceForModel(ServiceInstanceModel), () => import('./service-instance' /* webpackChunkName: "serviceinstance" */).then(m => m.ServiceInstancesPage))
  .set(referenceForModel(ServiceBindingModel), () => import('./service-binding' /* webpackChunkName: "servicebinding" */).then(m => m.ServiceBindingsPage))
  .set(referenceForModel(ClusterTemplateClaimModel), () => import('./cluster-template-claim' /* webpackChunkName: "clustertemplateclaim" */).then(m => m.ClusterTemplateClaimsPage))
  .set(referenceForModel(ClusterTemplateModel), () => import('./cluster-template' /* webpackChunkName: "clustertemplate" */).then(m => m.ClusterTemplatesPage))
  .set(referenceForModel(TemplateModel), () => import('./template' /* webpackChunkName: "template" */).then(m => m.TemplatesPage))
  .set(referenceForModel(TemplateInstanceModel), () => import('./template-instance' /* webpackChunkName: "templateinstance" */).then(m => m.TemplateInstancesPage))
  .set(referenceForModel(RepositoryModel), () => import('./repository' /* webpackChunkName: "repository" */).then(m => m.RepositoriesPage))
  .set(referenceForModel(RegistryModel), () => import('./registry' /* webpackChunkName: "registry" */).then(m => m.RegistriesPage))
  .set(referenceForModel(ExternalRegistryModel), () => import('./external-registry' /* webpackChunkName: "external-registry" */).then(m => m.ExternalRegistriesPage))
  .set(referenceForModel(ImageSignerModel), () => import('./image-signer' /* webpackChunkName: "image-signer" */).then(m => m.ImageSignersPage))
  .set(referenceForModel(ImageSignRequestModel), () => import('./image-sign-request' /* webpackChunkName: "image-sign-request" */).then(m => m.ImageSignRequestsPage))
  .set(referenceForModel(SignerPolicyModel), () => import('./signer-policy' /* webpackChunkName: "image-sign-request" */).then(m => m.SignerPoliciesPage))
  .set(referenceForModel(ImageScanRequestModel), () => import('./image-scan-request' /* webpackChunkName: "image-scan-request" */).then(m => m.ImageScanRequestsPage))
  .set(referenceForModel(NotebookModel), () => import('./notebook' /* webpackChunkName: "notebook" */).then(m => m.NotebooksPage))
  .set(referenceForModel(ExperimentModel), () => import('./experiment' /* webpackChunkName: "experiment" */).then(m => m.ExperimentsPage))
  .set(referenceForModel(TrainingJobModel), () => import('./training-job' /* webpackChunkName: "training-job" */).then(m => m.TrainingJobsPage))
  .set(referenceForModel(InferenceServiceModel), () => import('./inference-service' /* webpackChunkName: "inference-service" */).then(m => m.InferenceServicesPage))
  .set(referenceForModel(TrainedModelModel), () => import('./trained-model' /* webpackChunkName: "trained-model" */).then(m => m.TrainedModelsPage))
  .set(referenceForModel(WorkflowModel), () => import('./workflow' /* webpackChunkName: "workflow" */).then(m => m.WorkflowsPage))
  .set(referenceForModel(WorkflowTemplateModel), () => import('./workflow-template' /* webpackChunkName: "workflow-template" */).then(m => m.WorkflowTemplatesPage))
  .set(referenceForModel(ImageReplicateModel), () => import('./image-replicate' /* webpackChunkName: "image-sign-request" */).then(m => m.ImageReplicatesPage))
  .set(referenceForModel(TFApplyClaimModel), () => import('./terraform-apply-claim' /* webpackChunkName: "image-sign-request" */).then(m => m.TFApplyClaimsPage))
  .set(referenceForModel(HelmReleaseModel), () => import('./helm-release' /* webpackChunkName: "helm-release" */).then(m => m.HelmReleasePage))
  .set(referenceForModel(AWXModel), () => import('./awx' /* webpackChunkName: "awx" */).then(m => m.AWXsPage))
  .set(referenceForModel(ClusterRegistrationModel), () => import('./cluster-registration' /* webpackChunkName: "cluster-registration" */).then(m => m.ClusterRegistrationsPage))
  .set(referenceForModel(ApplicationModel), () => import('./application' /* webpackChunkName: "application" */).then(m => m.ApplicationsPage))
  .set(referenceForModel(ClusterMenuPolicyModel), () => import('./cluster-menu-policy' /* webpackChunkName: "cluster-menu-policy" */).then(m => m.ClusterMenuPoliciesPage))
  .set(referenceForModel(NodeConfigModel), () => import('./nodeconfig' /* webpackChunkName: "nodeconfig" */).then(m => m.NodeConfigsPage))
  .set(referenceForModel(BareMetalHostModel), () => import('./baremetal-host' /* webpackChunkName: "baremetal-host" */).then(m => m.BareMetalHostsPage))
  .set(referenceForModel(KafkaBrokerModel), () => import('./kafkabroker' /* webpackChunkName: "kafkabroker" */).then(m => m.KafkaBrokersPage))
  .set(referenceForModel(KafkaRebalanceModel), () => import('./kafkarebalance' /* webpackChunkName: "kafkarebalance" */).then(m => m.KafkaRebalancesPage))
  .set(referenceForModel(KafkaMirrorMaker2Model), () => import('./kafkamirrormaker2' /* webpackChunkName: "kafkamirrormaker2" */).then(m => m.KafkaMirrorMaker2sPage))
  .set(referenceForModel(KafkaBridgeModel), () => import('./kafkabridge' /* webpackChunkName: "kafkabridge" */).then(m => m.KafkaBridgesPage))
  .set(referenceForModel(KafkaConnectorModel), () => import('./kafka-connector' /* webpackChunkName: "kafka-connector" */).then(m => m.KafkaConnectorsPage))
  .set(referenceForModel(KafkaConnectModel), () => import('./kafka-connect' /* webpackChunkName: "kafka-connect" */).then(m => m.KafkaConnectsPage));

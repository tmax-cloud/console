import { K8sKind } from '../../module/k8s';
import { MenuLinkType } from '@console/internal/hypercloud/menu/menu-types';
import startsWith from '@console/internal/hypercloud/menu/starts-with';

export const HyperClusterResourceModel: K8sKind = {
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiVersion: 'v1',
  apiGroup: 'hyper.multi.tmax.io',
  plural: 'hyperclusterresources',
  abbr: 'C',
  kind: 'HyperClusterResource',
  id: 'hyperclusterresource',
  namespaced: false,
};

export const ClusterManagerModel: K8sKind = {
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiVersion: 'v1alpha1',
  apiGroup: 'cluster.tmax.io',
  plural: 'clustermanagers',
  abbr: 'CM',
  kind: 'ClusterManager',
  id: 'clustermanager',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
    startsWith: startsWith.clustermanagersStartsWith,
  },
};

export const ClusterClaimModel: K8sKind = {
  label: 'ClusterClaim',
  labelPlural: 'Clusters Claims',
  apiVersion: 'v1alpha1',
  apiGroup: 'claim.tmax.io',
  plural: 'clusterclaims',
  abbr: 'CC',
  kind: 'ClusterClaim',
  id: 'clusterclaim',
  namespaced: true,
};

export const SignerPolicyModel: K8sKind = {
  kind: 'SignerPolicy',
  label: 'Signer Policy',
  labelPlural: 'Signer Policies',
  apiGroup: 'tmax.io',
  apiVersion: 'v1',
  abbr: 'SP',
  namespaced: true,
  crd: false,
  id: 'signerpolicy',
  plural: 'signerpolicies',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ImageReplicateModel: K8sKind = {
  kind: 'ImageReplicate',
  label: 'Image Replicate',
  labelPlural: 'Image Replicates',
  apiGroup: 'tmax.io',
  apiVersion: 'v1',
  abbr: 'IR',
  namespaced: true,
  crd: false,
  id: 'imagereplicate',
  plural: 'imagereplicates',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const PodSecurityPolicyModel: K8sKind = {
  kind: 'PodSecurityPolicy',
  namespaced: false,
  label: 'Pod Security Policy',
  plural: 'podsecuritypolicies',
  apiVersion: 'v1beta1',
  abbr: 'PSP',
  apiGroup: 'policy',
  labelPlural: 'Pod Security Policies',
  id: 'podsecuritypolicie',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const FederatedConfigMapModel: K8sKind = {
  label: 'Federated Config Map',
  labelPlural: 'Federated Config Maps',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedconfigmaps',
  abbr: 'FCM',
  kind: 'FederatedConfigMap',
  id: 'federatedconfigmap',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedDeploymentModel: K8sKind = {
  label: 'Federated Deployment',
  labelPlural: 'Federated Deployments',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federateddeployments',
  abbr: 'FDEPLOY',
  kind: 'FederatedDeployment',
  id: 'federateddeployment',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedIngressModel: K8sKind = {
  label: 'Federated Ingress',
  labelPlural: 'Federated Ingresses',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedingresses',
  abbr: 'FING',
  kind: 'FederatedIngress',
  id: 'federatedingress',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedJobModel: K8sKind = {
  label: 'Federated Job',
  labelPlural: 'Federated Jobs',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedjobs',
  abbr: 'FJ',
  kind: 'FederatedJob',
  id: 'federatedjob',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedNamespaceModel: K8sKind = {
  label: 'Federated Namespace',
  labelPlural: 'Federated Namespaces',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatednamespaces',
  abbr: 'FNS',
  kind: 'FederatedNamespace',
  id: 'federatednamespace',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedReplicaSetModel: K8sKind = {
  label: 'Federated Replica Set',
  labelPlural: 'Federated Replica Sets',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedreplicasets',
  abbr: 'FRS',
  kind: 'FederatedReplicaSet',
  id: 'federatedreplicaset',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedSecretModel: K8sKind = {
  label: 'Federated Secret',
  labelPlural: 'Federated Secrets',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedsecrets',
  abbr: 'FS',
  kind: 'FederatedSecret',
  id: 'federatedsecret',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedServiceModel: K8sKind = {
  label: 'Federated Service',
  labelPlural: 'Federated Services',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedservices',
  abbr: 'FSVC',
  kind: 'FederatedService',
  id: 'federatedservice',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedPodModel: K8sKind = {
  label: 'Federated Pod',
  labelPlural: 'Federated Pods',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedpods',
  abbr: 'FPO',
  kind: 'FederatedPod',
  id: 'federatedpod',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
    startsWith: startsWith.clustermanagersStartsWith,
  },
};

export const FederatedHPAModel: K8sKind = {
  label: 'Federated Horizontal Pod Autoscaler',
  labelPlural: 'Federated Horizontal Pod Autoscalers',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedhorizontalpodautoscalers',
  abbr: 'FHPA',
  kind: 'FederatedHorizontalPodAutoscaler',
  id: 'federatedhorizontalpodautoscaler',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedDaemonSetModel: K8sKind = {
  label: 'Federated Daemon Set',
  labelPlural: 'Federated Daemon Sets',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federateddaemonsets',
  abbr: 'FDS',
  kind: 'FederatedDaemonSet',
  id: 'federateddaemonset',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedStatefulSetModel: K8sKind = {
  label: 'Federated Stateful Set',
  labelPlural: 'Federated Stateful Sets',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedstatefulsets',
  abbr: 'FSTS',
  kind: 'FederatedStatefulSet',
  id: 'federatedstatefulset',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const FederatedCronJobModel: K8sKind = {
  label: 'Federated Cron Job',
  labelPlural: 'Federated Cron Jobs',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedcronjobs',
  abbr: 'FCJ',
  kind: 'FederatedCronJob',
  id: 'federatedcronjob',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const RegistryModel: K8sKind = {
  kind: 'Registry',
  namespaced: true,
  label: 'Registry',
  plural: 'registries',
  apiVersion: 'v1',
  abbr: 'RG',
  apiGroup: 'tmax.io',
  labelPlural: 'Registries',
  id: 'registry',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ExternalRegistryModel: K8sKind = {
  kind: 'ExternalRegistry',
  namespaced: true,
  label: 'External Registry',
  plural: 'externalregistries',
  apiVersion: 'v1',
  abbr: 'ERG',
  apiGroup: 'tmax.io',
  labelPlural: 'External Registries',
  id: 'externalregistry',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const RepositoryModel: K8sKind = {
  kind: 'Repository',
  namespaced: true,
  label: 'Repository',
  plural: 'repositories',
  apiVersion: 'v1',
  abbr: 'RP',
  apiGroup: 'tmax.io',
  labelPlural: 'Repositories',
  id: 'repository',
  crd: false,
};

export const NotaryModel: K8sKind = {
  kind: 'Notary',
  namespaced: true,
  label: 'Notary',
  plural: 'notaries',
  apiVersion: 'v1',
  abbr: 'N',
  apiGroup: 'tmax.io',
  labelPlural: 'Notaries',
  id: 'notary',
  crd: false,
};

export const ImageModel: K8sKind = {
  label: 'Image',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'images',
  abbr: 'I',
  namespaced: true,
  kind: 'Image',
  id: 'image',
  labelPlural: 'Images',
  crd: false,
};

export const ImageSignerModel: K8sKind = {
  label: 'Image Signer',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'imagesigners',
  abbr: 'IS',
  namespaced: false,
  kind: 'ImageSigner',
  id: 'imagesigner',
  labelPlural: 'Image Signers',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const ImageSignRequestModel: K8sKind = {
  label: 'Image Sign Request',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'imagesignrequests',
  abbr: 'ISR',
  namespaced: true,
  kind: 'ImageSignRequest',
  id: 'imagesignrequest',
  labelPlural: 'Image Sign Requests',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};
export const ImageScanRequestModel: K8sKind = {
  label: 'Image Scan Request',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'imagescanrequests',
  abbr: 'ISR',
  namespaced: true,
  kind: 'ImageScanRequest',
  id: 'imagescanrequest',
  labelPlural: 'Image Scan Requests',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const TaskModel: K8sKind = {
  kind: 'Task',
  namespaced: true,
  label: 'Task',
  plural: 'tasks',
  apiVersion: 'v1beta1',
  abbr: 'TK',
  apiGroup: 'tekton.dev',
  labelPlural: 'Tasks',
  id: 'task',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ClusterTaskModel: K8sKind = {
  kind: 'ClusterTask',
  namespaced: false,
  label: 'ClusterTask',
  plural: 'clustertasks',
  apiVersion: 'v1beta1',
  abbr: 'CTK',
  apiGroup: 'tekton.dev',
  labelPlural: 'Cluster Tasks',
  id: 'clustertask',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const TaskRunModel: K8sKind = {
  kind: 'TaskRun',
  namespaced: true,
  label: 'Task Run',
  plural: 'taskruns',
  apiVersion: 'v1beta1',
  abbr: 'TR',
  apiGroup: 'tekton.dev',
  labelPlural: 'Task Runs',
  id: 'taskrun',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const PipelineModel: K8sKind = {
  kind: 'Pipeline',
  namespaced: true,
  label: 'Pipeline',
  plural: 'pipelines',
  apiVersion: 'v1beta1',
  abbr: 'P',
  apiGroup: 'tekton.dev',
  labelPlural: 'Pipelines',
  id: 'pipeline',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const PipelineRunModel: K8sKind = {
  kind: 'PipelineRun',
  namespaced: true,
  label: 'Pipeline Run',
  plural: 'pipelineruns',
  apiVersion: 'v1beta1',
  abbr: 'PR',
  apiGroup: 'tekton.dev',
  labelPlural: 'Pipeline Runs',
  id: 'pipelinerun',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ApprovalModel: K8sKind = {
  kind: 'Approval',
  namespaced: true,
  label: 'Approval',
  plural: 'approvals',
  apiVersion: 'v1',
  abbr: 'PA',
  apiGroup: 'cicd.tmax.io',
  labelPlural: 'Pipeline Approvals',
  id: 'approval',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const PipelineResourceModel: K8sKind = {
  kind: 'PipelineResource',
  namespaced: true,
  label: 'Pipeline Resource',
  plural: 'pipelineresources',
  apiVersion: 'v1alpha1',
  abbr: 'PRS',
  apiGroup: 'tekton.dev',
  labelPlural: 'Pipeline Resources',
  id: 'pipelineresource',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const IntegrationJobModel: K8sKind = {
  kind: 'IntegrationJob',
  namespaced: true,
  label: 'Integration Job',
  plural: 'integrationjobs',
  apiVersion: 'v1',
  abbr: 'IJ',
  apiGroup: 'cicd.tmax.io',
  labelPlural: 'Integration Jobs',
  id: 'integrationjob',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const IntegrationConfigModel: K8sKind = {
  kind: 'IntegrationConfig',
  namespaced: true,
  label: 'Integration Config',
  plural: 'integrationconfigs',
  apiVersion: 'v1',
  abbr: 'IC',
  apiGroup: 'cicd.tmax.io',
  labelPlural: 'Integration Configs',
  id: 'integrationconfig',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const VirtualMachineModel: K8sKind = {
  label: 'VirtualMachine',
  labelPlural: 'VirtualMachines',
  apiVersion: 'v1alpha3',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachines',
  abbr: 'vm',
  kind: 'VirtualMachine',
  id: 'virtualmachine',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const VirtualMachineInstanceModel: K8sKind = {
  label: 'VirtualMachineInstance',
  labelPlural: 'VirtualMachineInstances',
  apiVersion: 'v1alpha3',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstances',
  abbr: 'vmi',
  kind: 'VirtualMachineInstance',
  id: 'virtualmachineinstance',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const VirtualServiceModel: K8sKind = {
  label: 'Virtual Service',
  labelPlural: 'Virtual Services',
  apiVersion: 'v1alpha3',
  apiGroup: 'networking.istio.io',
  plural: 'virtualservices',
  abbr: 'vs',
  kind: 'VirtualService',
  id: 'virtualservice',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const DestinationRuleModel: K8sKind = {
  label: 'Destination Rule',
  labelPlural: 'Destination Rules',
  apiVersion: 'v1alpha3',
  apiGroup: 'networking.istio.io',
  plural: 'destinationrules',
  abbr: 'dr',
  kind: 'DestinationRule',
  id: 'destinationrule',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const EnvoyFilterModel: K8sKind = {
  label: 'Envoy Filter',
  labelPlural: 'Envoy Filters',
  apiVersion: 'v1alpha3',
  apiGroup: 'networking.istio.io',
  plural: 'envoyfilters',
  abbr: 'ef',
  kind: 'EnvoyFilter',
  id: 'envoyfilter',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const GatewayModel: K8sKind = {
  label: 'Gateway',
  labelPlural: 'Gateways',
  apiVersion: 'v1alpha3',
  apiGroup: 'networking.istio.io',
  plural: 'gateways',
  abbr: 'g',
  kind: 'Gateway',
  id: 'gateway',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const SidecarModel: K8sKind = {
  label: 'Sidecar',
  labelPlural: 'Sidecars',
  apiVersion: 'v1alpha3',
  apiGroup: 'networking.istio.io',
  plural: 'sidecars',
  abbr: 'sc',
  kind: 'Sidecar',
  id: 'sidecar',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ServiceEntryModel: K8sKind = {
  label: 'Service Entry',
  labelPlural: 'Service Entries',
  apiVersion: 'v1alpha3',
  apiGroup: 'networking.istio.io',
  plural: 'serviceentries',
  abbr: 'se',
  kind: 'ServiceEntry',
  id: 'serviceentry',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const RequestAuthenticationModel: K8sKind = {
  label: 'Request Authentication',
  labelPlural: 'Request Authentications',
  apiVersion: 'v1beta1',
  apiGroup: 'security.istio.io',
  plural: 'requestauthentications',
  abbr: 'ra',
  kind: 'RequestAuthentication',
  id: 'requestauthentication',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const PeerAuthenticationModel: K8sKind = {
  label: 'Peer Authentication',
  labelPlural: 'Peer Authentications',
  apiVersion: 'v1beta1',
  apiGroup: 'security.istio.io',
  plural: 'peerauthentications',
  abbr: 'pa',
  kind: 'PeerAuthentication',
  id: 'peerauthentication',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const AuthorizationPolicyModel: K8sKind = {
  label: 'Authorization Policy',
  labelPlural: 'Authorization Policies',
  apiVersion: 'v1beta1',
  apiGroup: 'security.istio.io',
  plural: 'authorizationpolicies',
  abbr: 'ap',
  namespaced: true,
  kind: 'AuthorizationPolicy',
  id: 'authorizationpolicy',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const DataVolumeModel: K8sKind = {
  label: 'Data Volume',
  labelPlural: 'Data Volumes',
  apiVersion: 'v1alpha1',
  apiGroup: 'cdi.kubevirt.io',
  plural: 'datavolumes',
  abbr: 'dv',
  kind: 'DataVolume',
  id: 'datavolume',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const NamespaceClaimModel: K8sKind = {
  label: 'NamespaceClaim',
  labelPlural: 'NamespaceClaims',
  apiVersion: 'v1alpha1',
  apiGroup: 'claim.tmax.io',
  plural: 'namespaceclaims',
  abbr: 'NSC',
  kind: 'NamespaceClaim',
  id: 'namespaceclaim',
  namespaced: false,
};

export const ResourceQuotaClaimModel: K8sKind = {
  label: 'ResourceQuotaClaim',
  labelPlural: 'ResourceQuotaClaims',
  apiVersion: 'v1alpha1',
  apiGroup: 'claim.tmax.io',
  plural: 'resourcequotaclaims',
  abbr: 'RQC',
  kind: 'ResourceQuotaClaim',
  id: 'resourcequotaclaim',
  namespaced: true,
};

export const RoleBindingClaimModel: K8sKind = {
  label: 'RoleBindingClaim',
  labelPlural: 'RoleBindingClaims',
  apiVersion: 'v1alpha1',
  apiGroup: 'claim.tmax.io',
  plural: 'rolebindingclaims',
  abbr: 'RBC',
  kind: 'RoleBindingClaim',
  id: 'rolebindingclaim',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    startsWith: startsWith.rolebindingclaimsStartsWith,
    isMultiOnly: false,
  },
};

export const ServiceBrokerModel: K8sKind = {
  label: 'Service Broker',
  labelPlural: 'Service Brokers',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'servicebrokers',
  abbr: 'SB',
  kind: 'ServiceBroker',
  id: 'servicebroker',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ServiceClassModel: K8sKind = {
  label: 'Service Class',
  labelPlural: 'Service Classes',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'serviceclasses',
  abbr: 'SC',
  kind: 'ServiceClass',
  id: 'serviceclass',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ServicePlanModel: K8sKind = {
  label: 'Service Plan',
  labelPlural: 'Service Plans',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'serviceplans',
  abbr: 'SP',
  kind: 'ServicePlan',
  id: 'serviceplan',
  namespaced: true,
  menuInfo: {
    visible: false,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ClusterServiceBrokerModel: K8sKind = {
  label: 'Cluster Service Broker',
  labelPlural: 'Cluster Service Brokers',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'clusterservicebrokers',
  abbr: 'CSB',
  kind: 'ClusterServiceBroker',
  id: 'clusterservicebroker',
  namespaced: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const ClusterServiceClassModel: K8sKind = {
  label: 'Cluster Service Class',
  labelPlural: 'Cluster Service Classes',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'clusterserviceclasses',
  abbr: 'CSC',
  kind: 'ClusterServiceClass',
  id: 'clusterserviceclass',
  namespaced: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const ClusterServicePlanModel: K8sKind = {
  label: 'Cluster Service Plan',
  labelPlural: 'Cluster Service Plans',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'clusterserviceplans',
  abbr: 'CSP',
  kind: 'ClusterServicePlan',
  id: 'clusterserviceplan',
  namespaced: false,
  menuInfo: {
    visible: false,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const ServiceInstanceModel: K8sKind = {
  label: 'Service Instance',
  labelPlural: 'Service Instances',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'serviceinstances',
  abbr: 'SI',
  kind: 'ServiceInstance',
  id: 'serviceinstance',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ServiceBindingModel: K8sKind = {
  label: 'Service Binding',
  labelPlural: 'Service Bindings',
  apiVersion: 'v1beta1',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'servicebindings',
  abbr: 'SB',
  kind: 'ServiceBinding',
  id: 'servicebinding',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ClusterTemplateClaimModel: K8sKind = {
  label: 'ClusterTemplateClaim',
  labelPlural: 'Cluster Template Claim',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'clustertemplateclaims',
  abbr: 'CTC',
  kind: 'ClusterTemplateClaim',
  id: 'clustertemplateclaim',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const TemplateModel: K8sKind = {
  label: 'Template',
  labelPlural: 'Templates',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'templates',
  abbr: 'T',
  kind: 'Template',
  id: 'template',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const TemplateInstanceModel: K8sKind = {
  label: 'Template Instance',
  labelPlural: 'Template Instances',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'templateinstances',
  abbr: 'TI',
  kind: 'TemplateInstance',
  id: 'templateinstance',
  namespaced: true,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ClusterTemplateModel: K8sKind = {
  label: 'Cluster Template',
  labelPlural: 'Cluster Templates',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'clustertemplates',
  abbr: 'CT',
  kind: 'ClusterTemplate',
  id: 'clustertemplate',
  namespaced: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceClusterLink,
    isMultiOnly: false,
  },
};

export const NotebookModel: K8sKind = {
  label: 'Notebook',
  labelPlural: 'Notebook Server',
  apiVersion: 'v1',
  apiGroup: 'kubeflow.tmax.io',
  plural: 'notebooks',
  abbr: 'NB',
  namespaced: true,
  kind: 'Notebook',
  id: 'notebook',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const ExperimentModel: K8sKind = {
  label: 'Experiment',
  labelPlural: 'Experiments',
  apiVersion: 'v1beta1',
  apiGroup: 'kubeflow.org',
  plural: 'experiments',
  abbr: 'EX',
  namespaced: true,
  kind: 'Experiment',
  id: 'experiment',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const TrainingJobModel: K8sKind = {
  label: 'Training Job',
  labelPlural: 'Training Jobs',
  apiVersion: 'v1',
  apiGroup: 'kubeflow.org',
  plural: 'trainingjobs',
  abbr: 'TJ',
  namespaced: true,
  kind: 'TrainingJob',
  id: 'trainingjob',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
    defaultLabel: 'COMMON:MSG_LNB_MENU_196',
    resource: 'trainingjobs',
  },
};

export const TFJobModel: K8sKind = {
  label: 'TFJob',
  labelPlural: 'TF Jobs',
  apiVersion: 'v1',
  apiGroup: 'kubeflow.org',
  plural: 'tfjobs',
  abbr: 'TFJ',
  namespaced: true,
  kind: 'TFJob',
  id: 'tfjob',
  crd: false,
};
export const PyTorchJobModel: K8sKind = {
  label: 'PyTorchJob',
  labelPlural: 'PyTorch Jobs',
  apiVersion: 'v1',
  apiGroup: 'kubeflow.org',
  plural: 'pytorchjobs',
  abbr: 'PTJ',
  namespaced: true,
  kind: 'PyTorchJob',
  id: 'pytorchjob',
  crd: false,
};

export const InferenceServiceModel: K8sKind = {
  label: 'Inference Service',
  labelPlural: 'Inference Services',
  apiVersion: 'v1beta1',
  apiGroup: 'serving.kubeflow.org',
  plural: 'inferenceservices',
  abbr: 'ISVC',
  namespaced: true,
  kind: 'InferenceService',
  id: 'inferenceservice',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const TrainedModelModel: K8sKind = {
  label: 'Trained Model',
  labelPlural: 'Trained Models',
  apiVersion: 'v1alpha1',
  apiGroup: 'serving.kubeflow.org',
  plural: 'trainedmodels',
  abbr: 'TM',
  namespaced: true,
  kind: 'TrainedModel',
  id: 'trainedmodel',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const WorkflowTemplateModel: K8sKind = {
  label: 'WorkflowTemplate',
  labelPlural: 'Workflow Templates',
  apiVersion: 'v1alpha1',
  apiGroup: 'argoproj.io',
  plural: 'workflowtemplates',
  abbr: 'WFT',
  namespaced: true,
  kind: 'WorkflowTemplate',
  id: 'workflowtemplate',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const WorkflowModel: K8sKind = {
  label: 'Workflow',
  labelPlural: 'Workflows',
  apiVersion: 'v1alpha1',
  apiGroup: 'argoproj.io',
  plural: 'workflows',
  abbr: 'WF',
  namespaced: true,
  kind: 'Workflow',
  id: 'workflow',
  crd: false,
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const TFApplyClaimModel: K8sKind = {
  kind: 'TFApplyClaim',
  label: 'Terraform Apply Claim',
  labelPlural: 'Terraform Apply Claims',
  apiGroup: 'claim.tmax.io',
  apiVersion: 'v1alpha1',
  abbr: 'TFC',
  namespaced: true,
  id: 'tfapplyclaim',
  plural: 'tfapplyclaims',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const HelmReleaseModel: K8sKind = {
  kind: 'HelmRelease',
  label: 'Helm Release',
  labelPlural: 'Helm Release',
  apiGroup: 'helm.fluxcd.io',
  apiVersion: 'v1',
  abbr: 'HR',
  namespaced: true,
  id: 'helmrelease',
  plural: 'helmreleases',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
};

export const AWXModel: K8sKind = {
  kind: 'AWX',
  label: 'AWX Instance',
  labelPlural: 'AWX Instances',
  apiGroup: 'awx.ansible.com',
  apiVersion: 'v1beta1',
  abbr: 'AWX',
  namespaced: true,
  id: 'awx',
  plural: 'awxs',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: true,
  },
};

export const ClusterRegistrationModel: K8sKind = {
  label: 'ClusterRegistration',
  labelPlural: 'Cluster Registrations',
  apiVersion: 'v1alpha1',
  apiGroup: 'cluster.tmax.io',
  plural: 'clusterregistrations',
  abbr: 'CLR',
  kind: 'ClusterRegistration',
  id: 'clusterregistration',
  namespaced: true,
};

export const ClusterMenuPolicyModel: K8sKind = {
  label: 'Cluster Menu Policy',
  labelPlural: 'Cluster Menu Policies',
  apiVersion: 'v1',
  apiGroup: 'ui.tmax.io',
  plural: 'clustermenupolicies',
  abbr: 'CMP',
  kind: 'ClusterMenuPolicy',
  id: 'clustermenupolicy',
  namespaced: false,
};

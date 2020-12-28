// export const pluralToKind = plural => {
//   const convertKind = {
//     secrets: 'Secret',
//     namespaces: 'Namespace',
//     servicebrokers: 'ServiceBroker',
//     serviceclasses: 'ServiceClass',
//     serviceplans: 'ServicePlan',
//     clusterservicebrokers: 'ClusterServiceBroker',
//     clusterserviceclasses: 'ClusterServiceClass',
//     clusterserviceplans: 'ClusterServicePlan',
//     serviceinstances: 'ServiceInstance',
//     servicebindings: 'ServiceBinding',
//     catalogserviceclaims: 'CatalogServiceClaim',
//     templates: 'Template',
//     templateinstances: 'TemplateInstance',
//     namespaceclaims: 'NamespaceClaim',
//     rolebindingclaims: 'RoleBindingClaim',
//     resourcequotaclaims: 'ResourceQuotaClaim',
//     deployments: 'Deployment',
//   };
//   return convertKind[plural];
// };

export const pluralToKind = new Map([
  ['deployments', { kind: 'Deployment', type: 'VanilaObject' }],
  ['namespaceclaims', { kind: 'NamespaceClaim', type: 'CustomResourceDefinition' }],
  ['secrets', { kind: 'NamespaceClaim', type: 'CustomResourceDefinition' }],
  ['namespaces', { kind: 'Secret', type: 'CustomResourceDefinition' }],
  ['servicebrokers', { kind: 'ServiceBroker', type: 'CustomResourceDefinition' }],
  ['serviceclasses', { kind: 'ServiceClass', type: 'CustomResourceDefinition' }],
  ['serviceplans', { kind: 'ServicePlan', type: 'CustomResourceDefinition' }],
  ['clusterservicebrokers', { kind: 'ClusterServiceBroker', type: 'CustomResourceDefinition' }],
  ['clusterserviceclasses', { kind: 'ClusterServiceClass', type: 'CustomResourceDefinition' }],
  ['clusterserviceplans', { kind: 'ClusterServicePlan', type: 'CustomResourceDefinition' }],
  ['serviceinstances', { kind: 'ServiceInstance', type: 'CustomResourceDefinition' }],
  ['servicebindings', { kind: 'ServiceBinding', type: 'CustomResourceDefinition' }],
  ['catalogserviceclaims', { kind: 'CatalogServiceClaim', type: 'CustomResourceDefinition' }],
  ['templates', { kind: 'Template', type: 'CustomResourceDefinition' }],
  ['templateinstances', { kind: 'TemplateInstance', type: 'CustomResourceDefinition' }],
  ['rolebindingclaims', { kind: 'RoleBindingClaim', type: 'CustomResourceDefinition' }],
  ['resourcequotaclaims', { kind: 'ResourceQuotaClaim', type: 'CustomResourceDefinition' }],
  ['tasks', { kind: 'Task', type: 'CustomResourceDefinition' }],
  ['taskruns', { kind: 'TaskRun', type: 'CustomResourceDefinition' }],
  ['pipelines', { kind: 'Pipeline', type: 'CustomResourceDefinition' }],
  ['pipelineruns', { kind: 'PipelineRun', type: 'CustomResourceDefinition' }],
  ['approvals', { kind: 'Approval', type: 'CustomResourceDefinition' }],
  ['pipelineresources', { kind: 'PipelineResource', type: 'CustomResourceDefinition' }],
  ['hyperclusterresources', { kind: 'HyperClusterResource', type: 'CustomResourceDefinition' }],
  ['federatedconfigmaps', { kind: 'FederatedConfigMap', type: 'CustomResourceDefinition' }],
  ['federateddeployments', { kind: 'FederatedDeployment', type: 'CustomResourceDefinition' }],
  ['federatedingresses', { kind: 'FederatedIngress', type: 'CustomResourceDefinition' }],
  ['federatedjobs', { kind: 'FederatedJob', type: 'CustomResourceDefinition' }],
  ['federatednamespaces', { kind: 'FederatedNamespace', type: 'CustomResourceDefinition' }],
  ['federatedreplicasets', { kind: 'FederatedReplicaSet', type: 'CustomResourceDefinition' }],
  ['federatedsecrets', { kind: 'FederatedSecret', type: 'CustomResourceDefinition' }],
  ['federatedpods', { kind: 'FederatedPod', type: 'CustomResourceDefinition' }],
  ['federatedhorizontalpodautoscalers', { kind: 'FederatedHorizontalPodAutoscaler', type: 'CustomResourceDefinition' }],
  ['federateddaemonsets', { kind: 'FederatedDaemonSet', type: 'CustomResourceDefinition' }],
  ['federatedstatefulsets', { kind: 'FederatedStatefulSet', type: 'CustomResourceDefinition' }],
  ['federatedcronjobs', { kind: 'FederatedCronJob', type: 'CustomResourceDefinition' }],
]);

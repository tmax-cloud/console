import * as models from '../../../../models';
import ClusterRoleJson from './management/ClusterRole.json';
import CustomResourceDefinitionJson from './management/CustomResourceDefinition.json';
import LimitRangeJson from './management/LimitRange.json';
import NamespaceJson from './management/Namespace.json';
import NodeJson from './management/Node.json';
import ResourceQuotaJson from './management/ResourceQuota.json';
import RoleJson from './management/Role.json';
import ServiceAccountJson from './management/ServiceAccount.json';
import IngressJson from './network/Ingress.json';
import NetworkPolicyJson from './network/NetworkPolicy.json';
import ServiceJson from './network/Service.json';
import PersistentVolumeJson from './storage/PersistentVolume.json';
import PersistentVolumeClaimJson from './storage/PersistentVolumeClaim.json';
import StorageClassJson from './storage/StorageClass.json';
import ConfigMapJson from './workload/ConfigMap.json';
import CronJobJson from './workload/CronJob.json';
import DaemonSetJson from './workload/DaemonSet.json';
import DeploymentJson from './workload/Deployment.json';
import HorizontalPodAutoscalerJson from './workload/HorizontalPodAutoscaler.json';
import JobJson from './workload/Job.json';
import PodJson from './workload/Pod.json';
import PodSecurityPolicyJson from './workload/PodSecurityPolicy.json';
import ReplicaSetJson from './workload/ReplicaSet.json';
import StatefulSetJson from './workload/StatefulSet.json';

export const resourceSchemaMap = new Map([
    [models.ClusterRoleModel.kind, ClusterRoleJson],
    [models.ClusterRoleBindingModel.kind, {}], // not form
    [models.CustomResourceDefinitionModel.kind, CustomResourceDefinitionJson],
    [models.LimitRangeModel.kind, LimitRangeJson],
    [models.NamespaceModel.kind, NamespaceJson],
    [models.NodeModel.kind, NodeJson],
    [models.ResourceQuotaModel.kind, ResourceQuotaJson],
    [models.RoleModel.kind, RoleJson],
    [models.RoleBindingModel.kind, {}], // not form
    [models.ServiceAccountModel.kind, ServiceAccountJson],
    [models.IngressModel.kind, IngressJson],
    [models.NetworkPolicyModel.kind, NetworkPolicyJson],
    [models.ServiceModel.kind, ServiceJson],
    [models.PersistentVolumeModel.kind, PersistentVolumeJson],
    [models.PersistentVolumeClaimModel.kind, PersistentVolumeClaimJson],
    [models.StorageClassModel.kind, StorageClassJson],
    [models.ConfigMapModel.kind, ConfigMapJson],
    [models.CronJobModel.kind, CronJobJson],
    [models.DaemonSetModel.kind, DaemonSetJson],
    [models.DeploymentModel.kind, DeploymentJson],
    [models.HorizontalPodAutoscalerModel.kind, HorizontalPodAutoscalerJson],
    [models.JobModel.kind, JobJson],
    [models.PodModel.kind, PodJson],
    [models.PodSecurityPolicyModel.kind, PodSecurityPolicyJson],
    [models.ReplicaSetModel.kind, ReplicaSetJson],
    [models.SecretModel.kind, {}], // not form
    [models.StatefulSetModel.kind, StatefulSetJson],
]);

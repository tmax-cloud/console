import { NetworkPolicySidebar } from './network-policy-sidebar';
import { RoleSidebar } from './role-sidebar';
import { BuildConfigSidebar } from './build-config-sidebar';
import { VirtualMachineSidebar } from './virtual-machine-sidebars';
import { PodSidebar } from './pod-sidebar';
import { JobSidebar } from './job-sidebar';
import { ReplicaSetSidebar } from './replica-set-sidebar';
import { DaemonSetSidebar } from './daemon-set-sidebar';
import { StatefulSetSidebar } from './stateful-set-sidebar';
import { DeploymentSidebar } from './deployment-sidebar';
import { HPASidebar } from './hpa-sidebar';
import { ConfigMapSidebar } from './config-map-sidebar';
import { SecretSidebar } from './secret-sidebar';
import { CronJobSidebar } from './cron-job-sidebar';

// sidebar 추가 시 여기에 컴포넌트 연결해줘야함
// .set(kind, 사이드바 컴포넌트명)
export const resourceSidebars = new Map<string, React.ComponentType<any>>()
  .set('Pod', PodSidebar)
  .set('Deployment', DeploymentSidebar)
  .set('ReplicaSet', ReplicaSetSidebar)
  .set('HorizontalPodAutoscaler', HPASidebar)
  .set('DaemonSet', DaemonSetSidebar)
  .set('StatefulSet', StatefulSetSidebar)
  .set('VirtualMachine', VirtualMachineSidebar)
  .set('ConfigMap', ConfigMapSidebar)
  .set('Secret', SecretSidebar)
  .set('Job', JobSidebar)
  .set('CronJob', CronJobSidebar)
  .set('NetworkPolicy', NetworkPolicySidebar)
  .set('Role', RoleSidebar)
  .set('ClusterRole', RoleSidebar)
  .set('BuildConfig', BuildConfigSidebar);

import { NetworkPolicySidebar } from './network-policy-sidebar';
import { RoleSidebar } from './role-sidebar';
import { BuildConfigSidebar } from './build-config-sidebar';
import { VirtualMachineSidebar } from './virtual-machine-sidebars';
// import { FederatedResourceSidebar } from './federated-resource-sidebar';

// export const resourceSidebars = new Map<string, React.ComponentType<any>>().set('NetworkPolicy', NetworkPolicySidebar).set('FederatedNamespace', FederatedResourceSidebar).set('FederatedDeployment', FederatedResourceSidebar).set('Role', RoleSidebar).set('ClusterRole', RoleSidebar).set('VirtualMachine', VirtualMachineSidebar).set('BuildConfig', BuildConfigSidebar);

export const resourceSidebars = new Map<string, React.ComponentType<any>>().set('NetworkPolicy', NetworkPolicySidebar).set('Role', RoleSidebar).set('ClusterRole', RoleSidebar).set('VirtualMachine', VirtualMachineSidebar).set('BuildConfig', BuildConfigSidebar);

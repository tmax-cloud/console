import { K8sKind } from '@console/internal/module/k8s';

export const NodeMaintenanceModel: K8sKind = {
  label: 'Node Maintenance',
  labelPlural: 'Node Maintenances',
  apiVersion: 'v1beta1',
  apiGroup: 'nodemaintenance.kubevirt.io',
  plural: 'nodemaintenances',
  abbr: 'NM',
  namespaced: false,
  kind: 'NodeMaintenance',
  id: 'nodemaintenance',
  crd: true,
};

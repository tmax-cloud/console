import * as _ from 'lodash-es';
import * as fuzzy from 'fuzzysearch';
import { nodeStatus } from '@console/app/src/status/node';
import { getNodeRole, getLabelsAsString } from '@console/shared';
import { routeStatus } from '../routes';
import { secretTypeFilterReducer } from '../secret';
import { bindingType, roleType } from '../RBAC';
import {
  K8sResourceKind,
  MachineKind,
  podPhaseFilterReducer,
  serviceCatalogStatus,
  serviceClassDisplayName,
  servicePlanDisplayName,
  getClusterOperatorStatus,
  // getTemplateInstanceStatus,
} from '../../module/k8s';

import { alertingRuleIsActive, alertDescription, alertState, silenceState } from '../../reducers/monitoring';
import { pipelineRunFilterReducer } from '@console/dev-console/src/utils/pipeline-filter-reducer';

export const fuzzyCaseInsensitive = (a: string, b: string): boolean => fuzzy(_.toLower(a), _.toLower(b));

const registryStatusReducer = (registry: any): string => {
  return registry.status.phase;
};

const serviceBrokerStatusReducer = (serviceBroker: any): string => {
  let phase = '';
  if (serviceBroker.status) {
    serviceBroker.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Running';
        } else {
          phase = 'Error';
        }
      }
    });
    return phase;
  }
};

const serviceInstanceStatusReducer = (serviceInstance: any): string => {
  return serviceInstance.status.lastConditionState;
};

const ClusterServiceBrokerPhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Running';
        } else {
          phase = 'Error';
        }
      }
    });
    return phase;
  }
};

const pipelineApprovalStatusReducer = (pipelineApproval: any): string => {
  return pipelineApproval.status.result;
};

export const awxStatusReducer = (awx: any): string => {
  const conditions = _.get(awx, ['status', 'conditions'], []);
  if (conditions.length === 0) return '-';
  return conditions[0].reason === 'Successful' ? 'Succeeded' : conditions[0].reason === 'Running' ? 'Deploying' : conditions[0].reason;
};

// TODO: Table filters are undocumented, stringly-typed, and non-obvious. We can change that.
export const tableFilters: TableFilterMap = {
  name: (filter, obj) => fuzzyCaseInsensitive(filter, obj.metadata.name),

  externalName: (filter, obj) => fuzzyCaseInsensitive(filter, obj.spec?.externalName),

  'catalog-source-name': (filter, obj) => fuzzyCaseInsensitive(filter, obj.name),

  'namespace-claim-status': (results, nameSpaceClaim) => {
    if (!results || !results.selected || !results.selected.size) {
      return true;
    }
    const result = nameSpaceClaim?.status?.status;
    return results.selected.has(result) || !_.includes(results.all, result);
  },
  'resource-quota-claim-status': (results, resourceQuotaClaim) => {
    if (!results || !results.selected || !results.selected.size) {
      return true;
    }
    const result = resourceQuotaClaim?.status?.status;
    return results.selected.has(result) || !_.includes(results.all, result);
  },
  'cluster-template-claim-status': (results, clusterTemplateClaim) => {
    if (!results || !results.selected || !results.selected.size) {
      return true;
    }
    let result = clusterTemplateClaim?.status?.status;
    result = result === 'Approve' ? 'Approved' : result;
    result = result === 'Reject' ? 'Rejected' : result;
    return results.selected.has(result);
  },
  'alert-list-text': (filter, alert) => {
    if (fuzzyCaseInsensitive(filter, alert.labels?.alertname)) {
      return true;
    }

    // Search in alert description. Ignore case and whitespace, but don't use fuzzy since the
    // description can be long and will often match fuzzy searches that are not really relevant.
    const needle = _.toLower(filter.replace(/\s/g, ''));
    const haystack = _.toLower(alertDescription(alert).replace(/\s/g, ''));
    return haystack.includes(needle);
  },

  'alert-state': (filter, alert) => filter.selected.has(alertState(alert)),

  'alerting-rule-active': (filter, rule) => filter.selected.has(alertingRuleIsActive(rule)),

  'alerting-rule-name': (filter, rule) => fuzzyCaseInsensitive(filter, rule.name),

  'silence-name': (filter, silence) => fuzzyCaseInsensitive(filter, silence.name),

  'silence-state': (filter, silence) => filter.selected.has(silenceState(silence)),

  'trainingjob-kind': (filter, tj) => filter.selected.has(tj.kind === 'PyTorchJob' ? 'pytorchjob' : 'tfjob') || filter.selected.size === 0,

  // Filter role by role kind
  'role-kind': (filter, role) => filter.selected.has(roleType(role)) || filter.selected.size === 0,

  // Filter role bindings by role kind
  'role-binding-kind': (filter, binding) => filter.selected.has(bindingType(binding)) || filter.selected.size === 0,

  // Filter role bindings by text match
  'role-binding': (str, { metadata, roleRef, subject }) => {
    const isMatch = val => fuzzyCaseInsensitive(str, val);
    return [metadata.name, roleRef.name, subject.kind, subject.name].some(isMatch);
  },

  // Filter role bindings by roleRef name
  'role-binding-roleRef-name': (name: string, binding) => binding.roleRef.name === name,

  // Filter role bindings by roleRef kind
  'role-binding-roleRef-kind': (kind: string, binding) => binding.roleRef.kind === kind,

  // Filter role bindings by user name
  'role-binding-user': (userName, binding) =>
    _.some(binding.subjects, {
      kind: 'User',
      apiGroup: 'rbac.authorization.k8s.io',
      name: userName,
    }),

  // Filter role bindings by group name
  'role-binding-group': (groupName, binding) =>
    _.some(binding.subjects, {
      kind: 'Group',
      apiGroup: 'rbac.authorization.k8s.io',
      name: groupName,
    }),

  // Filter Integration Config by Status
  'integrationConfig-status': (filter, binding) => {
    let phase = '';
    if (binding.status) {
      binding.status.conditions.forEach(cur => {
        if (cur.type === 'ready') {
          if (cur.status === 'True') {
            phase = 'Ready';
          } else {
            phase = 'UnReady';
          }
        }
      });
      return filter.selected.has(phase) || filter.selected.size === 0;
    }
  },
  // Filter Role Binding Claim by Status
  'roleBindingClaim-status': (filter, binding) => {
    return filter.selected.has(binding.status.status) || filter.selected.size === 0;
  },

  // Filter Helm Release by Phase
  'helmReleases-status': (filter, binding) => {
    return filter.selected.has(binding.status?.phase) || filter.selected.size === 0;
  },

  selector: (selector, obj) => {
    if (!selector || !selector.values || !selector.values.size) {
      return true;
    }
    return selector.values.has(_.get(obj, selector.field));
  },

  labels: (values, obj) => {
    const labels = getLabelsAsString(obj);
    if (!values.all) {
      return true;
    }
    return !!values.all.every(v => labels.includes(v));
  },

  'pvc-status': (phases, pvc) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phaseFunc = pvc => {
      if (pvc?.metadata?.deletionTimestamp) {
        return 'Terminating';
      }
      return pvc.status.phase;
    };
    const phase = phaseFunc(pvc);
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },

  'pod-status': (phases, pod) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phase = podPhaseFilterReducer(pod);
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },

  'registry-status': (phases, registry) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phase = registryStatusReducer(registry);
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },

  'service-broker-status': (phases, serviceBroker) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phase = serviceBrokerStatusReducer(serviceBroker);
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },

  'service-instance-status': (phases, serviceInstance) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phase = serviceInstanceStatusReducer(serviceInstance);
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },
  'cluster-service-broker-status': (phases, clusterServiceBroker) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phase = ClusterServiceBrokerPhase(clusterServiceBroker);
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },

  'pipeline-run-status': (results, pipelineRun) => {
    if (!results || !results.selected || !results.selected.size) {
      return true;
    }

    const result = pipelineRunFilterReducer(pipelineRun);
    return results.selected.has(result) || !_.includes(results.all, result);
  },

  'pipeline-approval-status': (results, pipelineApproval) => {
    if (!results || !results.selected || !results.selected.size) {
      return true;
    }

    const result = pipelineApprovalStatusReducer(pipelineApproval);
    return results.selected.has(result) || !_.includes(results.all, result);
  },

  'node-status': (statuses, node) => {
    if (!statuses || !statuses.selected || !statuses.selected.size) {
      return true;
    }

    const status = nodeStatus(node);
    return statuses.selected.has(status) || !_.includes(statuses.all, status);
  },

  'node-role': (roles, node) => {
    if (!roles || !roles.selected || !roles.selected.size) {
      return true;
    }
    const role = getNodeRole(node);
    return roles.selected.has(role);
  },

  'clusterserviceversion-resource-kind': (filters, resource) => {
    if (!filters || !filters.selected || !filters.selected.size) {
      return true;
    }
    return filters.selected.has(resource.kind);
  },

  'packagemanifest-name': (filter, pkg) => fuzzyCaseInsensitive(filter, (pkg.status.defaultChannel ? pkg.status.channels.find(ch => ch.name === pkg.status.defaultChannel) : pkg.status.channels[0]).currentCSVDesc.displayName),

  'build-status': (phases, build) => {
    if (!phases || !phases.selected || !phases.selected.size) {
      return true;
    }

    const phase = build.status.phase;
    return phases.selected.has(phase) || !_.includes(phases.all, phase);
  },

  'build-strategy': (strategies, buildConfig) => {
    if (!strategies || !strategies.selected || !strategies.selected.size) {
      return true;
    }

    const strategy = buildConfig.spec.strategy.type;
    return strategies.selected.has(strategy) || !_.includes(strategies.all, strategy);
  },

  'route-status': (statuses, route) => {
    if (!statuses || !statuses.selected || !statuses.selected.size) {
      return true;
    }

    const status = routeStatus(route);
    return statuses.selected.has(status) || !_.includes(statuses.all, status);
  },

  'catalog-status': (statuses, catalog) => {
    if (!statuses || !statuses.selected || !statuses.selected.size) {
      return true;
    }

    const status = serviceCatalogStatus(catalog);
    return statuses.selected.has(status) || !_.includes(statuses.all, status);
  },

  'secret-type': (types, secret) => {
    if (!types || !types.selected || !types.selected.size) {
      return true;
    }
    const type = secretTypeFilterReducer(secret);
    return types.selected.has(type) || !_.includes(types.all, type);
  },

  'project-name': (str: string, project: K8sResourceKind) => {
    const displayName = _.get(project, ['metadata', 'annotations', 'openshift.io/display-name']);
    return fuzzyCaseInsensitive(str, project.metadata.name) || fuzzyCaseInsensitive(str, displayName);
  },

  // Filter service classes by text match
  'service-class': (str, serviceClass) => {
    const displayName = serviceClassDisplayName(serviceClass);
    return fuzzyCaseInsensitive(str, displayName);
  },

  'service-plan': (str, servicePlan) => {
    const displayName = servicePlanDisplayName(servicePlan);
    return fuzzyCaseInsensitive(str, displayName);
  },

  'cluster-operator-status': (statuses, operator) => {
    if (!statuses || !statuses.selected || !statuses.selected.size) {
      return true;
    }

    const status = getClusterOperatorStatus(operator);
    return statuses.selected.has(status) || !_.includes(statuses.all, status);
  },

  'template-instance-status': (statuses, instance) => {
    if (!statuses || !statuses.selected || !statuses.selected.size) {
      return true;
    }

    // const status = getTemplateInstanceStatus(instance);

    // NOTE: HyperCloud5.0 TemplateInstance phase filter
    const templateInstancePhase = instance => {
      let phase = '';
      if (instance.status) {
        instance.status.conditions.forEach(cur => {
          if (cur.type === '') {
            phase = cur.status;
          }
        });
        return phase;
      }
    };
    const status = templateInstancePhase(instance);

    return statuses.selected.has(status) || !_.includes(statuses.all, status);
  },

  'awx-status': (statuses, awx) => {
    if (!statuses || !statuses.selected || !statuses.selected.size) {
      return true;
    }

    const status = awxStatusReducer(awx);
    return statuses.selected.has(status) || !_.includes(statuses.all, status);
  },

  machine: (str: string, machine: MachineKind): boolean => {
    const node: string = _.get(machine, 'status.nodeRef.name');
    return fuzzyCaseInsensitive(str, machine.metadata.name) || (node && fuzzyCaseInsensitive(str, node));
  },
};

export interface TableFilterGroups {
  selected: Set<string>;
  all: string[];
  values: Set<string>;
  field: string;
}

export type TableFilter = (groups: TableFilterGroups, obj: any) => boolean;
export type TextFilter = (text: string, obj: any) => boolean;

type TableFilterMap = {
  [key: string]: TableFilter | TextFilter;
};

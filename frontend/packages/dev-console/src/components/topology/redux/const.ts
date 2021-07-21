export const TOPOLOGY_DISPLAY_FILTERS_LOCAL_STORAGE_KEY = `bridge/topology-display-filters`;
export const DEFAULT_TOPOLOGY_FILTERS = {
  display: {
    podCount: false,
    eventSources: false,
    virtualMachines: false,
    showLabels: true,
    knativeServices: true,
    appGrouping: true,
    workloadGrouping: true,
    operatorGrouping: false,
    helmGrouping: false,
  },
};

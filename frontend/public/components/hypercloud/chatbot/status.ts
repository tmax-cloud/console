import { NODE_STATUS, NODE_STATUS_QUERY_PARAM } from '@console/app/src/components/nodes/NodesPage';
import { PERSISTENTVOLUMECLAIM_STATUS, PERSISTENTVOLUMECLAIM_STATUS_QUERY_PARAM } from '@console/internal/components/persistent-volume-claim';
import { POD_STATUS, POD_STATUS_QUERY_PARAM } from '@console/internal/components/pod';

interface StatusQuery {
  queryParam: string;
}

interface StatusDetails {
  [key: string]: string[];
}

export type ResourceStatus = StatusQuery | StatusDetails;

const nodeStatus: ResourceStatus = {
  queryParam: NODE_STATUS_QUERY_PARAM,
  ready: [NODE_STATUS.READY],
  notready: [NODE_STATUS.NOTREADY],
};

const persistentVolumeClaimStatus: ResourceStatus = {
  queryParam: PERSISTENTVOLUMECLAIM_STATUS_QUERY_PARAM,
  bound: [PERSISTENTVOLUMECLAIM_STATUS.BOUND],
  notbound: [PERSISTENTVOLUMECLAIM_STATUS.LOST, PERSISTENTVOLUMECLAIM_STATUS.PENDING, PERSISTENTVOLUMECLAIM_STATUS.TERMINATING],
};

const podStatus: ResourceStatus = {
  queryParam: POD_STATUS_QUERY_PARAM,
  normal: [POD_STATUS.SUCCEEDED, POD_STATUS.RUNNING],
  abnormal: [POD_STATUS.CRASHLOOPBACKOFF, POD_STATUS.FAILED, POD_STATUS.PENDING, POD_STATUS.TERMINATING, POD_STATUS.UNKNOWN],
};

export const getResourceStatus = (plural: string) => {
  switch (plural) {
    case 'nodes':
      return nodeStatus;
    case 'persistentvolumeclaims':
      return persistentVolumeClaimStatus;
    case 'pods':
      return podStatus;
    default:
      return null;
  }
};

import * as _ from 'lodash';
import { K8sResourceKind } from '@console/internal/module/k8s';
import { TopologyDataResources, TopologyOverviewItem, TopologyDataObject, Group } from '../../hypercloud/hypercloud-topology-types';
import { PodModel, PersistentVolumeClaimModel, ServiceModel, ReplicaSetModel, StatefulSetModel, DaemonSetModel, DeploymentModel } from '@console/internal/models';
import { TYPE_WORKLOAD, TYPE_DEPLOYMENT_GROUP, TYPE_DAEMONSET_GROUP, TYPE_STATEFULSET_GROUP, TYPE_REPLICASET_GROUP, TYPE_SERVICE, TYPE_POD, TYPE_APPLICATION_GROUP, TYPE_PVC } from '../../components/const';

export const createTopologyPodNodeData = (item: TopologyOverviewItem, type: string, defaultIcon: string, operatorBackedService: boolean = false): TopologyDataObject => {
  const { obj: pod } = item;
  const uid = _.get(pod, 'metadata.uid');
  const labels = _.get(pod, 'metadata.labels', {});

  return {
    id: uid,
    name: _.get(pod, 'metadata.name') || labels['app.kubernetes.io/instance'],
    type,
    resources: { ...item, isOperatorBackedService: operatorBackedService },
    pods: item.pods,
    operatorBackedService,
    data: {
      url: '',
      kind: PodModel.kind,
      editURL: '',
      vcsURI: '',
      image: defaultIcon,
      obj: pod,
      status: item.status,
    },
  };
};

export const createTopologyPVCNodeData = (item: TopologyOverviewItem, type: string, defaultIcon: string, operatorBackedService: boolean = false): TopologyDataObject => {
  const { obj: pvc } = item;
  const uid = _.get(pvc, 'metadata.uid');
  const labels = _.get(pvc, 'metadata.labels', {});

  return {
    id: uid,
    name: _.get(pvc, 'metadata.name') || labels['app.kubernetes.io/instance'],
    type,
    resources: { ...item, isOperatorBackedService: operatorBackedService },
    pods: item.pods,
    operatorBackedService,
    data: {
      url: '',
      kind: PersistentVolumeClaimModel.kind,
      editURL: '',
      vcsURI: '',
      image: defaultIcon,
      obj: pvc,
      status: item.status,
    },
  };
};

export const getChildrenResources = (obj: K8sResourceKind, resources: TopologyDataResources) => {
  const parentUid = _.get(obj, 'metadata.uid');

  const filterChildrenByParentId = item => {
    const owners = _.get(item, ['metadata', 'ownerReferences']);
    if (!!owners?.[0] && owners[0].uid === parentUid) {
      return true;
    }
    return false;
  };

  switch (obj.kind) {
    case DeploymentModel.kind: {
      const volumes = _.get(obj, ['spec', 'template', 'spec', 'volumes']);
      const pvcNames =
        volumes?.map(volume => {
          if (volume.persistentVolumeClaim) {
            return volume.persistentVolumeClaim.claimName;
          }
          return [];
        }) || [];

      const childPVCs = pvcNames ? resources.persistentVolumeClaims.data?.filter(pvc => pvcNames.includes(pvc.metadata.name)) || [] : [];
      const childPods = resources.pods.data.filter(filterChildrenByParentId);
      const childReplicaSets = resources.replicaSets.data?.filter(filterChildrenByParentId);
      const childrenIdArray = [...childPVCs, ...childPods, ...childReplicaSets]?.map(item => item?.metadata?.uid);
      return childrenIdArray;
    }
    default: {
      const childPods = resources.pods.data.filter(filterChildrenByParentId);
      const childrenIdArray = childPods.map(item => item.metadata?.uid);
      return childrenIdArray;
    }
  }
};
/* eslint consistent-return: off */
export const getComponentType = kind => {
  switch (kind) {
    case DeploymentModel.kind:
      return TYPE_DEPLOYMENT_GROUP;
    case StatefulSetModel.kind:
      return TYPE_STATEFULSET_GROUP;
    case DaemonSetModel.kind:
      return TYPE_DAEMONSET_GROUP;
    case ReplicaSetModel.kind:
      return TYPE_REPLICASET_GROUP;
    case PodModel.kind:
      return TYPE_POD;
    case ServiceModel.kind:
      return TYPE_SERVICE;
    case PersistentVolumeClaimModel.kind:
      return TYPE_PVC;
    default:
      return TYPE_WORKLOAD;
  }
};

export const getTopologyGroupItems = (obj: K8sResourceKind): Group => {
  const groupName = _.get(obj, ['metadata', 'labels', 'app.kubernetes.io/part-of']);
  if (!groupName) {
    return null;
  }
  // MEMO : Application그룹 하위에 들어갈 애들은 딱 그 depth의 리소스만 들어가야 토폴로지 정상적으로 나옴.
  // 예: application으로 감싸진 deployment안에 pod들 있을 때 Application의 nodes로 들어갈 id는 deployment id만이여야 한다.

  switch (obj.kind) {
    case ServiceModel.kind:
    case DaemonSetModel.kind:
    case StatefulSetModel.kind:
    case PersistentVolumeClaimModel.kind:
    case DeploymentModel.kind: {
      return {
        id: `group:${groupName}`,
        type: TYPE_APPLICATION_GROUP,
        name: groupName,
        nodes: [_.get(obj, ['metadata', 'uid'])],
      };
    }
    case PodModel.kind:
      {
        const ownerRef = _.get(obj, ['metadata', 'ownerReferences']);
        if (!!ownerRef && ownerRef.length > 0 && ownerRef[0].kind !== 'Node') {
          return null;
        }
      }
      break;
    default:
      return null;
  }
};

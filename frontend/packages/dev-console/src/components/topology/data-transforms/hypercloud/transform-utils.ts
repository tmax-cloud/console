import * as _ from 'lodash-es';
import { K8sResourceKind } from '@console/internal/module/k8s';
import { TopologyDataResources } from '../../hypercloud/hypercloud-topology-types';
import { PodModel, PersistentVolumeClaimModel, ServiceModel, ReplicaSetModel, StatefulSetModel, DaemonSetModel, DeploymentModel } from '@console/internal/models';
import { TYPE_WORKLOAD, TYPE_DEPLOYMENT_GROUP, TYPE_DAEMONSET_GROUP, TYPE_STATEFULSET_GROUP, TYPE_REPLICASET_GROUP, TYPE_SERVICE } from '../../components/const';

export const getChildrenResources = (obj: K8sResourceKind, resources: TopologyDataResources) => {
  const parentUid = _.get(obj, 'metadata.uid');

  const filterChildrenByParentId = item => {
    const owners = _.get(item, ['metadata', 'ownerReferences']);
    if (!!owners?.[0] && owners[0].uid === parentUid) {
      return true;
    } else {
      return false;
    }
  };

  switch (obj.kind) {
    case DeploymentModel.kind: {
      const volumes = _.get(obj, ['spec', 'template', 'spec', 'volumes']);
      const pvcNames =
        volumes?.map(volume => {
          if (!!volume.persistentVolumeClaim) {
            return volume.persistentVolumeClaim.claimName;
          }
        }) || [];
        
      const childPVCs = !!pvcNames ? resources['persistentVolumeClaims'].data?.filter(pvc => pvcNames.includes(pvc.metadata.name)) || [] : [];
      const childPods = resources['pods'].data.filter(filterChildrenByParentId);
      const childReplicaSets = resources['replicaSets'].data?.filter(filterChildrenByParentId);
      const childrenIdArray = [...childPVCs, ...childPods, ...childReplicaSets]?.map(item => item?.metadata?.uid);
      return childrenIdArray;
    }
    default: {
      const childPods = resources['pods'].data.filter(filterChildrenByParentId);
      const childrenIdArray = childPods.map(item => item.metadata?.uid);
      return childrenIdArray;
    }
  }
};

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
      return TYPE_WORKLOAD;
    case ServiceModel.kind:
      return TYPE_SERVICE;
    case PersistentVolumeClaimModel.kind:
      return TYPE_WORKLOAD;
    default:
      return TYPE_WORKLOAD;
  }
};

import * as _ from 'lodash-es';
import { K8sResourceKind } from '@console/internal/module/k8s';
import { DeploymentModel } from '@console/internal/models';
import { TopologyDataResources } from '../../hypercloud/hypercloud-topology-types';

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
      let childPVCs = [];
      if (!!pvcNames) {
        childPVCs = resources['persistentVolumeClaims'].data?.filter(pvc => pvcNames.includes(pvc.metadata.name));
      }
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

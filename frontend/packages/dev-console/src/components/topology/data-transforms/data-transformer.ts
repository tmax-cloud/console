import * as _ from 'lodash';
import { K8sResourceKind, isGroupVersionKind, kindForReference, apiVersionForReference } from '@console/internal/module/k8s';
import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
// import { getKnativeTopologyDataModel } from '@console/knative-plugin/src/topology/data-transformer';
// import { getKubevirtTopologyDataModel, kubevirtAllowedResources } from '@console/kubevirt-plugin/src/topology/kubevirt-data-transformer';
import { TrafficData, KialiNode } from '../topology-types';
import { TopologyDataModel, TopologyDataResources, Edge } from '../hypercloud/hypercloud-topology-types';
import { TYPE_TRAFFIC_CONNECTOR, TYPE_WORKLOAD, TYPE_CONNECTS_TO } from '../components/const';
import { allowedResources } from '../topology-utils';
import { addToTopologyDataModel, createInstanceForResource, createTopologyNodeData, getTopologyNodeItem, mergeGroup } from './transform-utils';
import { getChildrenResources, getComponentType, createTopologyPodNodeData, createTopologyPVCNodeData, getTopologyGroupItems } from './hypercloud/transform-utils';
import { HelmReleaseResourcesMap } from '../../helm/helm-types';
// import { getOperatorTopologyDataModel } from '../operators/operators-data-transformer';
// import { getHelmTopologyDataModel } from '../helm/helm-data-transformer';

export const getFilteredTrafficWorkload = (nodes: KialiNode[]): KialiNode[] => nodes.filter(({ data }) => data.nodeType === TYPE_WORKLOAD);

export const getTrafficConnectors = (trafficData: TrafficData, resources: K8sResourceKind[]): Edge[] => {
  const filteredWorkload = getFilteredTrafficWorkload(trafficData.nodes);
  return trafficData.edges.reduce((acc, { data }) => {
    const { data: sourceTrafficNode } = filteredWorkload.find(wrkld => wrkld.data.id === data.source);
    const { data: targetTrafficNode } = filteredWorkload.find(wrkld => wrkld.data.id === data.target);
    const sourceResourceNode = resources.find(res => {
      return res.metadata.name === sourceTrafficNode[sourceTrafficNode.nodeType];
    });
    const targetResourceNode = resources.find(res => res.metadata.name === targetTrafficNode[targetTrafficNode.nodeType]);
    return sourceResourceNode && targetResourceNode
      ? [
          ...acc,
          {
            id: `${sourceResourceNode.metadata.uid}_${targetResourceNode.metadata.uid}`,
            type: TYPE_TRAFFIC_CONNECTOR,
            source: sourceResourceNode.metadata.uid,
            target: targetResourceNode.metadata.uid,
            data: data.traffic,
          },
        ]
      : acc;
  }, []);
};

const deploymentToService = (childServices, typedDataModel, item) => {
  childServices.forEach(serviceItem => {
    const { obj: deployment } = item;
    const { obj: service } = serviceItem;
    const serviceUid = _.get(service, ['metadata', 'uid']);
    typedDataModel.topology[serviceUid] = createTopologyNodeData(serviceItem, getComponentType(service.kind), getImageForIconClass(`icon-hc-service`));
    typedDataModel.graph.nodes.push(getTopologyNodeItem(service, getComponentType(service.kind)));
    typedDataModel.graph.edges.push({ id: `${serviceUid}_${deployment.metadata.name}`, type: TYPE_CONNECTS_TO, source: serviceUid, target: deployment.metadata.uid });
    mergeGroup(getTopologyGroupItems(service), typedDataModel.graph.groups);
  });
};

const getBaseTopologyDataModel = (resources: TopologyDataResources, allResources: K8sResourceKind[], utils: Function[], transformBy: string[]): TopologyDataModel => {
  const baseDataModel: TopologyDataModel = {
    graph: { nodes: [], edges: [], groups: [] },
    topology: {},
  };
  const transformResourceData = createInstanceForResource(resources, utils);

  _.forEach(transformBy, key => {
    if (!_.isEmpty(resources[key].data)) {
      const typedDataModel: TopologyDataModel = {
        graph: { nodes: [], edges: [], groups: [] },
        topology: {},
      };

      transformResourceData[key](resources[key].data).forEach(item => {
        const { obj } = item;
        const uid = _.get(obj, ['metadata', 'uid']);

        switch (key) {
          case 'deployments': {
            typedDataModel.topology[uid] = createTopologyNodeData(item, getComponentType(obj.kind), getImageForIconClass(`icon-hc-pod`));
            const children = getChildrenResources(obj, resources);
            typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, getComponentType(obj.kind), children));
            if (item.services) {
              const childServices = transformResourceData.services(item.services);
              deploymentToService(childServices, typedDataModel, item);
            }
            break;
          }
          case 'replicaSets':
          case 'daemonSets':
          case 'statefulSets': {
            typedDataModel.topology[uid] = createTopologyNodeData(item, getComponentType(obj.kind), getImageForIconClass(`icon-hc-pod`));

            // MEMO : children이 없을 땐 workload 타입의 단일노드로 표시해주게 처리함.
            const children = item.pods?.map(p => p.metadata?.uid) || [];
            if (children.length === 0) {
              typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, TYPE_WORKLOAD));
            } else {
              typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, getComponentType(obj.kind), children));
            }
            break;
          }
          case 'pods': {
            typedDataModel.topology[uid] = createTopologyPodNodeData(item, getComponentType(obj.kind), getImageForIconClass(`icon-hc-pod`));
            typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, getComponentType(obj.kind)));
            break;
          }
          case 'persistentVolumeClaims': {
            typedDataModel.topology[uid] = createTopologyPVCNodeData(item, getComponentType(obj.kind), getImageForIconClass(`icon-hc-pvc`));
            typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, getComponentType(obj.kind)));
            break;
          }
          case 'ingresses': {
            typedDataModel.topology[uid] = createTopologyNodeData(item, getComponentType(obj.kind), getImageForIconClass(`icon-hc-ingress`));
            typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, getComponentType(obj.kind)));

            const linkedServiceList = obj.spec.rules.flatMap(rule => rule.http.paths.map(path => path.backend.service.name));
            const svcUIDList = [...new Set(resources.services.data.filter(service => linkedServiceList.findIndex(cur => cur === service.metadata.name) >= 0).map(service => service.metadata.uid))];

            svcUIDList.forEach(svcUID => {
              typedDataModel.graph.edges.push({ id: `${obj.metadata.uid}_${obj.metadata.name}`, type: TYPE_CONNECTS_TO, source: obj.metadata.uid, target: svcUID });
            });
            break;
          }
          default: {
            typedDataModel.topology[uid] = createTopologyNodeData(item, getComponentType(obj.kind), getImageForIconClass(`icon-hc-pod`));
            typedDataModel.graph.nodes.push(getTopologyNodeItem(obj, getComponentType(obj.kind)));
          }
        }
        mergeGroup(getTopologyGroupItems(obj), typedDataModel.graph.groups);
      });
      addToTopologyDataModel(typedDataModel, baseDataModel);
    }
  });
  return baseDataModel;
};

/**
 * Tranforms the k8s resources objects into topology data
 */
export const transformTopologyData = (resources: TopologyDataResources, transformBy: string[], utils?: Function[], trafficData?: TrafficData, helmResourcesMap?: HelmReleaseResourcesMap): TopologyDataModel => {
  const topologyGraphAndNodeData: TopologyDataModel = {
    graph: { nodes: [], edges: [], groups: [] },
    topology: {},
  };
  const allResourceTypes = [...allowedResources];
  const allResourcesList = _.flatten(
    allResourceTypes.map(resourceKind => {
      return resources[resourceKind]
        ? resources[resourceKind].data.map(res => {
            const resKind = resources[resourceKind].kind;
            let kind = resKind;
            let apiVersion;
            if (resKind && isGroupVersionKind(resKind)) {
              kind = kindForReference(resKind);
              apiVersion = apiVersionForReference(resKind);
            }
            return {
              kind,
              apiVersion,
              ...res,
            };
          })
        : [];
    }),
  );

  if (trafficData) {
    topologyGraphAndNodeData.graph.edges = getTrafficConnectors(trafficData, allResourcesList);
  }

  // Copy the resources into a mutable list of resources, we don't want to effect the incoming lists
  const dataResources: TopologyDataResources = Object.keys(resources).reduce((obj, key) => {
    obj[key] = {
      ...resources[key],
      data: [...resources[key].data],
    };
    return obj;
  }, {} as TopologyDataResources);

  const baseModel = getBaseTopologyDataModel(dataResources, allResourcesList, utils, transformBy);
  addToTopologyDataModel(baseModel, topologyGraphAndNodeData);

  return topologyGraphAndNodeData;
};

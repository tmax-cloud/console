import * as React from 'react';
import { GraphElement, ModelKind, ComponentFactory as TopologyComponentFactory, withPanZoom, withDragNode, withTargetDrag, withSelection, withDndDrop, withRemoveConnector } from '@console/topology';
import { Application } from './groups';
import { DaemonSet } from './hypercloud/groups/DaemonSet';
import { ReplicaSet } from './hypercloud/groups/ReplicaSet';
import { Deployment } from './hypercloud/groups/Deployment';
import { StatefulSet } from './hypercloud/groups/StatefulSet';
import { WorkloadNode } from './nodes';
import GraphComponent from './GraphComponent';
import { workloadContextMenu, groupContextMenu, graphContextMenu } from './nodeContextMenu';
import { NodeComponentProps, graphDropTargetSpec, nodeDragSourceSpec, nodeDropTargetSpec, applicationGroupDropTargetSpec, edgeDragSourceSpec, removeConnectorCallback, MOVE_CONNECTOR_DROP_TYPE, withContextMenu } from './componentUtils';
import './ContextMenu.scss';
import { TYPE_WORKLOAD, TYPE_CONNECTS_TO, TYPE_APPLICATION_GROUP, TYPE_AGGREGATE_EDGE, TYPE_SERVICE_BINDING, TYPE_TRAFFIC_CONNECTOR, TYPE_DAEMONSET_GROUP, TYPE_DEPLOYMENT_GROUP, TYPE_STATEFULSET_GROUP, TYPE_REPLICASET_GROUP, TYPE_SERVICE, TYPE_POD, TYPE_PVC } from './const';
import { createConnection } from './createConnection';
import { withEditReviewAccess } from './withEditReviewAccess';
import { AggregateEdge, ConnectsTo, ServiceBinding, TrafficConnector } from './edges';
import { AbstractSBRComponentFactory } from './AbstractSBRComponentFactory';
import { PodNode } from './hypercloud/nodes/PodNode';
import { PVCNode } from './hypercloud/nodes/PVCNode';

class ComponentFactory extends AbstractSBRComponentFactory {
  getFactory = (): TopologyComponentFactory => {
    return (kind, type): React.ComponentType<{ element: GraphElement }> | undefined => {
      switch (type) {
        case TYPE_DAEMONSET_GROUP:
          return withDndDrop(applicationGroupDropTargetSpec)(withSelection(false, true)(withContextMenu(groupContextMenu)(DaemonSet)));
        case TYPE_DEPLOYMENT_GROUP:
          return withDndDrop(applicationGroupDropTargetSpec)(withSelection(false, true)(withContextMenu(groupContextMenu)(Deployment)));
        case TYPE_STATEFULSET_GROUP:
          return withDndDrop(applicationGroupDropTargetSpec)(withSelection(false, true)(withContextMenu(groupContextMenu)(StatefulSet)));
        case TYPE_REPLICASET_GROUP:
          return withDndDrop(applicationGroupDropTargetSpec)(withSelection(false, true)(withContextMenu(groupContextMenu)(ReplicaSet)));
        case TYPE_APPLICATION_GROUP:
          return withDndDrop(applicationGroupDropTargetSpec)(withSelection(false, true)(withContextMenu(groupContextMenu)(Application)));
        case TYPE_POD:
          return withDndDrop<any, any, { droppable?: boolean; hover?: boolean; canDrop?: boolean }, NodeComponentProps>(nodeDropTargetSpec)(withEditReviewAccess('patch')(withDragNode(nodeDragSourceSpec(type))(withSelection(false, true)(withContextMenu(workloadContextMenu)(PodNode)))));

        case TYPE_PVC:
          return withDndDrop<any, any, { droppable?: boolean; hover?: boolean; canDrop?: boolean }, NodeComponentProps>(nodeDropTargetSpec)(withEditReviewAccess('patch')(withDragNode(nodeDragSourceSpec(type))(withSelection(false, true)(withContextMenu(workloadContextMenu)(PVCNode)))));
        case TYPE_SERVICE:
        case TYPE_WORKLOAD:
          return withDndDrop<any, any, { droppable?: boolean; hover?: boolean; canDrop?: boolean }, NodeComponentProps>(nodeDropTargetSpec)(withEditReviewAccess('patch')(withDragNode(nodeDragSourceSpec(type))(withSelection(false, true)(withContextMenu(workloadContextMenu)(WorkloadNode)))));
        case TYPE_CONNECTS_TO:
          return withTargetDrag(edgeDragSourceSpec(MOVE_CONNECTOR_DROP_TYPE, this.serviceBinding, createConnection))(ConnectsTo);
        case TYPE_SERVICE_BINDING:
          return withRemoveConnector(removeConnectorCallback)(ServiceBinding);
        case TYPE_AGGREGATE_EDGE:
          return AggregateEdge;
        case TYPE_TRAFFIC_CONNECTOR:
          return TrafficConnector;
        default:
          switch (kind) {
            case ModelKind.graph:
              return withDndDrop(graphDropTargetSpec)(withPanZoom()(withSelection(false, true)(withContextMenu(graphContextMenu)(GraphComponent))));
            default:
              return undefined;
          }
      }
    };
  };
}

export { ComponentFactory };

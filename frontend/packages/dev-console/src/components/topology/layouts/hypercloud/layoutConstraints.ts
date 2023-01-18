import * as _ from 'lodash';
import { ColaGroup, ColaLink, ColaNode, LayoutOptions } from '@console/topology';
import { TYPE_CONNECTS_TO, TYPE_REPLICASET_GROUP, TYPE_WORKLOAD, TYPE_POD, TYPE_PVC } from '../../components/const';

// TODO : constraint 리팩토링 하기
const getNodeTimeStamp = (node: ColaNode): Date => {
  const data = node.element.getData();
  return new Date(_.get(data, 'resources.obj.metadata.creationTimestamp', 0));
};

// Sort nodes most recent to least recent
const nodeSorter = (node1: ColaNode, node2: ColaNode) => (getNodeTimeStamp(node1) > getNodeTimeStamp(node2) ? -1 : 1);

export const layoutConstraints = (nodes: ColaNode[], groups: ColaGroup[], edges: ColaLink[], options: LayoutOptions): any[] => {
  const constraints: any[] = [];

  [...groups, ...nodes]
    .filter(g => g.element.getType() === TYPE_POD || g.element.getType() === TYPE_PVC || g.element.getType() === TYPE_WORKLOAD || (g.element.getType() === TYPE_REPLICASET_GROUP && g.element.isCollapsed() === true))
    .forEach(g => {
      const eventSourceLinks = edges.filter(e => e.element.getType() === TYPE_CONNECTS_TO && (e.target.element === g.element || e.target.element.getParent() === g.element)).sort((l1: ColaLink, l2: ColaLink) => nodeSorter(l1.source, l2.source));
      if (eventSourceLinks.length) {
        const height = eventSourceLinks.reduce((current: number, nextLink: ColaLink) => {
          return current + nextLink.source.height;
        }, 0);
        const serviceNode = g;
        const serviceDistance = (serviceNode as ColaNode).width / 2;

        const eventSourceConstraint: any = {
          type: 'alignment',
          axis: 'y',
          offsets: [{ node: eventSourceLinks[0].target.index, offset: 0 }],
        };
        let nextOffset = -height / 2;
        eventSourceLinks.forEach((link: ColaLink) => {
          // Evenly space out the event sources vertically
          eventSourceConstraint.offsets.push({
            node: link.source.index,
            offset: nextOffset + link.source.height / 2,
          });
          // Keep the event sources to the right
          constraints.push({
            axis: 'x',
            left: serviceNode.index,
            right: link.source.index,
            gap: serviceDistance + link.source.width / 2 + options.linkDistance,
            equality: true,
          });
          nextOffset += link.source.height;
        });
        constraints.push(eventSourceConstraint);
      }
    });
  return constraints;
};

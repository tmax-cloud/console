import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { calculateRadius } from '@console/shared';
import { Node, observer, WithCreateConnectorProps, WithDragNodeProps, WithSelectionProps, WithDndDropProps, WithContextMenuProps } from '@console/topology';
import { RootState } from '@console/internal/redux';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { ContainerNodeIcon } from '@patternfly/react-icons';
import { Decorator } from '../../nodes/Decorator';
import { BaseNode } from '../../nodes/BaseNode';

import './PodNode.scss';

interface StateProps {}

export type PodNodeProps = {
  element: Node;
  hover?: boolean;
  dragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  urlAnchorRef?: React.Ref<SVGCircleElement>;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

const hasNodeName = data => {
  return data.kind === 'Pod' && _.get(data, 'spec', 'nodeName');
};

const findNodeName = data => {
  return { nodeUrl: `/k8s/cluster/nodes/${data.spec.nodeName}`, nodeIcon: 'hi' };
};

const ObservedPodNode: React.FC<PodNodeProps> = ({ element, urlAnchorRef, canDrop, dropTarget, ...rest }) => {
  const { width, height } = element.getDimensions();
  const podData = element.getData().data;
  const size = Math.min(width, height);
  const { obj: pod, status, image, kind } = podData;
  const { radius, decoratorRadius } = calculateRadius(size);
  const cx = width / 2;
  const cy = height / 2;
  const { nodeUrl, nodeIcon } = hasNodeName(pod) && findNodeName(pod);

  return (
    <g>
      <Tooltip content="" trigger="manual" isVisible={dropTarget && canDrop} tippyProps={{ duration: 0, delay: 0 }}>
        <BaseNode
          className="odc-pod-node"
          outerRadius={radius}
          innerRadius={radius - 15}
          icon={image}
          kind={kind}
          element={element}
          dropTarget={dropTarget}
          canDrop={canDrop}
          {...rest}
          attachments={[
            nodeIcon && (
              <Tooltip key="node" content={pod.spec.nodeName} position={TooltipPosition.right}>
                <Decorator x={cx + radius - decoratorRadius * 0.7} y={cy + radius - decoratorRadius * 0.7} radius={decoratorRadius} href={nodeUrl} external>
                  {/* <g transform={`translate(-${decoratorRadius / 2}, -${decoratorRadius / 2})`}>{nodeIcon}</g> */}
                  <g transform={`translate(-${decoratorRadius / 2}, -${decoratorRadius / 2})`}>
                    <ContainerNodeIcon style={{ fontSize: decoratorRadius }} alt={pod.spec.nodeName} />
                  </g>
                </Decorator>
              </Tooltip>
            ),
            status && (
              <Tooltip key="phase" content={status.phase} position={TooltipPosition.left}>
                <Decorator x={cx - radius + decoratorRadius * 0.7} y={cy + radius - decoratorRadius * 0.7} radius={decoratorRadius} external>
                  <g transform={`translate(-7, -7)`}>
                    <foreignObject width="1em" height="1em" style={{ fontSize: '1em' }}>
                      {status.icon}
                    </foreignObject>
                  </g>
                </Decorator>
              </Tooltip>
            ),
          ]}
        ></BaseNode>
      </Tooltip>
    </g>
  );
};

const mapStateToProps = (state: RootState): StateProps => {
  // MEMO : 추후에 사용할 수 있어서 남겨놓음
  return {};
};

const PodNode = connect(mapStateToProps)(observer(ObservedPodNode));
export { PodNode };

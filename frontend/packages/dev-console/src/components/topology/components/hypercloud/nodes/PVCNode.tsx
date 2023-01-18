import * as React from 'react';
import { calculateRadius } from '@console/shared';
import { Node, observer, WithCreateConnectorProps, WithDragNodeProps, WithSelectionProps, WithDndDropProps, WithContextMenuProps } from '@console/topology';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Decorator } from '../../nodes/Decorator';
import { BaseNode } from '../../nodes/BaseNode';

import './PodNode.scss';

export type PVCNodeProps = {
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

const ObservedPVCNode: React.FC<PVCNodeProps> = ({ element, urlAnchorRef, canDrop, dropTarget, ...rest }) => {
  const { width, height } = element.getDimensions();
  const pvcData = element.getData().data;
  const size = Math.min(width, height);
  const { status, image, kind } = pvcData;
  const { radius, decoratorRadius } = calculateRadius(size);
  const cx = width / 2;
  const cy = height / 2;
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
        />
      </Tooltip>
    </g>
  );
};

const PVCNode = observer(ObservedPVCNode);
export { PVCNode };

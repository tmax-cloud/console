import * as React from 'react';
import { Node, observer, WithDndDropProps, WithSelectionProps, WithContextMenuProps } from '@console/topology';
import { SHOW_GROUPING_HINT_EVENT } from '../../../topology-types';
import { RegroupHint } from '../../RegroupHint';
import ReplicaSetNode from './ReplicaSetNode';
import ReplicaSetGroup from './ReplicaSetGroup';

import './ReplicaSet.scss';

type ReplicaSetProps = {
  element: Node;
  droppable?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  dragging?: boolean;
  dragRegroupable?: boolean;
} & WithSelectionProps &
  WithDndDropProps &
  WithContextMenuProps;

const ObservedReplicaSet: React.FC<ReplicaSetProps> = ({ element, selected, onSelect, dndDropRef, droppable, canDrop, dropTarget, dragRegroupable, onContextMenu, contextMenuOpen, dragging }) => {
  const needsHintRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    const needsHint = dropTarget && !canDrop && dragRegroupable;
    if (needsHint !== needsHintRef.current) {
      needsHintRef.current = needsHint;
      element.getController().fireEvent(SHOW_GROUPING_HINT_EVENT, element, needsHint ? <RegroupHint /> : null);
    }
  }, [dropTarget, canDrop, element, dragRegroupable]);

  if (element.isCollapsed()) {
    return <ReplicaSetNode element={element} selected={selected} onSelect={onSelect} dndDropRef={dndDropRef} canDrop={canDrop} dropTarget={dropTarget} onContextMenu={onContextMenu} contextMenuOpen={contextMenuOpen} dragging={dragging} />;
  }

  return <ReplicaSetGroup element={element} selected={selected} onSelect={onSelect} dndDropRef={dndDropRef} canDrop={canDrop} dropTarget={dropTarget} droppable={droppable} onContextMenu={onContextMenu} contextMenuOpen={contextMenuOpen} dragging={dragging} />;
};

const ReplicaSet = observer(ObservedReplicaSet);
export { ReplicaSet };

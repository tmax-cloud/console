import * as React from 'react';
import { observer, Node } from '../../../../../topology/src';

const SpacerNode: React.FC<{ element: Node }> = () => {
  return <g />;
};

export default observer(SpacerNode);

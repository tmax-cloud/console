import * as React from 'react';
import { getNodeRoles } from '@console/shared';
import { NodeKind } from '@console/internal/module/k8s';

type NodeRolesProps = {
  node?: NodeKind;
};

const NodeRoles: React.FC<NodeRolesProps> = ({ node }) => (
  <>
    {getNodeRoles(node)
      .sort()
      .join(', ') || 'worker'}
  </>
);

export default NodeRoles;

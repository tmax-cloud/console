import * as React from 'react';
import { Link } from 'react-router-dom';
import { resourceObjPath } from '../../utils';

// TODO: i18n 적용
export const PodStatus: React.FC<PodStatusProps> = ({ resource, kind, desired = 0, ready = 0 }) => {
  const href = `${resourceObjPath(resource, kind)}/pods`;
  return (
    <Link to={href}>
      {ready} of {desired} pods
    </Link>
  );
};

type PodStatusProps = {
  resource: any;
  kind: string;
  desired: number;
  ready: number;
};

import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { ClusterManagerModel } from '@console/internal/models';

export const MultiClusterRedirect = () => {
  return <Redirect to={`/k8s/all-namespaces/${ClusterManagerModel.plural}`} />;
};

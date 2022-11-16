import * as React from 'react';
import { PodKind } from '@console/internal/module/k8s';
import { AsyncComponent } from '@console/internal/components/utils';

export const PodExecLoader: React.FC<PodExecLoaderProps> = ({ obj, message }) => <AsyncComponent loader={() => import('../../../../../../public/components/pod-exec-hypercloud').then(c => c.PodExec)} obj={obj} message={message} />;

type PodExecLoaderProps = {
  obj: PodKind;
  message?: React.ReactElement;
};

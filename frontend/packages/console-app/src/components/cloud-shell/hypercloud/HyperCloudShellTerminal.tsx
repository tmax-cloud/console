import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '@console/internal/redux';
import { k8sCreate, k8sGet, UserKind } from '@console/internal/module/k8s';
import { setCloudShellNamespace } from '../cloud-shell-utils';
import CloudShellSetup from '../setup/CloudShellSetup';

import '../CloudShellTerminal.scss';
import { PodModel } from '@console/internal/models';
import { PodExecLoader } from './podExecLoader';

type StateProps = {
  user: UserKind;
};

type Props = {
  onCancel?: () => void;
};

type CloudShellTerminalProps = StateProps & Props;

const HyperCloudShellTerminal: React.FC<CloudShellTerminalProps> = ({ user, onCancel }) => {
  const [namespace, setNamespace] = React.useState('hypercloud-kubectl');

  const [kubectlPod, setKubectlPod] = React.useState(undefined);

  React.useEffect(() => {
    k8sGet(PodModel, `${namespace}-${user['email'].replace('@', '.')}`, namespace)
      .then(data => setKubectlPod(data))
      .catch(e => {
        console.log(e);
        const workspace = {
          metadata: { name: `${namespace}-${user['email'].replace('@', '.')}`, namespace: namespace },
          spec: { containers: [{ name: 'test', image: 'nginx' }] },
        };
        k8sCreate(PodModel, workspace)
          .then(data => setKubectlPod(data))
          .catch(e => console.log(e));
      });
  }, []);

  if (kubectlPod) {
    return <PodExecLoader obj={kubectlPod} />;
  }

  // show the form to let the user create a new workspace
  return (
    <CloudShellSetup
      onCancel={onCancel}
      onSubmit={(ns: string) => {
        setCloudShellNamespace(ns);
        setNamespace(ns);
      }}
    />
  );
};

// For testing
export const InternalCloudShellTerminal = HyperCloudShellTerminal;

const stateToProps = (state: RootState): StateProps => ({
  user: state.UI.get('user'),
});

export default connect(stateToProps)(HyperCloudShellTerminal);

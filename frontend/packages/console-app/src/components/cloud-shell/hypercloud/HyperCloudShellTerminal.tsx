import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '@console/internal/redux';
import { k8sGet, UserKind } from '@console/internal/module/k8s';

import '../CloudShellTerminal.scss';
import { PodModel } from '@console/internal/models';
import { PodExecLoader } from './podExecLoader';
import { coFetchJSON } from '@console/internal/co-fetch';
import TerminalLoadingBox from '../TerminalLoadingBox';

type StateProps = {
  user: UserKind;
};

type Props = {
  onCancel?: () => void;
};

type CloudShellTerminalProps = StateProps & Props;

const HyperCloudShellTerminal: React.FC<CloudShellTerminalProps> = ({ user }) => {
  const namespace = 'hypercloud-kubectl';

  const [kubectlPod, setKubectlPod] = React.useState(undefined);
  const [kubectlPodReady, setKubectlPodReady] = React.useState(false);

  // API call
  React.useEffect(() => {
    coFetchJSON(`api/hypercloud/kubectl?userName=${user['email']}`, 'POST');
  }, []);

  React.useEffect(() => {
    const podCheck = setInterval(() => {
      k8sGet(PodModel, `${namespace}-${user['email'].replace('@', '.')}`, namespace).then(data => {
        setKubectlPod(data);
        if (data.status.phase === 'Running') {
          setKubectlPodReady(true);
          clearInterval(podCheck);
        }
      });
    }, 1000);
    return () => clearInterval(podCheck);
  }, []);

  return kubectlPodReady ? <PodExecLoader obj={kubectlPod} /> : <TerminalLoadingBox message="" />;
};

// For testing
export const InternalCloudShellTerminal = HyperCloudShellTerminal;

const stateToProps = (state: RootState): StateProps => ({
  user: state.UI.get('user'),
});

export default connect(stateToProps)(HyperCloudShellTerminal);

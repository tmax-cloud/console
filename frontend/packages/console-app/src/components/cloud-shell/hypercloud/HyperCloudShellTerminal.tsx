import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '@console/internal/redux';
import { k8sGet, UserKind } from '@console/internal/module/k8s';
import { useTranslation } from 'react-i18next';
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
  const [time, setTime] = React.useState(new Date());
  const { t } = useTranslation();

  // API call
  React.useEffect(() => {
    coFetchJSON(`api/hypercloud/kubectl?userName=${user['id']}`, 'POST');
    coFetchJSON(`api/hypercloud/kubectl?userName=${user['id']}`, 'GET')
      .then(response => {
        let date = new Date();
        date.setSeconds(date.getSeconds() + Number(response.timeout));
        setTime(date);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  React.useEffect(() => {
    const podCheck = setInterval(() => {
      k8sGet(PodModel, `${namespace}-${user['id'].replace(/_/g, '-').replace('@', '.')}`, namespace).then(data => {
        setKubectlPod(data);
        if (data.status.phase === 'Running') {
          setKubectlPodReady(true);
          clearInterval(podCheck);
        }
      });
    }, 1000);
    return () => clearInterval(podCheck);
  }, []);
  return kubectlPodReady ? (
    <div>
      <div className="co-cloud-shell-drawer__heading">
        {t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_30', {
          0: time.getFullYear() + '.' + (Number(time.getMonth()) + 1) + '.' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes(),
        })}
      </div>
      <PodExecLoader obj={kubectlPod} />
    </div>
  ) : (
    <TerminalLoadingBox message="" />
  );
};

// For testing
export const InternalCloudShellTerminal = HyperCloudShellTerminal;

const stateToProps = (state: RootState): StateProps => ({
  user: state.UI.get('user'),
});

export default connect(stateToProps)(HyperCloudShellTerminal);

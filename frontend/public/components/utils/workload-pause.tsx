import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';

import { K8sKind, k8sPatch, K8sResourceKind } from '../../module/k8s/index';
import { errorModal } from '../modals/index';
import { useTranslation } from 'react-i18next';

export const togglePaused = (model: K8sKind, obj: K8sResourceKind) => {
  const patch = [
    {
      path: '/spec/paused',
      op: 'add',
      value: !obj.spec.paused,
    },
  ];

  return k8sPatch(model, obj, patch);
};

export const WorkloadPausedAlert = ({ model, obj }) => {
  const { t } = useTranslation();
  return (
    <Alert isInline className="co-alert" variant="info" title={<>{t('SINGLE:MSG_DEPLOYMENTS_DEPLOYMENTDETAILS_PAUSEROLEOUTS_1', { 0: obj.metadata.name })}</>} action={<AlertActionLink onClick={() => togglePaused(model, obj).catch(err => errorModal({ error: err.message }))}>{t('SINGLE:MSG_DEPLOYMENTS_DEPLOYMENTDETAILS_PAUSEROLEOUTS_3')}</AlertActionLink>}>
      {t('SINGLE:MSG_DEPLOYMENTS_DEPLOYMENTDETAILS_PAUSEROLEOUTS_2')}
    </Alert>
  );
};

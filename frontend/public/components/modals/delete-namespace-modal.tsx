import * as React from 'react';
import { k8sKill, K8sKind, K8sResourceKind } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter, ModalComponentProps } from '../factory/modal';
import { HandlePromiseProps, history } from '../utils';
import { ALL_NAMESPACES_KEY, YellowExclamationTriangleIcon } from '@console/shared';
import { Trans, useTranslation } from 'react-i18next';
import { withHandlePromise } from '../utils';
import { getActiveNamespace, setActiveNamespace } from '@console/internal/actions/ui';

export const DeleteNamespaceModal = withHandlePromise((props: DeleteNamespaceModalProps) => {
  const { cancel, close, kind, resource, handlePromise, errorMessage, inProgress } = props;
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = React.useState(false);

  const onSubmit = event => {
    event.preventDefault();
    handlePromise(k8sKill(kind, resource))
      .then(() => {
        if (resource.metadata.name === getActiveNamespace()) {
          setActiveNamespace(ALL_NAMESPACES_KEY);
        }
        close?.();
        history.push(`/k8s/cluster/${kind.plural}`);
      })
      .catch(() => {
        /* do nothing */
      });
  };

  const onKeyUp = e => {
    setConfirmed(e.currentTarget.value === resource.metadata.name);
  };

  const NamespaceName = () => <strong className="co-break-word">{resource.metadata.name}</strong>;

  return (
    <form onSubmit={onSubmit} name="form" className="modal-content ">
      <ModalTitle className="modal-header">
        <YellowExclamationTriangleIcon className="co-icon-space-r" />
        {t('COMMON:MSG_MAIN_POPUP_17')}
      </ModalTitle>
      <ModalBody>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          <Trans i18nKey="COMMON:MSG_MAIN_POPUP_18">{[<NamespaceName />]}</Trans>
        </p>
        <input type="text" className="pf-c-form-control" onKeyUp={onKeyUp} placeholder={t('COMMON:MSG_MAIN_POPUP_19')} autoFocus={true} />
      </ModalBody>
      <ModalSubmitFooter submitText={t('COMMON:MSG_MAIN_POPUP_COMMIT_2')} submitDisabled={!confirmed} cancel={() => cancel?.()} errorMessage={errorMessage} inProgress={inProgress} submitDanger />
    </form>
  );
});

export const deleteNamespaceModal = createModalLauncher(DeleteNamespaceModal);

type DeleteNamespaceModalProps = {
  resource: K8sResourceKind;
  kind: K8sKind;
} & ModalComponentProps &
  HandlePromiseProps;

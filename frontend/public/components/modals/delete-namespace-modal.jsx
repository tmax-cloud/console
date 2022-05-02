import * as React from 'react';
import { k8sKill } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { history } from '../utils';
import { YellowExclamationTriangleIcon } from '@console/shared';
import { Trans, useTranslation } from 'react-i18next';
import { withHandlePromise } from '../utils';

export const DeleteNamespaceModal = withHandlePromise(({ cancel, close, kind, resource, handlePromise, errorMessage, inProgress }) => {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = React.useState(false);

  const onSubmit = event => {
    event.preventDefault();
    handlePromise(k8sKill(kind, resource)).then(() => {
      close?.();
      history.push(`/k8s/cluster/${kind.plural}`);
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

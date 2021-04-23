import * as React from 'react';
import { ModalTitle, ModalBody, ModalSubmitFooter, createModalLauncher } from '@console/internal/components/factory/modal';
import { withHandlePromise, HandlePromiseProps } from '@console/internal/components/utils';
import { NodeKind } from '@console/internal/module/k8s';
import { makeNodeUnschedulable } from '../../../k8s/requests/nodes';
import { useTranslation } from 'react-i18next';

type ConfigureUnschedulableModalProps = HandlePromiseProps & {
  resource: NodeKind;
  cancel?: () => void;
  close?: () => void;
};

const ConfigureUnschedulableModal: React.FC<ConfigureUnschedulableModalProps> = ({ handlePromise, resource, close, cancel, errorMessage, inProgress }) => {
  const handleSubmit = event => {
    event.preventDefault();
    handlePromise(makeNodeUnschedulable(resource))
      .then(close)
      .catch(error => {
        throw error;
      });
  };
  const { t } = useTranslation();
  return (
    <form onSubmit={handleSubmit} name="form" className="modal-content ">
      <ModalTitle>{t('COMMON:MSG_MAIN_POPUP_TITLE_2')}</ModalTitle>
      <ModalBody>{t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_3')}</ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={t('COMMON:MSG_MAIN_POPUP_COMMIT_1')} cancel={cancel} />
    </form>
  );
};

export default createModalLauncher(withHandlePromise(ConfigureUnschedulableModal));

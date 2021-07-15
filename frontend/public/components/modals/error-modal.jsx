import * as React from 'react';
import { ActionGroup, Button } from '@patternfly/react-core';

import { createModalLauncher, ModalTitle, ModalBody, ModalFooter } from '../factory/modal';
import { useTranslation } from 'react-i18next';

export const ModalErrorContent = ({ error, title = 'Error', cancel = undefined }) => {
  const { t } = useTranslation();
  if (title === 'Error') {
    title = t('COMMON:MSG_MAIN_POPUP_4');
  };
  if (error === 'Invalid Pipeline Run configuration, unable to start Pipeline.') {
    error = t('COMMON:MSG_MAIN_POPUP_5');
  }
  return <div className="modal-content">
    <ModalTitle>{title}</ModalTitle>
    <ModalBody>{error}</ModalBody>
    <ModalFooter inProgress={false} errorMessage="">
      <ActionGroup className="pf-c-form pf-c-form__actions--right pf-c-form__group--no-top-margin">
        <Button type="button" variant="secondary" onClick={cancel}>
          {t('COMMON:MSG_MAIN_POPUP_6')}
        </Button>
      </ActionGroup>
    </ModalFooter>
  </div>
};

export const errorModal = createModalLauncher(ModalErrorContent);

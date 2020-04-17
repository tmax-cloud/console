import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalFooter } from '../factory/modal';

export const errorModal = createModalLauncher(({ error, cancel, t }) => {
  return (
    <div>
      <ModalTitle>{t('CONTENT:ERROR')}</ModalTitle>
      <ModalBody>{error}</ModalBody>
      <ModalFooter inProgress={false} errorMessage="">
        <button type="button" onClick={e => cancel(e)} className="btn btn-default">
          {t('CONTENT:OK')}
        </button>
      </ModalFooter>
    </div>
  );
});

import * as React from 'react';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '@console/internal/components/factory';
// import { useFormContext } from 'react-hook-form';

export const _ModalLauncher = props => {
  const { inProgress, errorMessage, title, children, cancel, handleMethod, index, submitText } = props;

  return (
    <form onSubmit={handleMethod.bind(null, cancel, index)}>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>{children}</ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={submitText} cancel={cancel} />
    </form>
  );
};

export const ModalLauncher = createModalLauncher(_ModalLauncher);

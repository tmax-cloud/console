import * as React from 'react';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '@console/internal/components/factory';
// import { useFormContext } from 'react-hook-form';

export const _ModalLauncher = props => {
  const { inProgress, errorMessage, title, children, cancel } = props;

  // const submit = e => {
  //   e.preventDefault();
  // };

  return (
    <>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>{children}</ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText="추가" cancel={cancel} />
    </>
  );
};

export const ModalLauncher = createModalLauncher(_ModalLauncher);

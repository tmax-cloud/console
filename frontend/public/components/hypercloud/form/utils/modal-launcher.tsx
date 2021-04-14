import * as React from 'react';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '@console/internal/components/hypercloud/factory/modal';
// import { useFormContext } from 'react-hook-form';

export const _ModalLauncher = props => {
  const { inProgress, errorMessage, title, children, cancel, handleMethod, index, submitText, id } = props;
  const onCancel = () => {
    // 수정일 경우에만 타는 로직
    let isModify = document.getElementById(`${id}-list`) ? true : false;
    if (isModify) {
      let list = document.getElementById(`${id}-list`).childNodes;
      list.forEach(cur => {
        if (cur['dataset']['modify'] === 'true') {
          cur['dataset']['modify'] = false;
        }
      });
    }
  };
  return (
    <form onSubmit={handleMethod.bind(null, cancel, index)}>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>{children}</ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} id="uId" inProgress={inProgress} onCancel={onCancel} submitText={submitText} cancel={cancel} />
    </form>
  );
};

export const ModalLauncher = createModalLauncher(_ModalLauncher);

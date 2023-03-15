import * as React from 'react';
import { Button, Modal } from '@patternfly/react-core';
import '../utils/help.scss';
import * as _ from 'lodash';
import { TextInput } from '@patternfly/react-core';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';

export const InlineEditCell = ({ value, onUpdate }) => {
  const [editMode, setEditMode] = React.useState(false);
  const [inputText, setInputText] = React.useState(value);

  const saveChanges = () => {
    onUpdate(inputText);
    setEditMode(false);
  };

  const cancelChanges = () => {
    setInputText(value);
    setEditMode(false);
  };

  return (
    <td>
      {editMode ? (
        <>
          <div className="pf-c-inline-edit__group">
            <TextInput value={inputText} onChange={setInputText} onBlur={saveChanges} autoFocus />
            <Button variant="plain" onClick={saveChanges} aria-label="Save">
              <CheckIcon />
            </Button>
            <Button variant="plain" onClick={cancelChanges} aria-label="Cancel">
              <TimesIcon />
            </Button>
          </div>
        </>
      ) : (
        <>
          <span>{value}</span>
          <div className="pf-c-inline-edit__action pf-m-enable-editable">
            <button onClick={() => setEditMode(true)} className="pf-c-button pf-m-plain" type="button" id="single-inline-edit-example-edit-button" aria-label="Edit" aria-labelledby="single-inline-edit-example-edit-button single-inline-edit-example-label">
              <i className="fas fa-pencil-alt" aria-hidden="true"></i>
            </button>
          </div>
        </>
      )}
    </td>
  );
};

export const ModalPage = ({ isModalOpen, handleModalToggle, titleModal, InnerPage, submit }) => {
  const actions = [
    <Button key="cancel" variant="primary" onClick={handleModalToggle}>
      취소
    </Button>,
    <Button key="confirm" variant="secondary" onClick={submit}>
      {titleModal[1]}
    </Button>,
  ];
  return (
    <Modal width={600} title={titleModal[0]} isOpen={isModalOpen} onClose={handleModalToggle} actions={actions}>
      {InnerPage}
    </Modal>
  );
};

import * as React from 'react';
import { Button, Dropdown, DropdownToggle, Modal } from '@patternfly/react-core';
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

import { InputGroup, DropdownItem } from '@patternfly/react-core';

export const InputGroupWithDropdown = ({ setSearchName }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  const dropdownItems = [
    <DropdownItem key="opt-1" value="label" component="button">
      레이블
    </DropdownItem>,
    <DropdownItem key="opt-2" value="name" component="button">
      이름
    </DropdownItem>,
  ];

  return (
    <React.Fragment>
      <InputGroup className="filter-form-in">
        <Dropdown onSelect={onSelect} toggle={<DropdownToggle onToggle={onToggle}>이름</DropdownToggle>} isOpen={isOpen} dropdownItems={dropdownItems} />
        <TextInput
          id="textInput-with-dropdown"
          aria-label="input with dropdown and button"
          placeholder="이름으로 검색"
          onChange={value => {
            console.log(12, value);
            setSearchName(value);
          }}
        />
        <Button id="inputDropdownButton1" variant="control">
          /
        </Button>
      </InputGroup>
    </React.Fragment>
  );
};

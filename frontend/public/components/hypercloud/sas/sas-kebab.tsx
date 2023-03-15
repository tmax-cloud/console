import * as React from 'react';
import { Link } from 'react-router-dom';
import '../utils/help.scss';
import * as _ from 'lodash';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';

export const SasAppKebab = ({ status, handleModalToggle, data }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('toggle-kebab');
    element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const versionItems = [
    <DropdownItem
      key="add-versionItems"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'versiondelete');
      }}
    >
      버전 삭제
    </DropdownItem>,
  ];
  const serviceItems = [
    <Link to={'/sas-app/~new'} className={'link-black-no-underline'}>
      <DropdownItem key="add-serviceItems" component="button">
        크론 생성
      </DropdownItem>
    </Link>,
  ];
  const dropdownItemsReady = [
    <DropdownItem
      key="add-version"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'addversion');
      }}
    >
      버전 추가
    </DropdownItem>,
    <DropdownItem
      key="app-deploy"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'appdeploy');
      }}
    >
      앱 배포
    </DropdownItem>,
    <DropdownItem
      key="app-delete"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'appdelete');
      }}
    >
      앱 삭제
    </DropdownItem>,
  ];
  const dropdownItemsRunning = [
    <DropdownItem
      key="addversion"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'addversion');
      }}
    >
      버전 추가
    </DropdownItem>,
    <DropdownItem
      key="version-select"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'versionselect');
      }}
    >
      버전 선택
    </DropdownItem>,
    <DropdownItem
      key="replica"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'replica');
      }}
    >
      레플리카 수 수정
    </DropdownItem>,
    <DropdownItem
      key="app-stop"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'appstop');
      }}
    >
      앱 중지
    </DropdownItem>,
  ];

  let dropdownItems;

  if (status === 'Archived') {
    dropdownItems = dropdownItemsReady;
  } else if (status === 'Version') {
    dropdownItems = versionItems;
  } else if (status === 'Service') {
    dropdownItems = serviceItems;
  } else {
    dropdownItems = dropdownItemsRunning;
  }
  return <Dropdown className="my-dropdown" onSelect={onSelect} toggle={<KebabToggle className="sas-kebab-min" onToggle={onToggle} />} isOpen={isOpen} isPlain dropdownItems={dropdownItems} position={'right'} />;
};

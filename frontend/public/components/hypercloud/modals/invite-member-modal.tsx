import * as _ from 'lodash-es';
import * as React from 'react';

import { ModalBody, ModalComponentProps, ModalSubmitFooter, ModalTitle, createModalLauncher } from '../../factory/modal';
import { HandlePromiseProps, withHandlePromise } from '../../utils';
import { Section } from '../utils/section';
import { RadioGroup } from '@console/internal/components/radio';
import { TextInput } from '@patternfly/react-core';
import Select, { components } from 'react-select';
import { coFetchJSON } from '../../../co-fetch';
import { getId, getUserGroup, getAuthUrl, getAccessToken } from '../../../hypercloud/auth';
import { UsersIcon, TimesIcon, SearchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const { Option, Input } = components;

const radioItems = (t?: TFunction) => [
  {
    title: t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_RADIOBUTTON_1'),
    value: 'user',
  },
  {
    title: t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_RADIOBUTTON_2'),
    value: 'group',
  },
];

const roleItems = (t?: TFunction) => [
  {
    title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_RADIOBUTTON_1'),
    value: 'admin',
  },
  {
    title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_RADIOBUTTON_2'),
    value: 'developer',
  },
  {
    title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_RADIOBUTTON_3'),
    value: 'guest',
  },
];

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: 0,
    borderColor: '#ededed',
    borderBottomColor: '#8a8d90',
    cursor: 'pointer',
    '&:hover': { borderBottomColor: '#06c' },
    boxShadow: 'none',
    minHeight: '33px',
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return { ...provided, opacity, transition };
  },
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      ':active': {
        ...styles[':active'],
        backgroundColor: isSelected ? '#2684ff' : 'trasparent',
      },
    };
  },
  menuList: provided => ({
    ...provided,
    '&::-webkit-scrollbar': {
      width: '7px',
      background: 'none',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#d8dadb',
      borderRadius: '7.5px',
      opacity: 1,
    },
    '&::-webkit-scrollbar-track': {
      background: 'none',
    },
  }),
  menu: provided => ({
    ...provided,
    marginTop: 0,
  }),
  container: (provided, state) => {
    return {
      ...provided,
      width: '389px',
    };
  },
  input: styles => {
    return {
      ...styles,
      display: 'inline-block',
      marginLeft: '9px',
      marginTop: '4px',
      position: 'absolute',
    };
  },
  placeholder: styles => {
    return {
      ...styles,
      marginLeft: '26px',
    };
  },
};

const SearchBarInput = props => {
  return (
    <div style={{ height: '33px', width: '100%' }}>
      <SearchIcon style={{ display: 'inline-block', fontSize: '16px', height: '33px', color: '#6A6E73' }} />
      <Input {...props} />
    </div>
  );
};

const getRowMemberData = members => members.map(member => (Array.isArray(member) ? { email: member[0], name: member[1] } : { name: member }));

export const InviteMemberModal = withHandlePromise((props: InviteMemberModalProps) => {
  const { t } = useTranslation();
  const { handlePromise, errorMessage, inProgress, close, cancel } = props;
  const [type, setType] = React.useState('user');
  const [role, setRole] = React.useState('admin');
  const [selectedMember, setSelectedMember] = React.useState({ name: '', email: '' });
  const [memberList, setMemberList] = React.useState(null);
  const [isSearchBarDisabled, setSearchBarDisabled] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const members = _.map(props.existMembers, (value, key) => key);
  const groups = _.map(props.existGroups, (value, key) => key);
  const membersUrl = members.reduce((acc, curr) => acc + `&except=${curr}`, `${getAuthUrl()}/user/list?token=${getAccessToken()}`);
  // const membersUrl = members.reduce((acc, curr) => acc + `&except=${curr}`, `${window.SERVER_FLAGS.KeycloakAuthURL}/realms/${window.SERVER_FLAGS.KeycloakRealm}/user/list`);
  const groupsUrl = groups.reduce((acc, curr) => acc + `&except=${curr}`, `${getAuthUrl()}/group/list?exceptDefault=true&token=${getAccessToken()}`);

  const MemberItem = props => {
    return (
      <Option {...props}>
        <div className="hc-invite-modal__member-item" key="list-member">
          <div key="list-member-name">
            {type === 'group' && <UsersIcon className="hc-member__group-icon" />}
            {props.data.name || 'Unknown'}
          </div>
          <div key="list-member-email">{props.data.email}</div>
        </div>
      </Option>
    );
  };

  React.useEffect(() => {
    clearSelection();
  }, [type]);

  // MEMO : Enter 키 입력 시 submit 되지 않게 처리
  const onKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    const url = type === 'user' ? membersUrl : groupsUrl;
    coFetchJSON(url)
      .then(res => {
        let formattedMembers = getRowMemberData(res);
        setIsAdmin(true);
        setMemberList(formattedMembers);
      })
      .catch(err => {
        setIsAdmin(false);
      });
  }, [type]);

  const clearSelection = () => {
    setSelectedMember({ name: '', email: '' });
    setSearchBarDisabled(false);
  };

  const noOptionsMessage = ({ inputValue }) => {
    return t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SEARCHBAR_2', { 0: inputValue });
  };

  const filterOptions = (candidate, input) => {
    if (input) {
      // MEMO : startsWith case insensitive regex
      const startsWithRegex = new RegExp('^' + input, 'i');
      return startsWithRegex.test(candidate.data.email) || startsWithRegex.test(candidate.data.name);
    }
    return true;
  };

  const onSelectItem = (value, action) => {
    setSelectedMember(value);
    setSearchBarDisabled(true);
  };

  const submit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    // MEMO : user초대일 땐 member email, group초대일 땐 group name 만 넣어서 콜하면 됨
    const memberEmail = type === 'user' ? selectedMember.email : selectedMember.name;
    const promise = coFetchJSON(`/api/multi-hypercloud/namespaces/${props.namespace}/clustermanagers/${props.clusterName}/member_invitation/${type}/${memberEmail}?userId=${getId()}${getUserGroup()}&remoteRole=${role}`, 'POST');
    console.log('promise? ', promise);
    handlePromise(promise).then(close);
  };

  return (
    <form onSubmit={submit} name="form" className="modal-content ">
      <ModalTitle>{t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_TITLE_1')}</ModalTitle>
      <ModalBody unsetOverflow={true}>
        <Section id="user">
          <div className="hc-invite-modal__input-members">
            <RadioGroup
              id="type"
              currentValue={type}
              items={radioItems.bind(null, t)()}
              onChange={({ currentTarget }) => {
                setType(currentTarget.value);
                clearSelection();
              }}
              inline
            />
            <div className="hc-invite-modal__members">
              {isAdmin ? (
                <>
                  {isSearchBarDisabled ? (
                    <div className="hc-invite-modal__selectedMember">
                      <span key="member_name" className="hc-invite-modal__selectedMember__name">
                        {type === 'group' && <UsersIcon className="hc-member__group-icon" />}
                        {selectedMember.name || 'Unknown'}
                        <TimesIcon onClick={clearSelection} className="hc-member__close-icon" />
                      </span>
                      <span key="member_email" className="hc-invite-modal__selectedMember__email">
                        {selectedMember.email}
                      </span>
                    </div>
                  ) : (
                    <Select
                      styles={customStyles}
                      options={memberList}
                      components={{
                        Option: MemberItem,
                        IndicatorSeparator: () => null,
                        IndicatorsContainer: () => null,
                        SingleValue: () => null,
                        Input: SearchBarInput,
                      }}
                      filterOption={filterOptions}
                      onChange={onSelectItem}
                      classNamePrefix="hc-member-list"
                      isSearchable={true}
                      noOptionsMessage={noOptionsMessage}
                      placeholder={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SEARCHBAR_1')}
                    />
                  )}
                </>
              ) : (
                <TextInput
                  aria-label="user-email-input"
                  type="text"
                  name="selected-member"
                  value={selectedMember.email}
                  onChange={value => {
                    setSelectedMember({ name: value, email: value });
                  }}
                />
              )}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{type === 'user' ? t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SUBMESSAGE_1') : t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SUBMESSAGE_2')}</div>
          </div>
        </Section>
        <Section label={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_LABEL_1')} id="role" isRequired={true}>
          <RadioGroup id="role" currentValue={role} items={roleItems.bind(null, t)()} onChange={({ currentTarget }) => setRole(currentTarget.value)} />
        </Section>
      </ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_BUTTON_3')} cancelText={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_BUTTON_2')} cancel={cancel} />
    </form>
  );
});

export const inviteMemberModal = createModalLauncher(InviteMemberModal);

export type InviteMemberModalProps = {
  clusterName: string;
  namespace: string;
  type: string;
  existMembers: string[];
  existGroups: string[];
} & ModalComponentProps &
  HandlePromiseProps;

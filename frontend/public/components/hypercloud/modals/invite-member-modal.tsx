import * as _ from 'lodash-es';
import * as React from 'react';

import {
  ModalBody,
  ModalComponentProps,
  ModalSubmitFooter,
  ModalTitle,
  createModalLauncher,
} from '../../factory/modal';
import { HandlePromiseProps, withHandlePromise } from '../../utils';
import { Section } from '../utils/section';
import { RadioGroup } from '@console/internal/components/radio';
import { TextInput } from '@patternfly/react-core';
import { coFetchJSON } from '../../../co-fetch';
import { getId, getUserGroup } from '../../../hypercloud/auth';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const radioItems = (t?: TFunction) => [
  {
    title: t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_RADIOBUTTON_1'),
    value: 'user'
  },
  {
    title: t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_RADIOBUTTON_2'),
    value: 'group'
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
    value: 'guest'
  },
];

export const InviteMemberModal = withHandlePromise((props: InviteMemberModalProps) => {
  const [type, setType] = React.useState('user');
  const [role, setRole] = React.useState('admin');
  const [errorMsg, setError] = React.useState('');
  const [selectedMember, selectMember] = React.useState('');
  const [inProgress, setProgress] = React.useState(false);

  React.useEffect(() => {
    clearSelection();
  }, [type]);

  const clearSelection = () => {
    selectMember('');
  };

  const submit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // Append to an existing array, but handle the special case when the array is null.
    setProgress(true);
    coFetchJSON(`/api/multi-hypercloud/namespaces/${props.namespace}/clustermanagers/${props.clusterName}/member_invitation/${type}/${selectedMember}?userId=${getId()}${getUserGroup()}&remoteRole=${role}`, 'POST')
      .then((res) => {
        setProgress(false);
        props.close();
      })
      .catch((err) => {
        clearSelection();
        setProgress(false);
        setError(err);
      });
  };

  const { t } = useTranslation();
  return (
    <form onSubmit={submit} name='form' className='modal-content '>
      <ModalTitle>{t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_TITLE_1')}</ModalTitle>
      <ModalBody unsetOverflow={true}>
        <Section id='user'>
          <div className='hc-invite-modal__input-members'>
            <RadioGroup
              id='type'
              currentValue={type}
              items={radioItems.bind(null, t)()}
              onChange={({ currentTarget }) => { setType(currentTarget.value); clearSelection() }}
              inline
            />
            <div className='hc-invite-modal__members'>
              <TextInput
                type="text"
                name="selected-member"
                value={selectedMember}
                onChange={selectMember}
              />
            </div>
            <div>
              {type === 'user' ? t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SUBMESSAGE_1').split('\n').map( line => {
            return (<span>{line}<br/></span>)
          }) : t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SUBMESSAGE_2').split('\n').map( line => {
            return (<span>{line}<br/></span>)
          })}
            </div>
          </div>
        </Section>
        <Section label={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_LABEL_1')} id='role' isRequired={true}>
          <RadioGroup
            id='role'
            currentValue={role}
            items={roleItems.bind(null, t)()}
            onChange={({ currentTarget }) => setRole(currentTarget.value)}
          />
        </Section>
      </ModalBody>
      <ModalSubmitFooter
        errorMessage={errorMsg}
        inProgress={inProgress}
        submitText={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_BUTTON_3')}
        cancelText={t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_BUTTON_2')}
        cancel={props.cancel}
      />
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

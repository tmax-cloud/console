import * as _ from 'lodash-es';
import * as React from 'react';

import { ModalBody, ModalComponentProps, ModalSubmitFooter, ModalTitle, createModalLauncher } from '../../factory/modal';
import { HandlePromiseProps, withHandlePromise } from '../../utils';
import { Section } from '../utils/section';
import { RadioGroup } from '@console/internal/components/radio';
import { coFetchJSON } from '../../../co-fetch';
import { getId, getUserGroup } from '../../../hypercloud/auth';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

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

export const ModifyMemberModal = withHandlePromise((props: ModifyMemberModalProps) => {
  const { handlePromise, close, cancel, inProgress, errorMessage, rerenderPage } = props;
  const [role, setRole] = React.useState(props.member.Role);

  const submit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const promise = coFetchJSON(`/api/multi-hypercloud/namespaces/${props.member.Namespace}/clustermanagers/${props.member.Cluster}/update_role/${props.member.Attribute}/${props.member.MemberId}?userId=${getId()}${getUserGroup()}&remoteRole=${role}`, 'PUT');
    handlePromise(promise).then(() => {
      close();
      rerenderPage(true);
    });
  };

  const { t } = useTranslation();
  return (
    <form onSubmit={submit} name="form" className="modal-content ">
      <ModalTitle>{t('MULTI:MSG_MULTI_CLUSTERS_CHANGEPERMISSIONSPOPUP_TITLE_1')}</ModalTitle>
      <ModalBody className="modal-body">
        <Section id="role">
          <RadioGroup id="role" currentValue={role} items={roleItems.bind(null, t)()} onChange={({ currentTarget }) => setRole(currentTarget.value)} />
        </Section>
      </ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancelText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')} cancel={cancel} />
    </form>
  );
});

export const modifyMemberModal = createModalLauncher(ModifyMemberModal);

export type ModifyMemberModalProps = {
  rerenderPage?: any;
  member: {
    Id?: number;
    Namespace?: string;
    Cluster?: string;
    MemberId: string;
    MemberName: string;
    Attribute: 'group' | 'user';
    Role: 'guest' | 'developer' | 'admin';
    Status?: 'invited' | 'owner';
    CreatedTime?: string;
    UpdatedTime?: string;
  };
} & ModalComponentProps &
  HandlePromiseProps;

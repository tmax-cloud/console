import * as _ from 'lodash-es';
import * as React from 'react';

import { ModalBody, ModalComponentProps, ModalSubmitFooter, ModalTitle, createModalLauncher } from '../../factory/modal';
import { HandlePromiseProps, withHandlePromise } from '../../utils';
import { YellowExclamationTriangleIcon } from '@console/shared';
import { coFetchJSON } from '../../../co-fetch';
import { getId, getUserGroup } from '../../../hypercloud/auth';
import { useTranslation } from 'react-i18next';

export const RemoveMemberModal = withHandlePromise((props: RemoveMemberModalProps) => {
  const { handlePromise, close, cancel, errorMessage, inProgress, rerenderPage } = props;
  const submit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault(); ///cluster/cho/remove_member/group/ck1-3?userId=kubernetes-admin&userGroup=hypercloud5
    const promise = coFetchJSON(`/api/multi-hypercloud/namespaces/${props.member.Namespace}/clustermanagers/${props.member.Cluster}/remove_member/${props.member.Attribute}/${props.member.MemberId}?userId=${getId()}${getUserGroup()}`, 'POST');
    handlePromise(promise).then(() => {
      close();
      rerenderPage(true);
    });
  };

  const { t } = useTranslation();

  return (
    <form onSubmit={submit} name="form" className="modal-content ">
      <ModalTitle>
        <YellowExclamationTriangleIcon className="co-icon-space-r" />
        {t('MULTI:MSG_MULTI_CLUSTERS_DELETEPEPLEPOPUP_TITLE_1')}
      </ModalTitle>
      <ModalBody className="modal-body">
        <div>{t('MULTI:MSG_MULTI_CLUSTERS_DELETEPEPLEPOPUP_MAINMESSAGE_1', { 0: props.member.MemberName, 1: props.member.MemberId, 2: props.member.Cluster })}</div>
      </ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={t('MULTI:MSG_MULTI_CLUSTERS_DELETEACCESSMEMBER_2')} cancelText={t('MULTI:MSG_MULTI_CLUSTERS_DELETEACCESSMEMBER_1')} cancel={cancel} />
    </form>
  );
});

export const removeMemberModal = createModalLauncher(RemoveMemberModal);

export type RemoveMemberModalProps = {
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

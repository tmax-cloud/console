import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter, ModalComponentProps } from '../factory/modal';
import { BlueInfoCircleIcon } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
import { HandlePromiseProps, withHandlePromise } from '../utils';

//Modal for Helm Repository Update
export const HelmRepositoryUpdateModal = withHandlePromise((props: HelmRepositoryUpdateModalProps) => {
  const submit = event => {
    event.preventDefault();
    const { updateServiceURL } = props;
    props.handlePromise(coFetchJSON.put(updateServiceURL)).then(() => {
      props.close();
    });
  };
  const { message, stringKey, name } = props;
  const { t } = useTranslation();

  return (
    <form onSubmit={submit} name="form" className="modal-content ">
      <ModalTitle>
        <BlueInfoCircleIcon className="co-icon-space-r" />
        {t('COMMON:MSG_MAIN_ACTIONBUTTON_51', { 0: t(stringKey) })}?
      </ModalTitle>
      <ModalBody className="modal-body">
        {message}
        <div>
          {/* string 필요 */}
          {`${name}을(를) 업데이트하시겠습니까?`}
        </div>
      </ModalBody>
      <ModalSubmitFooter errorMessage={props.errorMessage} inProgress={props.inProgress} submitText={t('SINGLE:MSG_PIPELINES_CREATEFORM_41')} cancel={props.cancel} />
    </form>
  );
});

export const helmrepositoryUpdateModal = createModalLauncher(HelmRepositoryUpdateModal);

export type HelmRepositoryUpdateModalProps = {
  message?: string,
  updateServiceURL?: string,
  stringKey?: string,
  name?: string,
} & ModalComponentProps &
  HandlePromiseProps;

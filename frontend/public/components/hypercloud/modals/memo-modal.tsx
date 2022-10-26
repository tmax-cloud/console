import * as _ from 'lodash-es';
import * as React from 'react';
import { TextArea } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { K8sKind, k8sPatch, K8sResourceKind } from '@console/internal/module/k8s';
import { ModalBody, ModalComponentProps, ModalSubmitFooter, ModalTitle, createModalLauncher } from '../../factory/modal';
import { HandlePromiseProps, withHandlePromise } from '../../utils';
import { Section } from '../utils/section';

const MEMO_KEY = 'memo';

const MemoModal = withHandlePromise((props: MemoModalProps) => {
  const { t } = useTranslation();
  const { isCreate, memo = '', model, resource, handlePromise, errorMessage, inProgress, close, cancel } = props;
  const [memoText, setMemoText] = React.useState(memo);

  const submit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const newAnnotations = _.omit(resource.metadata.annotations || {}, [MEMO_KEY]);
    memoText && (newAnnotations[MEMO_KEY] = memoText);
    const patch = [{ path: '/metadata/annotations', op: resource.metadata.annotations ? 'replace' : 'add', value: newAnnotations }];
    handlePromise(k8sPatch(model, resource, patch))
      .then(close)
      .catch(e => console.error(e));
  };

  return (
    <form onSubmit={submit} name="form" className="modal-content">
      <ModalTitle>{isCreate ? t('COMMON:MSG_MAIN_POPUP_TITLE_5') : t('COMMON:MSG_MAIN_POPUP_TITLE_6')}</ModalTitle>
      <ModalBody unsetOverflow={true}>
        <p>{t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_29')}</p>
        <Section id="memo">
          <TextArea aria-label="memo-input" value={memoText} style={{ resize: 'vertical', height: '150px' }} onChange={value => setMemoText(value)} />
        </Section>
      </ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={isCreate ? t('COMMON:MSG_COMMON_BUTTON_COMMIT_8') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancelText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')} cancel={cancel} />
    </form>
  );
});

export const memoModal = createModalLauncher(MemoModal);

type MemoModalProps = {
  isCreate: boolean;
  memo: string;
  model: K8sKind;
  resource: K8sResourceKind | any;
} & ModalComponentProps &
  HandlePromiseProps;

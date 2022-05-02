import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, history, resourceListPathFromModel } from '../utils';
import { YellowExclamationTriangleIcon } from '@console/shared';
import { withTranslation, Trans } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
import { ErrorMessage } from '@console/internal/components/utils/button-bar';
//Modal for resource deletion and allows cascading deletes if propagationPolicy is provided for the enum
class DeleteModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
    this.state = Object.assign(this.state, {
      isChecked: true,
    });
  }

  _submit(event) {
    event.preventDefault();
    const url = this.props.deleteServiceURL;
    this.handlePromise(coFetchJSON.delete(url))
      .then(() => {
        this.props.close();
      })
  }

  _onChecked() {
    this.checked = !this.checked;
  }
  render() {
    const { deleteServiceURL, resourceStringKey, namespace, name, message, t } = this.props;
    const ResourceName = () => <strong className="co-break-word">{name}</strong>;
    const Namespace = () => <strong>{namespace}</strong>;
    return (
      <form onSubmit={this._submit} name="form" className="modal-content ">
        <ModalTitle>
          <YellowExclamationTriangleIcon className="co-icon-space-r" />
          {t('COMMON:MSG_MAIN_ACTIONBUTTON_16', { 0: t(resourceStringKey) })}?
        </ModalTitle>
        <ModalBody className="modal-body">
          {message}
          <div>{namespace ? <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_6">{[<ResourceName />, <Namespace />]}</Trans> : <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_25">{[<ResourceName />]}</Trans>}</div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitDanger submitText={this.props.btnText || `${t('SINGLE:MSG_PIPELINES_CREATEFORM_41')}`} cancel={this._cancel} />
      </form>
    );
  }
}

export const deleteModal = createModalLauncher(withTranslation()(DeleteModal));

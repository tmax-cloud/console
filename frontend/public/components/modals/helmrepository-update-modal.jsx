import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent } from '../utils';
import { BlueInfoCircleIcon } from '@console/shared';
import { withTranslation, Trans } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
//Modal for Helm Repository Update
class HelmRepositoryUpdateModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
  }

  _submit(event) {
    event.preventDefault();
    const { updateServiceURL } = this.props;
    this.handlePromise(coFetchJSON.put(updateServiceURL)).then(() => {
      this.props.close();
    });
  }

  render() {
    const { message, t, updateServiceURL, stringKey, name } = this.props;
    const resourceStringKey = stringKey;
    const ResourceName = () => <strong className="co-break-word">{name}</strong>;
    return (
      <form onSubmit={this._submit} name="form" className="modal-content ">
        <ModalTitle>
          <BlueInfoCircleIcon className="co-icon-space-r" />
          {t('COMMON:MSG_MAIN_ACTIONBUTTON_51', { 0: t(resourceStringKey) })}?
        </ModalTitle>
        <ModalBody className="modal-body">
          {message}
          <div>
            {/* string 필요 */}
            {`${name}을(를) 업데이트하시겠습니까?`}
            {/* <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_25">{[<ResourceName />]}</Trans> */}
          </div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={this.props.btnText || `${t('SINGLE:MSG_PIPELINES_CREATEFORM_41')}`} cancel={this._cancel} />
      </form>
    );
  }
}

export const helmrepositoryUpdateModal = createModalLauncher(withTranslation()(HelmRepositoryUpdateModal));

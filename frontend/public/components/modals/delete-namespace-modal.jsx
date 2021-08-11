import * as React from 'react';
import * as PropTypes from 'prop-types';

import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { k8sKill } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { history, PromiseComponent } from '../utils';
import { YellowExclamationTriangleIcon } from '@console/shared';
import { withTranslation, Trans } from 'react-i18next';

const DeleteNamespaceModal = withTranslation()(
  class DeleteNamespaceModal extends PromiseComponent {
    constructor(props) {
      super(props);
      this.state = Object.assign(this.state, { isTypedNsMatching: false });
      this._submit = this._submit.bind(this);
      this._close = props.close.bind(this);
      this._cancel = props.cancel.bind(this);
      this._matchTypedNamespace = this._matchTypedNamespace.bind(this);
    }

    _matchTypedNamespace(e) {
      this.setState({ isTypedNsMatching: e.target.value === this.props.resource.metadata.name });
    }

    _submit(event) {
      event.preventDefault();
      this.handlePromise(k8sKill(this.props.kind, this.props.resource)).then(() => {
        this._close();
        history.push(`/k8s/cluster/${this.props.kind.plural}`);
      });
    }

    render() {
      const { t } = this.props;
      const NamespaceName = () => <strong className="co-break-word">{this.props.resource.metadata.name}</strong>;
      return (
        <form onSubmit={this._submit} name="form" className="modal-content ">
          <ModalTitle className="modal-header">
            <YellowExclamationTriangleIcon className="co-icon-space-r" />
            {t('COMMON:MSG_MAIN_POPUP_17')}
          </ModalTitle>
          <ModalBody>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              <Trans i18nKey="COMMON:MSG_MAIN_POPUP_18">{[<NamespaceName />]}</Trans>
            </p>
            <input type="text" className="pf-c-form-control" onKeyUp={this._matchTypedNamespace} placeholder={t('COMMON:MSG_MAIN_POPUP_19')} autoFocus={true} />
          </ModalBody>
          <ModalSubmitFooter submitText={t('COMMON:MSG_MAIN_POPUP_COMMIT_2')} submitDisabled={!this.state.isTypedNsMatching} cancel={this._cancel} errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitDanger />
        </form>
      );
    }
  },
);

DeleteNamespaceModal.propTypes = {
  kind: PropTypes.object,
  resource: PropTypes.object,
};

export const deleteNamespaceModal = createModalLauncher(DeleteNamespaceModal);

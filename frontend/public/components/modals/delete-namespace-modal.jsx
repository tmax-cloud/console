import * as React from 'react';
import * as PropTypes from 'prop-types';

import { k8sKill } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { history, PromiseComponent } from '../utils';

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
      history.push(`/k8s/cluster/${this.props.kind.path}`);
    });
  }

  render() {
    const { t } = this.props;
    return (
      <form onSubmit={this._submit} name="form">
        <ModalTitle>{t('ADDITIONAL:DELETE', { something: t('RESOURCE:NAMESPACE') })}</ModalTitle>
        <ModalBody>
          <p>{t('STRING:NAMESPACE-MODAL_0')}</p>
          <p>{t('ADDITIONAL:NAMESPACE-MODAL_0', { something: this.props.resource.metadata.name })}:</p>
          <input type="text" className="form-control" onKeyUp={this._matchTypedNamespace} placeholder={t('CONTENT:ENTERNAME')} autoFocus={true} />
        </ModalBody>
        <ModalSubmitFooter submitText={t('ADDITIONAL:DELETE', { something: t('RESOURCE:NAMESPACE') })} submitDisabled={!this.state.isTypedNsMatching} cancel={this._cancel} errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} />
      </form>
    );
  }
}

DeleteNamespaceModal.propTypes = {
  kind: PropTypes.object,
  resource: PropTypes.object,
};

export const deleteNamespaceModal = createModalLauncher(DeleteNamespaceModal);

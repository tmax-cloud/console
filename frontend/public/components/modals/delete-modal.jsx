import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, history, resourceListPathFromModel } from '../utils';
import { k8sKill } from '../../module/k8s/';

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
    const { kind, resource } = this.props;

    //https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/
    const propagationPolicy = this.state.isChecked ? kind.propagationPolicy : 'Orphan';
    const json = propagationPolicy ? { kind: 'DeleteOptions', apiVersion: 'v1', propagationPolicy } : null;

    this.handlePromise(k8sKill(kind, resource, {}, json)).then(() => {
      this.props.close();
      // If we are currently on the deleted resource's page, redirect to the resource list page
      const re = new RegExp(`/${resource.metadata.name}(/|$)`);
      if (re.test(window.location.pathname)) {
        const listPath = resourceListPathFromModel(kind, _.get(resource, 'metadata.namespace'));
        history.push(listPath);
      }
    });
  }

  _onChecked() {
    this.checked = !this.checked;
  }

  render() {
    const { kind, resource, t } = this.props;
    return (
      <form onSubmit={this._submit} name="form">
        <ModalTitle>{t('ADDITIONAL:DELETE', { something: t(`RESOURCE:${kind.kind.toUpperCase()}`) })}</ModalTitle>
        <ModalBody>
          {_.has(resource.metadata, 'namespace') ? t('ADDITIONAL:DELETE-MODAL_0', { something: resource.metadata.name }) : t('ADDITIONAL:DELETE-MODAL_1', { something1: resource.metadata.name, something2: resource.metadata.namespace })}
          {_.has(kind, 'propagationPolicy') && (
            <div className="co-delete-modal-checkbox">
              <label className="co-delete-modal-checkbox-label">
                <input type="checkbox" onChange={() => this.setState({ isChecked: !this.state.isChecked })} checked={!!this.state.isChecked} />
                &nbsp;&nbsp; <span>{t('STRING:DELETE-MODAL_0')}</span>
              </label>
            </div>
          )}
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={this.props.btnText || t('CONTENT:CONFIRM')} cancel={this._cancel} />
      </form>
    );
  }
}

export const deleteModal = createModalLauncher(DeleteModal);

import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, history, resourceListPathFromModel } from '../utils';
import { k8sKill } from '../../module/k8s/';
import { YellowExclamationTriangleIcon } from '@console/shared';
import { withTranslation, Trans } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
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
    const { kind, resource, nonk8sProps } = this.props;
    if (nonk8sProps) {
      const url = this.props.nonk8sProps.deleteServiceURL;
      this.handlePromise(coFetchJSON.delete(url)).then(() => {
        this.props.close();
      });
    } else {
      //https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/
      const propagationPolicy = this.state.isChecked ? kind.propagationPolicy : 'Orphan';
      const json = propagationPolicy ? { kind: 'DeleteOptions', apiVersion: 'v1', propagationPolicy } : null;

      this.handlePromise(k8sKill(kind, resource, {}, json)).then(() => {
        this.props.close();

        // If we are currently on the deleted resource's page, redirect to the resource list page
        const re = new RegExp(`/${resource.metadata.name}(/|$)`);
        if (re.test(window.location.pathname)) {
          const listPath = this.props.redirectTo ? this.props.redirectTo : resourceListPathFromModel(kind, _.get(resource, 'metadata.namespace'));
          history.push(listPath);
        }
      });
    }
  }

  _onChecked() {
    this.checked = !this.checked;
  }
  render() {
    const { kind, resource, message, t, nonk8sProps } = this.props;
    const resourceStringKey = nonk8sProps ? nonk8sProps.stringKey : kind.i18nInfo?.label ?? kind.label;
    const ResourceName = () => <strong className="co-break-word">{nonk8sProps ? nonk8sProps.name : resource.metadata.name}</strong>;
    const Namespace = () => <strong>{nonk8sProps ? nonk8sProps.namespace : resource.metadata.namespace}</strong>;
    return (
      <form onSubmit={this._submit} name="form" className="modal-content ">
        <ModalTitle>
          <YellowExclamationTriangleIcon className="co-icon-space-r" />
          {t('COMMON:MSG_MAIN_ACTIONBUTTON_16', { 0: t(resourceStringKey) })}?
        </ModalTitle>
        <ModalBody className="modal-body">
          {message}
          <div>
            {nonk8sProps.namespace || _.has(resource.metadata, 'namespace') ? <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_6">{[<ResourceName />, <Namespace />]}</Trans> : <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_25">{[<ResourceName />]}</Trans>}
            {_.has(kind, 'propagationPolicy') && (
              <div className="checkbox">
                <label className="control-label">
                  <input type="checkbox" onChange={() => this.setState({ isChecked: !this.state.isChecked })} checked={!!this.state.isChecked} />
                  {t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_26')}
                </label>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitDanger submitText={this.props.btnText || `${t('SINGLE:MSG_PIPELINES_CREATEFORM_41')}`} cancel={this._cancel} />
      </form>
    );
  }
}

export const deleteModal = createModalLauncher(withTranslation()(DeleteModal));

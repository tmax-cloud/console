import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, RequestSizeInput, resourceObjPath, history } from '../utils';
import { k8sPatch, referenceFor } from '../../module/k8s/';
import { withTranslation, Trans } from 'react-i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

// Modal for expanding persistent volume claims
const ExpandPVCModal = withTranslation()(
  class ExpandPVCModal extends PromiseComponent {
    constructor(props) {
      super(props);

      const size = _.get(this.props.resource, 'status.capacity.storage');
      const defaultValue = size.substring(0, size.length - 2);
      const defaultUnit = size.split(defaultValue)[1];
      this.state = {
        inProgress: false,
        errorMessage: '',
        requestSizeValue: defaultValue,
        requestSizeUnit: defaultUnit,
      };
      this._handleRequestSizeInputChange = this._handleRequestSizeInputChange.bind(this);
      this._cancel = this.props.cancel.bind(this);
      this._submit = this._submit.bind(this);
    }

    _handleRequestSizeInputChange(obj) {
      this.setState({ requestSizeValue: obj.value, requestSizeUnit: obj.unit });
    }

    _submit(e) {
      e.preventDefault();
      const { requestSizeUnit, requestSizeValue } = this.state;
      const patch = [
        {
          op: 'replace',
          path: '/spec/resources/requests',
          value: { storage: `${requestSizeValue}${requestSizeUnit}` },
        },
      ];
      this.handlePromise(k8sPatch(this.props.kind, this.props.resource, patch)).then(resource => {
        this.props.close();
        // redirected to the details page for persitent volume claim
        history.push(resourceObjPath(resource, referenceFor(resource)));
      });
    }

    render() {
      const { kind, resource, t } = this.props;
      const dropdownUnits = {
        Mi: 'MiB',
        Gi: 'GiB',
        Ti: 'TiB',
      };
      const { requestSizeUnit, requestSizeValue } = this.state;

      const StrongTextComponent = () => <strong className="co-break-word">{resource.metadata.name}.</strong>;
      const buttonString = <StrongTextComponent key="buttonstring" />;
      return (
        <form onSubmit={this._submit} name="form" className="modal-content modal-content--no-inner-scroll">
          <ModalTitle>{t('COMMON:MSG_MAIN_POPUP_7', { 0: ResourceLabel(kind.label, t) })}</ModalTitle>
          <ModalBody>
            <p>
              <Trans i18nKey="COMMON:MSG_MAIN_POPUP_8">{buttonString}</Trans>
            </p>
            <label className="control-label co-required">{t('COMMON:MSG_MAIN_POPUP_9')}</label>
            <RequestSizeInput name="requestSize" required onChange={this._handleRequestSizeInputChange} defaultRequestSizeUnit={requestSizeUnit} defaultRequestSizeValue={requestSizeValue} dropdownUnits={dropdownUnits} />
          </ModalBody>
          <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('COMMON:MSG_MAIN_POPUP_10')} cancel={this._cancel} />
        </form>
      );
    }
  },
);

export const expandPVCModal = createModalLauncher(ExpandPVCModal);

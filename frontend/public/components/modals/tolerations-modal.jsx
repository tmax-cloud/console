import * as _ from 'lodash-es';
import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { Dropdown, EmptyBox, PromiseComponent } from '../utils';
import { K8sKind, k8sPatch, Toleration, TolerationOperator } from '../../module/k8s';
import { createModalLauncher, ModalBody, ModalComponentProps, ModalSubmitFooter, ModalTitle } from '../factory';
import * as hoistStatics from 'hoist-non-react-statics';
import { withTranslation } from 'react-i18next';
class TolerationsModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state.tolerations = this._getTolerationsFromResource() || [];
  }

  _getTolerationsFromResource = () => {
    const { resource } = this.props;
    return this.props.resourceKind.kind === 'Pod' ? resource.spec.tolerations : resource.spec.template.spec.tolerations;
  };

  _submit = e => {
    e.preventDefault();

    const path = this.props.resourceKind.kind === 'Pod' ? '/spec/tolerations' : '/spec/template/spec/tolerations';

    // Remove the internal `isNew` property
    const tolerations = _.map(this.state.tolerations, t => _.omit(t, 'isNew'));

    // Make sure to 'add' if the path does not already exist, otherwise the patch request will fail
    const op = _.isEmpty(this._getTolerationsFromResource()) ? 'replace' : 'add';

    const patch = [{ path, op, value: tolerations }];

    this.handlePromise(k8sPatch(this.props.resourceKind, this.props.resource, patch)).then(this.props.close);
  };

  _cancel = () => {
    this.props.close();
  };

  _change = (e, i, field) => {
    const newValue = e.target ? e.target.value : e;
    this.setState(prevState => {
      const clonedTolerations = _.cloneDeep(prevState.tolerations);
      clonedTolerations[i][field] = newValue;
      return {
        tolerations: clonedTolerations,
      };
    });
  };

  _opChange = (op, i) => {
    this.setState(prevState => {
      const clonedTolerations = _.cloneDeep(prevState.tolerations);
      clonedTolerations[i].operator = op;
      if (op === 'Exists') {
        clonedTolerations[i].value = '';
      }
      return {
        tolerations: clonedTolerations,
      };
    });
  };

  _remove = i => {
    this.setState(state => {
      const tolerations = [...state.tolerations];
      tolerations.splice(i, 1);
      return { tolerations };
    });
  };

  _newToleration() {
    return { key: '', operator: 'Exists', value: '', effect: '', isNew: true };
  }

  _addRow = () => {
    this.setState(state => ({
      tolerations: [...state.tolerations, this._newToleration()],
    }));
  };

  _isEditable = t => {
    return this.props.resourceKind.kind !== 'Pod' || t.isNew;
  };

  render() {
    const { t: tFunc } = this.props;
    const operators = {
      Exists: tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_16'),
      Equal: tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_17'),
    };
    const effects = {
      '': tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_20'),
      NoSchedule: tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_21'),
      PreferNoSchedule: tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_22'),
      NoExecute: tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_23'),
    };
    const { tolerations, errorMessage, inProgress } = this.state;
    return (
      <form onSubmit={this._submit} name="form" className="modal-content modal-content--accommodate-dropdown toleration-modal">
        <ModalTitle>{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_13')}</ModalTitle>
        <ModalBody>
          {_.isEmpty(tolerations) ? (
            <EmptyBox label="Tolerations" />
          ) : (
            <>
              <div className="row toleration-modal__heading hidden-sm hidden-xs">
                <div className="col-md-4 text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_14')}</div>
                <div className="col-md-2 text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_15')}</div>
                <div className="col-md-3 text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_18')}</div>
                <div className="col-md-2 text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_19')}</div>
                <div className="col-md-1" />
              </div>
              {_.map(tolerations, (t, i) => {
                const { key, operator, value, effect = '' } = t;
                return (
                  <div className="row toleration-modal__row" key={i}>
                    <div className="col-md-4 col-sm-5 col-xs-5 toleration-modal__field">
                      <div className="toleration-modal__heading hidden-md hidden-lg text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_14')}</div>
                      <input type="text" className="pf-c-form-control" value={key} onChange={e => this._change(e, i, 'key')} readOnly={!this._isEditable(t)} />
                    </div>
                    <div className="col-md-2 col-sm-5 col-xs-5 toleration-modal__field">
                      <div className="toleration-modal__heading hidden-md hidden-lg text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_15')}</div>
                      {this._isEditable(t) ? <Dropdown className="toleration-modal__dropdown" dropDownClassName="dropdown--full-width" items={operators} onChange={op => this._opChange(op, i)} selectedKey={operator} title={operators[operator]} /> : <input type="text" className="pf-c-form-control" value={operator} readOnly />}
                    </div>
                    <div className="clearfix visible-sm visible-xs" />
                    <div className="col-md-3 col-sm-5 col-xs-5 toleration-modal__field">
                      <div className="toleration-modal__heading hidden-md hidden-lg text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_18')}</div>
                      <input type="text" className="pf-c-form-control" value={value} onChange={e => this._change(e, i, 'value')} readOnly={!this._isEditable(t) || operator === 'Exists'} />
                    </div>
                    <div className="col-md-2 col-sm-5 col-xs-5 toleration-modal__field">
                      <div className="toleration-modal__heading hidden-md hidden-lg text-secondary text-uppercase">{tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_19')}</div>
                      {this._isEditable(t) ? <Dropdown className="toleration-modal__dropdown" dropDownClassName="dropdown--full-width" items={effects} onChange={e => this._change(e, i, 'effect')} selectedKey={effect} title={effects[effect]} /> : <input type="text" className="pf-c-form-control" value={effects[effect]} readOnly />}
                    </div>
                    <div className="col-md-1 col-sm-2 col-xs-2">
                      {this._isEditable(t) && (
                        <Button type="button" className="toleration-modal__delete-icon" onClick={() => this._remove(i)} aria-label="Delete" variant="plain">
                          <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <Button className="pf-m-link--align-left" onClick={this._addRow} type="button" variant="link">
            <PlusCircleIcon data-test-id="pairs-list__add-icon" className="co-icon-space-r" />
            {tFunc('COMMON:MSG_MAIN_POPUP_DESCRIPTION_24')}
          </Button>
        </ModalBody>
        <ModalSubmitFooter errorMessage={errorMessage} inProgress={inProgress} submitText={tFunc('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancel={this._cancel} />
      </form>
    );
  }
}
export const tolerationsModal = createModalLauncher(withTranslation()(TolerationsModal));

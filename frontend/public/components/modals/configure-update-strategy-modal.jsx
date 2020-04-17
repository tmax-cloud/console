import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Tooltip } from '../utils/tooltip';

import { k8sPatch } from '../../module/k8s';
import { DeploymentModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, pluralize } from '../utils';
import { RadioInput } from '../radio';

const getNumberOrPercent = value => {
  if (typeof value === 'undefined') {
    return null;
  }
  if (typeof value === 'string' && value.indexOf('%') > -1) {
    return value;
  }

  return _.toInteger(value);
};

class ConfigureUpdateStrategyModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.deployment = _.cloneDeep(props.deployment);
    this._onTypeChange = this._onTypeChange.bind(this);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);

    this.state = Object.assign(
      {
        strategyType: _.get(this.deployment.spec, 'strategy.type'),
      },
      this.state,
    );
  }

  _onTypeChange(event) {
    this.setState({ strategyType: event.target.value });
  }

  _submit(event) {
    event.preventDefault();
    const type = this.state.strategyType;

    const patch = { path: '/spec/strategy/rollingUpdate' };
    if (type === 'RollingUpdate') {
      patch.value = {
        maxUnavailable: getNumberOrPercent(event.target.elements['input-max-unavailable'].value || '25%'),
        maxSurge: getNumberOrPercent(event.target.elements['input-max-surge'].value || '25%'),
      };
      patch.op = 'add';
    } else {
      patch.op = 'remove';
    }

    this.handlePromise(k8sPatch(DeploymentModel, this.deployment, [patch, { path: '/spec/strategy/type', value: type, op: 'replace' }])).then(this.props.close, () => {});
  }

  render() {
    const maxUnavailable = _.get(this.deployment.spec, 'strategy.rollingUpdate.maxUnavailable', '');
    const maxSurge = _.get(this.deployment.spec, 'strategy.rollingUpdate.maxSurge', '');
    const { t } = this.props;

    return (
      <form onSubmit={this._submit} name="form">
        <ModalTitle>{t('ADDITIONAL:EDIT', { something: t('CONTENT:UPDATESTRATEGY') })}</ModalTitle>
        <ModalBody>
          <div className="co-m-form-row">
            <p>{t('STRING:EDIT-UPDATESTRATEGY-MODAL_0')}</p>
          </div>

          <div className="row co-m-form-row">
            <div className="col-sm-12">
              <RadioInput onChange={this._onTypeChange} value="RollingUpdate" checked={this.state.strategyType === 'RollingUpdate'} title={t('CONTENT:ROLLINGUUPDATE')} subTitle={t('CONTENT:(DEFAULT)')} autoFocus={this.state.strategyType === 'RollingUpdate'}>
                <div className="co-m-radio-desc">
                  <p className="text-muted"> {t('STRING:EDIT-UPDATESTRATEGY-MODAL_2')}</p>

                  <div className="row co-m-form-row">
                    <div className="col-sm-3">
                      <label htmlFor="input-max-unavailable" className="control-label">
                        {t('CONTENT:MAXUNAVAILABLE')}
                      </label>
                    </div>
                    <div className="co-m-form-col col-sm-9">
                      <div className="form-inline">
                        <div className="input-group">
                          <input disabled={this.state.strategyType !== 'RollingUpdate'} placeholder="25%" size="5" type="text" className="form-control" id="input-max-unavailable" defaultValue={maxUnavailable} />
                          <span className="input-group-addon">
                            <Tooltip content={t('STRING:EDIT-UPDATESTRATEGY-MODAL_1')}>of {pluralize(this.deployment.spec.replicas, 'pod')}</Tooltip>
                          </span>
                        </div>
                      </div>
                      <p className="help-block text-muted">{t('STRING:EDIT-UPDATESTRATEGY-MODAL_3')}</p>
                    </div>
                  </div>

                  <div className="row co-m-form-row">
                    <div className="col-sm-3">
                      <label htmlFor="input-max-surge" className="control-label">
                        {t('CONTENT:MAXSURGE')}
                      </label>
                    </div>
                    <div className="co-m-form-col col-sm-9">
                      <div className="form-inline">
                        <div className="input-group">
                          <input disabled={this.state.strategyType !== 'RollingUpdate'} placeholder="25%" size="5" type="text" className="form-control" id="input-max-surge" defaultValue={maxSurge} />
                          <span className="input-group-addon">
                            <Tooltip content={t('STRING:EDIT-UPDATESTRATEGY-MODAL_1')}>greater than {pluralize(this.deployment.spec.replicas, 'pod')}</Tooltip>
                          </span>
                        </div>
                      </div>
                      <p className="help-block text-muted">{t('STRING:EDIT-UPDATESTRATEGY-MODAL_3')}</p>
                    </div>
                  </div>
                </div>
              </RadioInput>
            </div>

            <div className="col-sm-12">
              <RadioInput onChange={this._onTypeChange} value="Recreate" checked={this.state.strategyType === 'Recreate'} title={t('CONTENT:RECREATE')} desc={t('STRING:EDIT-UPDATESTRATEGY-MODAL_4')} autoFocus={this.state.strategyType === 'Recreate'} />
            </div>
          </div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('ADDITIONAL:SAVE', { something: t('CONTENT:STRATEGY') })} cancel={this._cancel} />
      </form>
    );
  }
}

ConfigureUpdateStrategyModal.propTypes = {
  deployment: PropTypes.object,
};

export const configureUpdateStrategyModal = createModalLauncher(ConfigureUpdateStrategyModal);

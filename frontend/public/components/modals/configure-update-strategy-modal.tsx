import * as _ from 'lodash-es';
import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';

import { k8sPatch, Patch, DeploymentUpdateStrategy, K8sResourceKind } from '../../module/k8s';
import { DeploymentModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { pluralize, withHandlePromise } from '../utils';
import { RadioInput } from '../radio';
import { useTranslation } from 'react-i18next';

export const UPDATE_STRATEGY_DESCRIPTION = 'How should the pods be replaced when a new revision is created?';

export const getNumberOrPercent = value => {
  if (typeof value === 'undefined') {
    return null;
  }
  if (typeof value === 'string' && value.indexOf('%') > -1) {
    return value;
  }

  return _.toInteger(value);
};

export const ConfigureUpdateStrategy: React.FC<ConfigureUpdateStrategyProps> = props => {
  const { t } = useTranslation();
  const { showDescription = true } = props;
  return (
    <>
      {showDescription && (
        <div className="co-m-form-row">
          <p>{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_2')}</p>
        </div>
      )}
      <div className="row co-m-form-row">
        <div className="col-sm-12">
          <RadioInput
            name={`${props.uid || 'update-strategy'}-type`}
            onChange={e => {
              props.onChangeStrategyType(e.target.value);
            }}
            value="RollingUpdate"
            checked={props.strategyType === 'RollingUpdate'}
            title={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_3')}
            autoFocus={props.strategyType === 'RollingUpdate'}
          >
            <div className="co-m-radio-desc">
              <p className="text-muted">{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_4')}</p>

              <div className="row co-m-form-row">
                <div className="col-sm-3">
                  <label htmlFor="input-max-unavailable" className="control-label">
                    {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_5')}
                  </label>
                </div>
                <div className="co-m-form-col col-sm-9">
                  <div className="form-inline">
                    <div className="pf-c-input-group">
                      <input disabled={props.strategyType !== 'RollingUpdate'} placeholder="25%" size={5} type="text" className="pf-c-form-control" id="input-max-unavailable" value={props.maxUnavailable} onChange={e => props.onChangeMaxUnavailable(e.target.value)} aria-describedby="input-max-unavailable-help" />
                      {props.replicas && (
                        <span className="pf-c-input-group__text">
                          <Tooltip content={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_9')}>
                            <span>of {pluralize(props.replicas, 'pod')}</span>
                          </Tooltip>
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="help-block text-muted" id="input-max-unavailable-help">
                    {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_6')}
                  </p>
                </div>
              </div>

              <div className="row co-m-form-row">
                <div className="col-sm-3">
                  <label htmlFor="input-max-surge" className="control-label">
                    {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_7')}
                  </label>
                </div>
                <div className="co-m-form-col col-sm-9">
                  <div className="form-inline">
                    <div className="pf-c-input-group">
                      <input disabled={props.strategyType !== 'RollingUpdate'} placeholder="25%" size={5} type="text" className="pf-c-form-control" id="input-max-surge" value={props.maxSurge} onChange={e => props.onChangeMaxSurge(e.target.value)} aria-describedby="input-max-surge-help" />
                      <span className="pf-c-input-group__text">
                        <Tooltip content={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_9')}>
                          <span>{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_8', { 0: props.replicas })}</span>
                        </Tooltip>
                      </span>
                    </div>
                  </div>
                  <p className="help-block text-muted" id="input-max-surge-help">
                    {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_10')}
                  </p>
                </div>
              </div>
            </div>
          </RadioInput>
        </div>

        <div className="col-sm-12">
          <RadioInput
            name={`${props.uid || 'update-strategy'}-type`}
            onChange={e => {
              props.onChangeStrategyType(e.target.value);
            }}
            value="Recreate"
            checked={props.strategyType === 'Recreate'}
            title={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_11')}
            desc={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_12')}
            autoFocus={props.strategyType === 'Recreate'}
          />
        </div>
      </div>
    </>
  );
};

export const ConfigureUpdateStrategyModal = withHandlePromise((props: ConfigureUpdateStrategyModalProps) => {
  const [strategyType, setStrategyType] = React.useState(_.get(props.deployment.spec, 'strategy.type'));
  const [maxUnavailable, setMaxUnavailable] = React.useState(_.get(props.deployment.spec, 'strategy.rollingUpdate.maxUnavailable', '25%'));
  const [maxSurge, setMaxSurge] = React.useState(_.get(props.deployment.spec, 'strategy.rollingUpdate.maxSurge', '25%'));
  const { t } = useTranslation();
  const submit = event => {
    event.preventDefault();

    const patch: Patch = { path: '/spec/strategy/rollingUpdate', op: 'remove' };
    if (strategyType === 'RollingUpdate') {
      patch.value = {
        maxUnavailable: getNumberOrPercent(maxUnavailable || '25%'),
        maxSurge: getNumberOrPercent(maxSurge || '25%'),
      };
      patch.op = 'add';
    }

    props.handlePromise(k8sPatch(DeploymentModel, props.deployment, [patch, { path: '/spec/strategy/type', value: strategyType, op: 'replace' }])).then(props.close, () => {});
  };

  return (
    <form onSubmit={submit} name="form" className="modal-content">
      <ModalTitle>{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITUPDATESTRATEGY_1')}</ModalTitle>
      <ModalBody>
        <ConfigureUpdateStrategy strategyType={strategyType} maxUnavailable={maxUnavailable} maxSurge={maxSurge} onChangeStrategyType={setStrategyType} onChangeMaxUnavailable={setMaxUnavailable} onChangeMaxSurge={setMaxSurge} />
      </ModalBody>
      <ModalSubmitFooter errorMessage={props.errorMessage} inProgress={props.inProgress} submitText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancel={props.cancel} />
    </form>
  );
});

export const configureUpdateStrategyModal = createModalLauncher(ConfigureUpdateStrategyModal);

export type ConfigureUpdateStrategyProps = {
  showDescription?: boolean;
  strategyType: DeploymentUpdateStrategy['type'];
  maxUnavailable: number | string;
  maxSurge: number | string;
  onChangeStrategyType: (strategy: DeploymentUpdateStrategy['type']) => void;
  onChangeMaxUnavailable: (maxUnavailable: number | string) => void;
  onChangeMaxSurge: (maxSurge: number | string) => void;
  replicas?: number;
  uid?: string;
};

export type ConfigureUpdateStrategyModalProps = {
  deployment: K8sResourceKind;
  handlePromise: <T>(promise: Promise<T>) => Promise<T>;
  inProgress: boolean;
  errorMessage: string;
  cancel?: () => void;
  close?: () => void;
};

ConfigureUpdateStrategy.displayName = 'ConfigureUpdateStrategy';

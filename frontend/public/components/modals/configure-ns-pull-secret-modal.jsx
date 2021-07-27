import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Base64 } from 'js-base64';
import { Alert } from '@patternfly/react-core';

import { CONST } from '@console/shared';
import { k8sPatch, k8sPatchByName, k8sCreate } from '../../module/k8s';
import { SecretModel, ServiceAccountModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon } from '../utils';
import { withTranslation } from 'react-i18next';

const parseExisitingPullSecret = pullSecret => {
  let invalidData = false;
  const invalidJson = false;
  let username, email, password, address;

  try {
    const existingData = pullSecret && Base64.decode(pullSecret.data[CONST.PULL_SECRET_DATA]);

    if (existingData) {
      const data = JSON.parse(existingData);

      if (!data || !data.auths) {
        throw 'Invalid data';
      }

      const keys = Object.keys(data.auths);

      if (keys.length > 1) {
        // multiple auths are stored in this one secret.
        // we'll display the first secret, but upon saving, the
        // others will get erased
        invalidData = true;
      } else if (keys.length < 1) {
        throw 'Invalid data';
      }
      address = keys[0];
      email = data.auths[address].email;
      const auth = Base64.decode(data.auths[address].auth);
      const authParts = auth.split(':');

      if (authParts.length === 1) {
        username = '';
        password = authParts[0];
      } else if (authParts.length === 2) {
        username = authParts[0];
        password = authParts[1];
      } else {
        throw 'Invalid data';
      }
    }
  } catch (error) {
    invalidData = true;
  }

  return { username, password, email, address, invalidData, invalidJson };
};

const generateSecretData = formData => {
  const config = {
    auths: {},
  };

  const authParts = [];

  if (_.trim(formData.username).length >= 1) {
    authParts.push(formData.username);
  }
  authParts.push(formData.password);

  config.auths[formData.address] = {
    auth: Base64.encode(authParts.join(':')),
    email: formData.email,
  };

  return Base64.encode(JSON.stringify(config));
};

class ConfigureNamespacePullSecret extends PromiseComponent {
  constructor(props) {
    super(props);

    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);

    this._onMethodChange = this._onMethodChange.bind(this);
    this._onFileChange = this._onFileChange.bind(this);

    this.state = Object.assign(this.state, {
      method: 'form',
      fileData: null,
      invalidJson: false,
    });
  }

  _onMethodChange(event) {
    this.setState({ method: event.target.value });
  }

  _onFileChange(event) {
    this.setState({ invalidJson: false, fileData: null });

    const file = event.target.files[0];
    if (!file || file.type !== 'application/json') {
      this.setState({ invalidJson: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const input = e.target.result;
      try {
        JSON.parse(input);
      } catch (error) {
        this.setState({ invalidJson: true });
        return;
      }
      this.setState({ fileData: input });
    };
    reader.readAsText(file, 'UTF-8');
  }

  _submit(event) {
    event.preventDefault();
    const { namespace, pullSecret } = this.props;

    let promise;
    let secretData;

    if (this.state.method === 'upload') {
      secretData = Base64.encode(this.state.fileData);
    } else {
      const elements = event.target.elements;
      const formData = {
        username: elements['namespace-pull-secret-username'].value,
        password: elements['namespace-pull-secret-password'].value,
        email: elements['namespace-pull-secret-email'].value || '',
        address: elements['namespace-pull-secret-address'].value,
      };
      secretData = generateSecretData(formData);
    }

    if (pullSecret) {
      const patch = [
        {
          op: 'replace',
          path: `/data/${CONST.PULL_SECRET_DATA}`,
          value: secretData,
        },
      ];
      promise = k8sPatch(SecretModel, pullSecret, patch);
    } else {
      const data = {};
      const pullSecretName = event.target.elements['namespace-pull-secret-name'].value;
      data[CONST.PULL_SECRET_DATA] = secretData;

      const secret = {
        metadata: {
          name: pullSecretName,
          namespace: namespace.metadata.name,
        },
        data,
        type: CONST.PULL_SECRET_TYPE,
      };
      const defaultServiceAccountPatch = [
        {
          op: 'add',
          path: '/imagePullSecrets/-',
          value: { name: pullSecretName },
        },
      ];
      promise = k8sCreate(SecretModel, secret).then(() => k8sPatchByName(ServiceAccountModel, 'default', namespace.metadata.name, defaultServiceAccountPatch));
    }

    this.handlePromise(promise).then(this.props.close);
  }

  render() {
    const { namespace, pullSecret, t } = this.props;

    const existingData = parseExisitingPullSecret(pullSecret);

    return (
      <form onSubmit={this._submit} name="form" className="modal-content">
        <ModalTitle>{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_1')}</ModalTitle>
        <ModalBody>
          <p>{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_2')}</p>

          {existingData.invalidData && (
            <Alert isInline className="co-alert" variant="danger" title="Overwriting default pull secret">
              {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_16')}
            </Alert>
          )}

          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label>{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_3')}</label>
            </div>
            <div className="col-xs-9">
              <ResourceIcon kind="Namespace" /> &nbsp;{namespace.metadata.name}
            </div>
          </div>

          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label htmlFor="namespace-pull-secret-name">{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_4')}</label>
            </div>
            {pullSecret ? (
              <div className="col-xs-9">
                <ResourceIcon kind="Secret" />
                &nbsp;{_.get(pullSecret, 'metadata.name')}
              </div>
            ) : (
              <div className="col-xs-9">
                <input type="text" className="pf-c-form-control" id="namespace-pull-secret-name" aria-describedby="namespace-pull-secret-name-help" required />
                <p className="help-block text-muted" id="namespace-pull-secret-name-help">
                  {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_5')}
                </p>
              </div>
            )}
          </div>

          <div className="row co-m-form-row form-group">
            <div className="col-xs-3">
              <label>{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_6')}</label>
            </div>
            <div className="col-xs-9">
              <div className="radio">
                <label className="control-label">
                  <input type="radio" id="namespace-pull-secret-method--form" checked={this.state.method === 'form'} onChange={this._onMethodChange} value="form" />
                  {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_7')}
                </label>
              </div>
              <div className="radio">
                <label className="control-label">
                  <input type="radio" checked={this.state.method === 'upload'} onChange={this._onMethodChange} id="namespace-pull-secret-method--upload" value="upload" />
                  {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_8')}
                </label>
              </div>
            </div>
          </div>

          {this.state.method === 'form' && (
            <div>
              <div className="row co-m-form-row">
                <div className="col-xs-3">
                  <label htmlFor="namespace-pull-secret-address">{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_9')}</label>
                </div>
                <div className="col-xs-9">
                  <input type="text" className="pf-c-form-control" id="namespace-pull-secret-address" defaultValue={existingData.address} placeholder="quay.io" required />
                </div>
              </div>
              <div className="row co-m-form-row">
                <div className="col-xs-3">
                  <label htmlFor="namespace-pull-secret-email">{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_10')}</label>
                </div>
                <div className="col-xs-9">
                  <input type="email" className="pf-c-form-control" defaultValue={existingData.email} id="namespace-pull-secret-email" aria-describedby="namespace-pull-secret-email-help" />
                  <p className="help-block text-muted" id="namespace-pull-secret-email-help">
                    {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_11')}
                  </p>
                </div>
              </div>
              <div className="row co-m-form-row">
                <div className="col-xs-3">
                  <label htmlFor="namespace-pull-secret-username">{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_12')}</label>
                </div>
                <div className="col-xs-9">
                  <input type="text" defaultValue={existingData.username} className="pf-c-form-control" id="namespace-pull-secret-username" required />
                </div>
              </div>
              <div className="row co-m-form-row">
                <div className="col-xs-3">
                  <label htmlFor="namespace-pull-secret-password">{t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_13')}</label>
                </div>
                <div className="col-xs-9">
                  <input type="password" defaultValue={existingData.password} className="pf-c-form-control" id="namespace-pull-secret-password" required />
                </div>
              </div>
            </div>
          )}

          {this.state.method === 'upload' && (
            <div>
              <div className="row co-m-form-row">
                <div className="col-xs-3">
                  <label htmlFor="namespace-pull-secret-file">File Upload</label>
                </div>
                <div className="col-xs-9">
                  <input type="file" id="namespace-pull-secret-file" onChange={this._onFileChange} aria-describedby="namespace-pull-secret-file-help" />
                  <p className="help-block etext-muted" id="namespace-pull-secret-file-help">
                    {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_15')}
                  </p>
                </div>
              </div>
              {this.state.invalidJson ||
                (existingData.invalidJson && (
                  <div className="row co-m-form-row">
                    <div className="col-xs-9 col-sm-offset-3">
                      <Alert isInline className="co-alert" variant="danger" title="Invalid JSON">
                        {t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_17')}
                      </Alert>
                    </div>
                  </div>
                ))}
              {this.state.fileData && (
                <div className="row co-m-form-row">
                  <div className="col-xs-9 col-sm-offset-3">
                    <pre className="co-pre-wrap">{this.state.fileData}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_14')} cancel={this._cancel} />
      </form>
    );
  }
}

ConfigureNamespacePullSecret.propTypes = {
  namespace: PropTypes.object.isRequired,
  pullSecret: PropTypes.object,
};

export const configureNamespacePullSecretModal = createModalLauncher(withTranslation()(ConfigureNamespacePullSecret));

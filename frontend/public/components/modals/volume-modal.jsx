import * as _ from 'lodash-es';
import * as React from 'react';

import { k8sPatch, referenceForModel } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../utils';
import { FirstSection, SecondSection, PodTemplate, VolumeclaimTemplate } from '../utils/form';
import SingleSelect from '../utils/select';
import { ValueEditor } from '../utils/value-editor';
import { useTranslation, Trans } from 'react-i18next';

class BaseVolumeModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: props.volume?.[0] || '',
      type: props.volume?.[1] || 'emptydir',
      configMap: props.volume?.[2] || '',
      secret: props.volume?.[3] || '',
      inProgress: false,
      errorMessage: '',
    };
    this.onNameChange = this.onNameChange.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onConfigMapChange = this.onConfigMapChange.bind(this);
    this.onSecretChange = this.onSecretChange.bind(this);
    this._submit = this._submit.bind(this);
    this._cancel = props.cancel.bind(this);
  }

  _submit(e) {
    e.preventDefault();
    const { kind, path, resource, updateParentData, isNew, index } = this.props;
    updateParentData({
      name: this.state.name,
      type: this.state.type,
      secret: this.state.secret,
      configmap: this.state.configMap,
      isNew: isNew,
      index: index,
    });
    this.props.close();
  }
  onNameChange = name => {
    this.setState({
      name: name.value,
    });
  };

  onTypeChange = type => {
    this.setState({
      type: type.value,
    });
  };

  onConfigMapChange = configMap => {
    this.setState({
      configMap: configMap.target.value,
    });
  };

  onSecretChange = secret => {
    this.setState({
      secret: secret.target.value,
    });
  };

  render() {
    const { kind, parameter, pair, onResource, title, t } = this.props;
    const typeOptions = [
      { value: 'emptyDir', label: t('CONTENT:EMPTYDIR') },
      { value: 'ConfigMap', label: t('CONTENT:CONFIGMAP') },
      { value: 'Secret', label: t('CONTENT:SECRET') },
    ];

    return (
      <form style={{ width: '500px' }} onSubmit={this._submit} name="form">
        <ModalTitle>{title}</ModalTitle>
        <ModalBody>
          <SecondSection isModal={true} label={t('CONTENT:NAME')} isRequired={true}>
            <input
              className="form-control form-group"
              type="text"
              id="resource-name"
              value={this.state.name || parameter?.[0]}
              onChange={e => {
                this.onNameChange(e.target);
              }}
              required
            />
          </SecondSection>
          <SecondSection isModal={true} label={t('CONTENT:TYPE')} isRequired={true}>
            <SingleSelect style={{ margin: '15px' }} options={typeOptions} name="Type" placeholder={t('VALIDATION:EMPTY-SELECT', { something: t('CONTENT:TYPE') })} value={this.state.type} onChange={this.onTypeChange} />
          </SecondSection>
          {this.state.type === 'ConfigMap' && (
            <SecondSection isModal={true} label={t('CONTENT:CONFIGMAP')} isRequired={false}>
              <input className="form-control form-group" type="text" id="resource-configmap" value={this.state.default} onChange={this.onConfigMapChange} />
            </SecondSection>
          )}
          {this.state.type === 'Secret' && (
            <SecondSection isModal={true} label={t('CONTENT:SECRET')} isRequired={false}>
              <input className="form-control form-group" type="text" id="resource-secret" value={this.state.default} onChange={this.onSecretChange} />
            </SecondSection>
          )}
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={this.props.isNew ? t('CONTENT:ADD') : t('CONTENT:EDIT')} cancel={this._cancel} />
      </form>
    );
  }
}

export const VolumeModal = createModalLauncher(props => {
  const { t } = useTranslation();
  return <BaseVolumeModal {...props} t={t} onChange={props.onResource} />;
});

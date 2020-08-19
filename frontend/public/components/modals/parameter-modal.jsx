import * as _ from 'lodash-es';
import * as React from 'react';

import { k8sPatch, referenceForModel } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../utils';
import { FirstSection, SecondSection, PodTemplate, VolumeclaimTemplate } from '../utils/form';
import SingleSelect from '../utils/select';
import { ValueEditor } from '../utils/value-editor';
import { useTranslation, Trans } from 'react-i18next';

class BaseParameterModal extends PromiseComponent {
  constructor(props) {
    super(props);
    const inputError = {
      name: null,
    };
    this.state = {
      name: props.parameter?.[0] || '',
      description: props.parameter?.[1] || '',
      type: props.parameter?.[2] || 'String',
      default: props.parameter?.[3] || '',
      defaultArray: props.parameter?.[3] || [['']],
      inputError: inputError,
      inProgress: false,
      errorMessage: '',
    };
    this._updateDefaults = this._updateDefaults.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onDefaultChange = this.onDefaultChange.bind(this);
    this._submit = this._submit.bind(this);
    this._cancel = props.cancel.bind(this);
  }

  _submit(e) {
    e.preventDefault();
    const { kind, path, resource, updateParentData, isNew, index, t } = this.props;

    if (!this.state.name) {
      this.setState({ inputError: { name: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:NAME`) }) } });
      return;
    } else {
      this.setState({ inputError: { name: null } });
    }
    updateParentData({
      name: this.state.name,
      type: this.state.type,
      description: this.state.description,
      default: this.state.type === 'String' ? this.state.default : this.state.defaultArray,
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

  onDescriptionChange = description => {
    this.setState({
      description: description.target.value,
    });
  };

  onTypeChange = type => {
    this.setState({
      type: type.value,
    });
  };

  onDefaultChange = defaultValue => {
    this.setState({
      default: defaultValue.target.value,
    });
  };

  _updateDefaults = defaultValues => {
    this.setState({
      defaultArray: defaultValues.values,
    });
  };

  render() {
    const { kind, parameter, pair, onResource, title, t } = this.props;
    const typeOptions = [
      { value: 'String', label: t('CONTENT:STRING') },
      { value: 'Array', label: t('CONTENT:ARRAY') },
    ];

    return (
      <form style={{ width: '500px' }} onSubmit={this._submit} name="form">
        <ModalTitle>{title}</ModalTitle>
        <ModalBody>
          <SecondSection isModal={true} label={t('CONTENT:NAME')} isRequired={true}>
            {/* <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.task.metadata.name} id="task-name" required /> */}
            <input
              className="form-control form-group"
              type="text"
              id="resource-name"
              value={this.state.name}
              onChange={e => {
                this.onNameChange(e.target);
              }}
            />
            {this.state.inputError.name && <p className="error_text">{this.state.inputError.name}</p>}
          </SecondSection>
          <SecondSection isModal={true} label={t('CONTENT:DESCRIPTION')} isRequired={false}>
            <input className="form-control form-group" type="text" id="resource-description" value={this.state.description} onChange={this.onDescriptionChange} />
          </SecondSection>
          <SecondSection isModal={true} label={t('CONTENT:TYPE')} isRequired={true}>
            <SingleSelect style={{ margin: '15px' }} options={typeOptions} name="Type" placeholder="Select Type" value={this.state.type} onChange={this.onTypeChange} />
          </SecondSection>

          <SecondSection isModal={true} label={t('CONTENT:DEFAULTVALUE')} isRequired={false}>
            {this.state.type === 'String' ? <input className="form-control form-group" type="text" id="resource-default" value={this.state.default} onChange={this.onDefaultChange} /> : <ValueEditor desc="" title="false" valueString="DefaultValue" t={t} values={this.state.defaultArray} updateParentData={this._updateDefaults} isModal={true} />}
            <p>태스크 런 또는 파이프라인 생성 시 파라미터를 입력하지 않을 경우 기본 값으로 설정됩니다.</p>
          </SecondSection>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={this.props.isNew ? t('CONTENT:ADD') : t('CONTENT:EDIT')} cancel={this._cancel} />
      </form>
    );
  }
}

export const ParameterModal = createModalLauncher(props => {
  const { t } = useTranslation();
  return <BaseParameterModal {...props} t={t} onChange={props.onResource} />;
});

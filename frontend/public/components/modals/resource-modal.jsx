import * as _ from 'lodash-es';
import * as React from 'react';

import { k8sPatch, referenceForModel } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../utils';
import { FirstSection, SecondSection, PodTemplate, VolumeclaimTemplate } from '../utils/form';
import SingleSelect from '../utils/select';
import { useTranslation, Trans } from 'react-i18next';

class BaseResourceModal extends PromiseComponent {
  constructor(props) {
    super(props);

    const inputError = {
      name: null,
    };
    this.state = {
      name: props.resource?.[0] || '',
      type: props.resource?.[1] || 'git',
      path: props.resource?.[2] || '',
      optional: props.resource?.[3] || false,
      inputError: inputError,
      inProgress: false,
      errorMessage: '',
    };
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
      path: this.state.path,
      optional: this.state.optional,
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

  onPathChange = path => {
    this.setState({
      path: path.target.value,
    });
  };

  onOptionalChange = optional => {
    this.setState({
      optional: optional.currentTarget.checked,
    });
  };

  render() {
    const { kind, resource, pair, onResource, title, t } = this.props;
    const typeOptions = [
      { value: 'git', label: 'Git' },
      { value: 'image', label: t('CONTENT:IMAGE') },
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
          <SecondSection isModal={true} label={t('CONTENT:TYPE')} isRequired={true}>
            <SingleSelect options={typeOptions} name="Type" placeholder={t('VALIDATION:EMPTY-SELECT', { something: t('CONTENT:TYPE') })} value={this.state.type} onChange={this.onTypeChange} />
          </SecondSection>
          <SecondSection isModal={true} label={t('CONTENT:RESOURCEPATH')} isRequired={false}>
            <input className="form-control form-group" type="text" id="resourcestoragepath-name" value={this.state.path} onChange={this.onPathChange} />
          </SecondSection>
          <SecondSection isModal={true} label={''} isRequired={false}>
            <label>
              <input className="" type="checkbox" id="cbx-select" checked={this.state.optional} onChange={this.onOptionalChange} />이 리소스를 선택 항목으로 제공합니다.
            </label>
            <p>선택 항목으로 제공할 경우, 태스크 런 또는 파이프라인 메뉴에서 파이프라인 리소스를 필요에 따라 할당할 수 있습니다. </p>
          </SecondSection>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={this.props.isNew ? t('CONTENT:ADD') : t('CONTENT:EDIT')} cancel={this._cancel} />
      </form>
    );
  }
}

export const ResourceModal = createModalLauncher(props => {
  const { t } = useTranslation();
  return <BaseResourceModal {...props} t={t} onChange={props.onResource} />;
});

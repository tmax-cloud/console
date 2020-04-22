import * as _ from 'lodash-es';
import * as React from 'react';

import { k8sPatch, referenceForModel } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../utils';
import { useTranslation, Trans } from 'react-i18next';

const LABELS_PATH = '/metadata/labels';
const TEMPLATE_SELECTOR_PATH = '/spec/template/metadata/labels';

class BaseLabelsModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = props.cancel.bind(this);
    const labels = SelectorInput.arrayify(_.get(props.resource, props.path.split('/').slice(1)));
    this.state = Object.assign(this.state, {
      labels,
    });
    this.createPath = !labels.length;
  }

  _submit(e) {
    e.preventDefault();

    const { kind, path, resource, isPodSelector } = this.props;

    const patch = [
      {
        op: this.createPath ? 'add' : 'replace',
        path,
        value: SelectorInput.objectify(this.state.labels),
      },
    ];

    // https://kubernetes.io/docs/user-guide/deployments/#selector
    //   .spec.selector must match .spec.template.metadata.labels, or it will be rejected by the API
    const updateTemplate = isPodSelector && !_.isEmpty(_.get(resource, TEMPLATE_SELECTOR_PATH.split('/').slice(1)));

    if (updateTemplate) {
      patch.push({
        path: TEMPLATE_SELECTOR_PATH,
        op: 'replace',
        value: SelectorInput.objectify(this.state.labels),
      });
    }
    const promise = k8sPatch(kind, resource, patch);
    this.handlePromise(promise).then(this.props.close);
  }

  render() {
    const { kind, resource, description, message, labelClassName, t } = this.props;

    return (
      <form onSubmit={this._submit} name="form">
        <ModalTitle>{t('ADDITIONAL:EDIT', { something: description || t('CONTENT:LABELS') })}</ModalTitle>
        <ModalBody>
          <div className="row co-m-form-row">
            <div className="col-sm-12">{message || t('STRING:LABLE-EDIT_0')}</div>
          </div>
          <div className="row co-m-form-row">
            <div className="col-sm-12">
              <label htmlFor="tags-input" className="control-label">
                {t('ADDITIONAL:FOR', { something1: description || t('CONTENT:LABELS'), something2: resource.metadata.name })}
                {/* {_.capitalize(description) || t('CONTENT:LABELS')} for <ResourceIcon kind={kind.crd ? referenceForModel(kind) : kind.kind} /> {resource.metadata.name} */}
              </label>
              <SelectorInput onChange={labels => this.setState({ labels })} tags={this.state.labels} labelClassName={labelClassName || `co-text-${kind.id}`} autoFocus />
            </div>
          </div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('ADDITIONAL:SAVE', { something: description || t('CONTENT:LABELS') })} cancel={this._cancel} />
      </form>
    );
  }
}

export const labelsModal = createModalLauncher(props => {
  const { t } = useTranslation();
  return <BaseLabelsModal path={LABELS_PATH} {...props} t={t} />;
});

export const podSelectorModal = createModalLauncher(props => <BaseLabelsModal path={['replicationcontrolleres', 'services'].includes(props.kind.plural) ? '/spec/selector' : '/spec/selector/matchLabels'} isPodSelector={true} description={props.t('CONTENT:PODSELECTOR')} message={props.t('ADDITIONAL:PODSELECTOR-MODAL_0', { something: props.t(`RESOURCE:${props.kind.kind.toUpperCase()}`) })} labelClassName="co-text-pod" {...props} />);

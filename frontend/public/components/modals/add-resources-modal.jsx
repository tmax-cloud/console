import * as React from 'react';

import { k8sCreate, referenceFor } from '../../module/k8s';
import { NamespaceModel, ProjectRequestModel, NetworkPolicyModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { history, PromiseComponent, resourceObjPath, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import VirtualizedCheckbox from 'react-virtualized-checkbox'
import { UserList } from '../user';

const allow = 'allow';
const deny = 'deny';

const defaultDeny = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'NetworkPolicy',
  spec: {
    podSelector: null,
  },
};

class CreateNamespaceModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state.np = allow;
  }

  handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value,
    });
  }

  createNamespace() {
    const { name, labels } = this.state;
    const namespace = {
      metadata: {
        name,
        labels: SelectorInput.objectify(labels),
      },
    };
    return k8sCreate(NamespaceModel, namespace);
  }

  createProject() {
    const { name, displayName, description } = this.state;
    const project = {
      metadata: {
        name,
      },
      displayName,
      description,
    };
    return k8sCreate(ProjectRequestModel, project);
  }

  _submit(event) {
    event.preventDefault();

    let promise = this.props.createProject ? this.createProject() : this.createNamespace();
    if (this.state.np === deny) {
      promise = promise.then(ns => {
        const policy = Object.assign({}, defaultDeny, { metadata: { namespace: ns.metadata.name, name: 'default-deny' } });
        return k8sCreate(NetworkPolicyModel, policy);
      });
    }

    this.handlePromise(promise).then(obj => {
      this.props.close();
      history.push(resourceObjPath(obj, referenceFor(obj)));
    });
  }

  onLabels(labels) {
    this.setState({ labels });
  }

  render() {
    const label = this.props.createProject ? 'Project' : 'Namespace';
    const { t } = this.props;
    const items = [
      { label: "One", value: 1, checked: true },
      { label: "Two", value: 2, checked: true },
      { label: "Three", value: 3, checked: true }
      ,
      { label: "Threwee", value: 4, checked: true }
      ,
      { label: "Thrweweee", value: 5, checked: true }
      ,
      { label: "Thrweeee", value: 6, checked: true }
      ,
      { label: "Threeee", value: 7, checked: true }
      ,
      { label: "Threqweqe", value: 8, checked: true }
      ,
      { label: "Thrwesdfee", value: 9, checked: true }
      ,
      { label: "Thereree", value: 10, checked: true }

      // And so on...
    ]
    return (
      <form onSubmit={this._submit.bind(this)} name="form" style={{ width: '500px', height: '510px' }}>
        <ModalTitle>{t('CONTENT:CREATENEWNAMESPACE')}</ModalTitle>
        <div style={{
          height: '250px', boxShadow: 'rgba(0, 0, 0, 0.75) 1px 1px 5px 0px', position: 'relative', overflow: 'auto'
        }}>
          <VirtualizedCheckbox
            items={items}
            hasOkButton={false}
            hasCancelButton={false}
          />
        </div>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('ADDITIONAL:CREATE', { something: t('RESOURCE:NAMESPACE') })} cancel={this.props.cancel.bind(this)} />
      </form >
    );
  }
}

export const addResourcesModal = createModalLauncher(props => {
  const { t } = useTranslation();
  return <CreateNamespaceModal {...props} t={t} />;
});

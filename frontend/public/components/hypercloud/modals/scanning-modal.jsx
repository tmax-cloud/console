import * as _ from 'lodash-es';
import { ValidTabGuard } from 'packages/kubevirt-plugin/src/components/create-vm-wizard/tabs/valid-tab-guard';
import * as React from 'react';
import * as classNames from 'classnames';
import { history } from '@console/internal/components/utils';
import { k8sCreateUrl, k8sList, referenceForModel, kindForReference } from '../../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../../utils';
import { Section } from '../utils/section';
import { ResourceListDropdownWithDataToolbar } from '../utils/resource-list-dropdown';
import { ResourceListDropdown, RegistryListDropdown } from '../../resource-dropdown';
import { Button, Chip, ChipGroup, ChipGroupToolbarItem } from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';
import { ResourceIcon } from '../utils';
import { modelFor } from '../../../module/k8s/k8s-models';
import { NamespaceModel } from '@console/internal/models';
import { withRouter } from 'react-router-dom';
import { oidcClientIDInput } from 'integration-tests/views/oauth.view';
import { ResourceLabelPlural } from '../../../models/hypercloud/resource-plural';
import { withTranslation } from 'react-i18next';

class BaseScanningModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = props.cancel.bind(this);

    this.state = Object.assign(this.state, {
      name: '',
      dataList: [],
      namespaces: [],
      namespace: '',
      resources: [],
      resource: [],
    });
  }

  componentDidMount() {
    const { showNs } = this.props;
    showNs && this.getNamespaceList();
    const { ns } = this.props;
    this.setState({ namespace: ns });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.resource && prevState.namespace !== this.state.namespace) {
      return this.getResourceList();
    }
  }

  async getNamespaceList() {
    const { ns } = this.props;
    const list = await k8sList(NamespaceModel);
    const namespaces = list.map(item => item.metadata.name);
    const namespace = ns || namespaces[0];
    this.setState({ namespaces, namespace });
  }

  async getResourceList() {
    const { kind, ns, labelSelector } = this.props;
    const resources = await k8sList(modelFor(kind), { ns: this.state.namespace, labelSelector });
    return this.setState({ resources });
  }

  _submit(e) {
    e.preventDefault();

    let { kind, ns, modelKind, resource, labelSelector, isExtRegistry } = this.props;

    let registries;

    kind = kind || resource?.kind;

    let modelPlural = 'scans';
    if (kind === 'ExternalRegistry' || modelKind?.kind === 'ExternalRegistry') {
      isExtRegistry = true;
    }

    if (isExtRegistry) {
      modelPlural = 'ext-scans';
    }

    if (kind === 'Registry' || modelKind?.kind === 'Registry') {
      if (resource) {
        registries = [
          {
            name: resource.metadata.name,
            repositories: [
              {
                name: '*',
              },
            ],
          },
        ];
      } else {
        registries = this.state.resource.map(selectedItem => ({
          name: selectedItem,
          repositories: [
            {
              name: '*',
            },
          ],
        }));
      }
    } else if (kind === 'ExternalRegistry' || modelKind?.kind === 'ExternalRegistry') {
      if (resource) {
        registries = [
          {
            name: resource.metadata.name,
            repositories: [
              {
                name: '*',
              },
            ],
          },
        ];
      } else {
        registries = this.state.resource.map(selectedItem => ({
          name: selectedItem,
          repositories: [
            {
              name: '*',
            },
          ],
        }));
      }
    } else if (kind === 'Repository' || modelKind?.kind === 'Repository') {
      let resources = this.state.resources;
      if (resource) {
        let index;
        resources.some((cur, idx) => {
          if (cur.metadata.name === resource.metada.name) {
            index = idx;
            return true;
          }
        });
        let versions = resources[index].spec.versions.map(cur => cur.version);
        registries = [
          {
            name: resource.spec.registry,
            repositories: [
              {
                name: resource.metadata.name,
                versions: versions,
              },
            ],
          },
        ];
      } else {
        const reg = isExtRegistry ? labelSelector['ext-registry'] : labelSelector.registry;
        registries = [
          {
            name: reg,
            repositories: this.state.resource.map(selectedItem => {
              let index;
              resources.some((cur, idx) => {
                if (cur.metadata.name === selectedItem) {
                  index = idx;
                  return true;
                }
              });
              let versions = resources[index].spec.versions.map(cur => cur.version);

              return {
                name: selectedItem,
                versions: versions,
              };
            }),
          },
        ];
      }
    } else if (kind === 'Tag') {
      registries = [
        {
          name: resource.registry,
          repositories: [
            {
              name: resource.repository,
              versions: [resource.version],
            },
          ],
        },
      ];
    }

    const data = { registries };

    const opts = {
      ns: (this.state.namespace !== '' && this.state.namespace) || resource.metadata?.namespace || resource.namespace,
      plural: 'scans',
      name: this.state.name,
    };
    let model = kind ? _.cloneDeep(modelFor(kind)) : modelKind;

    model = model || { apiVersion: 'v1' };

    model.apiGroup = 'registry.tmax.io';

    model.plural = modelPlural;

    const promise = k8sCreateUrl(model, data, opts);
    this.handlePromise(promise).then(this.successSubmit);
  }

  successSubmit = response => {
    const { resource } = this.props;
    const { imageScanRequestName } = JSON.parse(response);

    const namespace = resource?.metadata?.namespace || this.state.namespace || resource?.namespace;

    this.props.close();
    history.push(`/k8s/ns/${namespace}/imagescanrequests/${imageScanRequestName}`);
  };

  onChangeName = e => {
    this.setState({ name: e.target.value });
  };

  onChangeNamespace = e => {
    this.setState({ namespace: e.target.value });
  };

  onSelectedItemChange = items => {
    const resource = [...items][0] === 'All' ? this.state.resources.map(res => res.metadata.name) : [...items].map(item => this.state.resources.find(res => res.metadata.name === item)?.metadata.name);
    this.setState({ resource: resource });
  };

  render() {
    const { kind, showNs, resource, message, modelKind, t } = this.props;
    const { selected, resources } = this.state;

    const label = ResourceLabelPlural({ kind: kind || modelKind?.kind || resource?.kind }, t);

    const name = resource?.metadata?.name || resource?.version;

    return (
      <form onSubmit={this._submit} name="form" className="modal-content">
        <ModalTitle>{t('COMMON:MSG_COMMON_ACTIONBUTTON_20')}</ModalTitle>
        <ModalBody unsetOverflow={true}>
          <div className="row co-m-form-row">
            <div className="col-sm-12">{message || ''}</div>
          </div>
          <div className="row co-m=-form-row">
            <div className="col-sm-12" style={{ marginBottom: '15px' }}>
              <Section label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')} id="name" isRequired={true}>
                <input className="pf-c-form-control" id="name" name="metadata.name" onChange={this.onChangeName} value={this.state.name} />
              </Section>
            </div>
            {showNs && (
              <div className="col-sm-12" style={{ marginBottom: '15px' }}>
                <Section label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_6')} id="namespace" isRequired={true}>
                  <select className="col-sm-12" value={this.state.namespace} onChange={this.onChangeNamespace}>
                    {this.state.namespaces.map(namespace => (
                      <option key={namespace} value={namespace}>
                        {namespace}
                      </option>
                    ))}
                  </select>
                </Section>
              </div>
            )}
            <div className="col-sm-12">
              <label className={classNames('control-label', { ['co-required']: !resource && kind !== 'Repository' })} htmlFor={label}>
                {label}
              </label>
              <div className="co-search-group">
                {resource ? (
                  <div>{name}</div>
                ) : (
                  <ResourceListDropdownWithDataToolbar
                    resourceList={resources} // 필수
                    showAll={true} // 드롭다운에 all resource 라는 항목이 생긴다.
                    resourceType={label} // title, placeholder, all resources, chip group 에 적용되는 문구 (title, placeholder는 직접 지정하는 것의 우선순위가 더 높음)
                    autocompletePlaceholder={t('SINGLE:MSG_CONTAINERREGISTRIES_CREATEIMAGESCANREQUESTPOPUP_5')} // 검색란 placeholder
                    onSelectedItemChange={this.onSelectedItemChange} // 선택된 아이템 리스트 변동될 때마다 호출되는 함수
                  />
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancel={this._cancel} />
      </form>
    );
  }
}

export const scanningModal = createModalLauncher(withTranslation()(BaseScanningModal));

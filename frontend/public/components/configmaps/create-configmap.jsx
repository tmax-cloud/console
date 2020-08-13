/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
// import { NsDropdown } from '../RBAC/bindings';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { KeyValueEditor } from '../utils/key-value-editor';

const Section = ({ label, children, isRequired }) => {
  return (
    <div className={'row form-group ' + (isRequired ? 'required' : '')}>
      <div className="col-xs-2 control-label">
        <strong>{label}</strong>
      </div>
      <div className="col-xs-10">{children}</div>
    </div>
  );
};

class ConfigMapFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingConfigMap = _.pick(props.obj, ['metadata', 'type']);
    const configMap = _.defaultsDeep({}, props.fixed, existingConfigMap, {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: '',
        namespace: '',
      },
    });
    const inputError = {
      name: null,
      namespace: null,
    };
    this.state = {
      configMapTypeAbstraction: this.props.configMapTypeAbstraction,
      configMap: configMap,
      inProgress: false,
      type: 'form',
      data: [['', '']],
      inputError: inputError
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this._updateData = this._updateData.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChanged(event) {
    let configMap = { ...this.state.configMap };
    configMap.metadata.name = String(event.target.value);
    this.setState({ configMap });
  }
  onNamespaceChanged(namespace) {
    let configMap = { ...this.state.configMap };
    configMap.metadata.namespace = String(namespace);
    this.setState({ configMap });
  }
  _updateData(datas) {
    this.setState({
      data: datas.keyValuePairs,
      isDuplicated: datas.isDuplicated || false
    });
  }
  save(e) {
    e.preventDefault();
    const { t } = this.props;
    const { kind, metadata } = this.state.configMap;
    const newConfigMap = _.assign({}, this.state.configMap);
    //input 에러처리
    if (newConfigMap.metadata.name === '') {
      this.setState({ inputError: { name: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:NAME`) }) } });
      return;
    } else {
      this.setState({ inputError: { name: null } });
    }
    if (newConfigMap.metadata.namespace === '') {
      this.setState({ inputError: { namespace: t('VALIDATION:EMPTY-SELECT', { something: t(`CONTENT:NAMESPACE`) }) } });
      return;
    } else {
      this.setState({ inputError: { namespace: null } });
    }
    if (this.state.isDuplicated) {
      return;
    }
    //  데이터 가공
    let obj = {};
    this.state.data.forEach(arr => {
      if (arr[0] !== '' && arr[1] !== '') {
        obj[arr[0]] = arr[1];
      }
    });
    newConfigMap.data = obj;
    this.setState({ inProgress: true });
    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newConfigMap) : k8sUpdate(ko, newConfigMap, metadata.namespace, newConfigMap.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push('/k8s/ns/' + metadata.namespace + '/configmaps/' + metadata.name);
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;
    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.configMap.kind, t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.configMap.kind, t) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:CONFIGMAP-CREATE_0')}</p>
          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.configMap.metadata.name} id="config-map-name" />
              {this.state.inputError.name && <p className="cos-error-title">{this.state.inputError.name}</p>}
            </Section>
            <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="config-map-namespace" t={t} onChange={this.onNamespaceChanged} />
              {this.state.inputError.namespace && <p className="cos-error-title">{this.state.inputError.namespace}</p>}
            </Section>
            <Section label={t('CONTENT:CONFIGMAPVALUE')}>
              <KeyValueEditor t={t} keyValuePairs={this.state.data} updateParentData={this._updateData} />
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('configmaps')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateConfigMap = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <ConfigMapFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} configMapTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

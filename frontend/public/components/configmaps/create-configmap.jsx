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
    return <div className={"row form-group " + (isRequired ? 'required' : '')}>
        <div className="col-xs-2 control-label">
            <strong>{label}</strong>
        </div>
        <div className="col-xs-10">{children}</div>
    </div>
}

class ConfigMapFormComponent extends React.Component {
    constructor(props) {
        super(props);
        const existingConfigMap = _.pick(props.obj, ['metadata', 'type']);
        const configMap = _.defaultsDeep({}, props.fixed, existingConfigMap, {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: {
                name: '',
                namespace: ''
            }
        });

        this.state = {
            configMapTypeAbstraction: this.props.configMapTypeAbstraction,
            configMap: configMap,
            inProgress: false,
            type: 'form',
            data: [['', '']]
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
        });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.configMap;
        this.setState({ inProgress: true });
        const newConfigMap = _.assign({}, this.state.configMap);
        //  데이터 가공
        let obj = {};
        this.state.data.forEach(arr => {
            if (arr[0] !== '' && arr[1] !== '') {
                obj[arr[0]] = arr[1];
            }
        });
        newConfigMap.data = obj;
        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newConfigMap)
            : k8sUpdate(ko, newConfigMap, metadata.namespace, newConfigMap.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            history.push('/k8s/ns/' + metadata.namespace + '/configmaps/' + metadata.name);
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { t } = this.props;
        return <div className="rbac-edit-binding co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.configMap.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.configMap.kind, t) })}</h1>
                <p className="co-m-pane__explanation">컨테이너에서 필요한 설정 값을 입력하여 환경별로 구성 요소를 분리할 수 있습니다.</p>

                <fieldset disabled={!this.props.isCreate}>

                    <Section label={t('CONTENT:NAME')} isRequired={true}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.configMap.metadata.name}
                            id="config-map-name"
                            required />
                    </Section>
                    <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
                        <NsDropdown id="config-map-namespace" t={t} onChange={this.onNamespaceChanged} />
                    </Section>
                    <Section label={t('CONTENT:CONFIGMAPVALUE')}>
                        <KeyValueEditor t={t} keyValuePairs={this.state.data} updateParentData={this._updateData} />
                    </Section>
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
                        <Link to={formatNamespacedRouteForResource('configmaps')} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateConfigMap = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <ConfigMapFormComponent
        t={t}
        fixed={{ metadata: { namespace: params.ns } }}
        configMapTypeAbstraction={params.type}
        titleVerb="Create"
        isCreate={true}
    />;
};



/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { KeyValueEditor } from '../utils/key-value-editor';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';

enum CreateType {
    generic = 'generic',
    form = 'form',
}
const pageExplanation = {
    [CreateType.form]: 'Create namespace claim  using Form Editor',
};
const FirstSection = ({ label, children, id }) => <div className="form-group">
    <label className="control-label" htmlFor="secret-type" >{label}</label>
    <div>
        {children}
    </div>
</div>

class NamespaceClaimFormComponent extends React.Component<NamespaceClaimProps_, NamespaceClaimState_>  {
    constructor(props) {
        super(props);
        const existingNamespaceClaim = _.pick(props.obj, ['metadata', 'type']);
        const namespaceclaim = _.defaultsDeep({}, props.fixed, existingNamespaceClaim, {
            apiVersion: 'tmax.io/v1',
            kind: 'NamespaceClaim',
            metadata: {
                name: ''
            },
            resourceName: '',
            spec: {
                hard: {
                    'limits.cpu': '',
                    'limits.memory': ''
                }
            }
        });

        this.state = {
            namespaceClaimTypeAbstraction: this.props.namespaceClaimTypeAbstraction,
            namespaceclaim: namespaceclaim,
            inProgress: false,
            type: 'form',
            quota: [['', '']]
        };
        this.onResourceNameChanged = this.onResourceNameChanged.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onQuotaChanged = this.onQuotaChanged.bind(this);
        this._updateQuota = this._updateQuota.bind(this);
        this.save = this.save.bind(this);
    }

    onResourceNameChanged(event) {
        let namespaceclaim = { ...this.state.namespaceclaim };
        namespaceclaim['resourceName'] = String(event.target.value);
        this.setState({ namespaceclaim });
    }

    onNameChanged(event) {
        let namespaceclaim = { ...this.state.namespaceclaim };
        namespaceclaim.metadata.name = String(event.target.value);
        this.setState({ namespaceclaim });
    }
    onQuotaChanged(event) {
        let namespaceclaim = { ...this.state.namespaceclaim };
        if (event.target.id === 'cpu') {
            namespaceclaim.spec.hard['limits.cpu'] = String(event.target.value);
        } else {
            namespaceclaim.spec.hard['limits.memory'] = String(event.target.value);
        }
        this.setState({ namespaceclaim });
    }
    _updateQuota(quota) {
        this.setState({
            quota: quota.keyValuePairs
        });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.namespaceclaim;
        this.setState({ inProgress: true });
        const newNamespaceclaim = _.assign({}, this.state.namespaceclaim);

        // quota 데이터 가공 
        let quota = {};
        this.state.quota.forEach(arr => {
            if (arr[0] !== "" && arr[1] !== "") {
                quota[`requests.${arr[0]}`] = arr[1];
            }
        })
        if (quota !== {}) {
            Object.assign(newNamespaceclaim.spec.hard, quota)
        }

        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newNamespaceclaim)
            : k8sUpdate(ko, newNamespaceclaim, metadata.namespace, newNamespaceclaim.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            console.log(this.state)
            history.push('/k8s/cluster/namespaceclaims');
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { t } = this.props;

        return <div className="co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.namespaceclaim.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.namespaceclaim.kind, t) })}</h1>
                {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}

                <fieldset disabled={!this.props.isCreate}>
                    {/* Name */}
                    <FirstSection label={t('CONTENT:NAME')} children={
                        <input className="form-control"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.namespaceclaim.metadata.name}
                            required />
                    } id="name" />

                    {/* Resource Name */}
                    <FirstSection label={t('CONTENT:RESOURCENAME')} children={
                        <input className="form-control"
                            type="text"
                            onChange={this.onResourceNameChanged}
                            value={this.state.namespaceclaim['resourceName']}
                            required />
                    } id="resourceName" />

                    {/* Resource Quota */}
                    <div className="form-group">
                        <React.Fragment>
                            <div className="form-group">
                                <label className="control-label" htmlFor="username">{t('CONTENT:RESOURCEQUOTA')}</label>
                                <div className="row">
                                    <div className="col-md-2 col-xs-2 pairs-list__name-field">{t('CONTENT:KIND')}</div>
                                    <div className="col-md-2 col-xs-2 pairs-list__name-field">{t('CONTENT:VALUE')}</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                        <div>limits.cpu</div>
                                    </div>
                                    <div className="col-md-2 col-xs-2 pairs-list__name-field" id='cpu'>
                                        <input className="form-control" type="text"
                                            onChange={this.onQuotaChanged} id="cpu"
                                            placeholder={t('CONTENT:VALUE')} value={this.state.namespaceclaim.spec.hard['limits.cpu']} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                        <div>limits.memory</div>
                                    </div>
                                    <div className="col-md-2 col-xs-2 pairs-list__name-field" id='memory'>
                                        <input className="form-control" type="text" id="memory"
                                            onChange={this.onQuotaChanged} placeholder={t('CONTENT:VALUE')} value={this.state.namespaceclaim.spec.hard['limits.memory']} required />
                                    </div>
                                </div>
                                <div>
                                    <KeyValueEditor t={t} keyValuePairs={this.state.quota} keyString="" valueString="" updateParentData={this._updateQuota} />
                                </div>
                            </div>
                        </React.Fragment>
                    </div>
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
                        <Link to={'/k8s/cluster/namespaceclaims'} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateNamespaceClaim = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <NamespaceClaimFormComponent
        t={t}
        fixed={{ metadata: { namespace: params.ns } }}
        namespaceClaimTypeAbstraction={params.type}
        explanation={pageExplanation[params.type]}
        titleVerb="Create"
        isCreate={true}
    />;
};
export type NamespaceClaimState_ = {
    namespaceClaimTypeAbstraction?: CreateType,
    namespaceclaim: K8sResourceKind,
    inProgress: boolean,
    error?: any,
    type: string,
    quota: Array<any>
};

export type NamespaceClaimProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    namespaceClaimTypeAbstraction?: CreateType,
    saveButtonText?: string,
    explanation: string,
    t: any
};


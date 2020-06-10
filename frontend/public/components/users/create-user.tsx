/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';

enum CreateType {
    generic = 'generic',
    form = 'form',
}

const Section = ({ label, children }) => (
    <div className="row">
        <div className="col-xs-2 control-label">
            <strong>{label}</strong>
        </div>
        <div className="col-xs-4">{children}</div>
    </div>
);


class UserFormComponent extends React.Component<UserProps_, UserState_>  {
    constructor(props) {
        super(props);
        const existingUser = _.pick(props.obj, ['metadata', 'type']);
        const serviceAccount = _.defaultsDeep({}, props.fixed, existingUser, {
            apiVersion: 'tmax.io/v1',
            kind: 'User',
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
            serviceAccountTypeAbstraction: this.props.serviceAccountTypeAbstraction,
            serviceAccount: serviceAccount,
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
        let serviceAccount = { ...this.state.serviceAccount };
        serviceAccount['resourceName'] = String(event.target.value);
        this.setState({ serviceAccount });
    }

    onNameChanged(event) {
        let serviceAccount = { ...this.state.serviceAccount };
        serviceAccount.metadata.name = String(event.target.value);
        this.setState({ serviceAccount });
    }
    onQuotaChanged(event) {
        let serviceAccount = { ...this.state.serviceAccount };
        if (event.target.id === 'cpu') {
            serviceAccount.spec.hard['limits.cpu'] = String(event.target.value);
        } else {
            serviceAccount.spec.hard['limits.memory'] = String(event.target.value);
        }
        this.setState({ serviceAccount });
    }
    _updateQuota(quota) {
        this.setState({
            quota: quota.keyValuePairs
        });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.serviceAccount;
        this.setState({ inProgress: true });
        const newUser = _.assign({}, this.state.serviceAccount);

        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newUser)
            : k8sUpdate(ko, newUser, metadata.namespace, newUser.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            history.push('/k8s/cluster/users');
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { saveButtonText, t, titleVerb } = this.props;
        const fixed = { metadata: { namespace: 'a' } }
        return <div className="co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.serviceAccount.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.serviceAccount.kind, t) })}</h1>
                <p className="co-m-pane__explanation">Create user through the form editor.</p>

                <fieldset disabled={!this.props.isCreate}>

                    <Section label={t('CONTENT:NAME')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name"
                            required />
                    </Section>
                    <Section label={t('CONTENT:EMAIL')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name"
                            required />
                    </Section>
                    <Section label={t('CONTENT:PASSWORD')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name"
                            required />
                    </Section>
                    <Section label={t('CONTENT:PHONE')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name" />
                    </Section>
                    <Section label={t('CONTENT:DEPARTMENT')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name" />
                    </Section>
                    <Section label={t('CONTENT:POSITION')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name" />
                    </Section>
                    <Section label={t('CONTENT:DESCRIPTION')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="template-instance-name" />
                    </Section>
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
                        <Link to='/k8s/cluster/users' className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateUser = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <UserFormComponent
        t={t}
        fixed={{ metadata: { namespace: params.ns } }}
        serviceAccountTypeAbstraction={params.type}
        titleVerb="Create"
        isCreate={true}
    />;
};
export type UserState_ = {
    serviceAccountTypeAbstraction?: CreateType,
    serviceAccount: K8sResourceKind,
    inProgress: boolean,
    error?: any,
    type: string,
    quota: Array<any>
};

export type UserProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    serviceAccountTypeAbstraction?: CreateType,
    saveButtonText?: string,
    t: any
};



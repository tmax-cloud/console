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


const Section = ({ label, children }) => (
    <div className="row">
        <div className="col-xs-2 control-label">
            <strong>{label}</strong>
        </div>
        <div className="col-xs-10">{children}</div>
    </div>
);

class ServiceAccountFormComponent extends React.Component {
    constructor(props) {
        super(props);
        const existingServiceAccount = _.pick(props.obj, ['metadata', 'type']);
        const serviceAccount = _.defaultsDeep({}, props.fixed, existingServiceAccount, {
            apiVersion: 'v1',
            kind: 'ServiceAccount',
            metadata: {
                name: '',
                namespace: ''
            }
        });

        this.state = {
            serviceAccountTypeAbstraction: this.props.serviceAccountTypeAbstraction,
            serviceAccount: serviceAccount,
            inProgress: false,
            type: 'form',
            quota: [['', '']]
        };
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
        this.save = this.save.bind(this);
    }

    onNameChanged(event) {
        let serviceAccount = { ...this.state.serviceAccount };
        serviceAccount.metadata.name = String(event.target.value);
        this.setState({ serviceAccount });
    }
    onNamespaceChanged(namespace) {
        let serviceAccount = { ...this.state.serviceAccount };
        serviceAccount.metadata.namespace = String(namespace);
        this.setState({ serviceAccount });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.serviceAccount;
        this.setState({ inProgress: true });
        const newServiceAccount = _.assign({}, this.state.serviceAccount);

        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newServiceAccount)
            : k8sUpdate(ko, newServiceAccount, metadata.namespace, newServiceAccount.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            history.push('/k8s/ns/' + metadata.namespace + '/serviceaccounts/' + metadata.name);
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { t } = this.props;
        return <div className="rbac-edit-binding co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.serviceAccount.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.serviceAccount.kind, t) })}</h1>
                <p className="co-m-pane__explanation">Represents an identity for processes that run in a pod.</p>

                <fieldset disabled={!this.props.isCreate}>

                    <Section label={t('CONTENT:NAME')}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.serviceAccount.metadata.name}
                            id="service-account-name"
                            required />
                    </Section>
                    <Section label={t('CONTENT:NAMESPACE')}>
                        <NsDropdown id="service-account-namespace" t={t} onChange={this.onNamespaceChanged} />
                    </Section>
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
                        <Link to={formatNamespacedRouteForResource('serviceaccounts')} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateServiceAccount = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <ServiceAccountFormComponent
        t={t}
        fixed={{ metadata: { namespace: params.ns } }}
        serviceAccountTypeAbstraction={params.type}
        titleVerb="Create"
        isCreate={true}
    />;
};



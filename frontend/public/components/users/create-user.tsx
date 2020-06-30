/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { sha512 } from 'js-sha512';

enum CreateType {
    generic = 'generic',
    form = 'form',
}

const Section = ({ label, children, isRequired }) => {
    return <div className={"row form-group " + (isRequired ? 'required' : '')}>
        <div className="col-xs-2 control-label">
            <strong>{label}</strong>
        </div>
        <div className="col-xs-4">{children}</div>
    </div>
}

class UserFormComponent extends React.Component<UserProps_, UserState_>  {
    constructor(props) {
        super(props);
        const existingUser = _.pick(props.obj, ['metadata', 'type']);
        const user = _.defaultsDeep({}, props.fixed, existingUser, {
            apiVersion: 'tmax.io/v1',
            kind: 'User',
            metadata: {
                name: '',
                labels: {
                    encrypted: "f"
                }
            },
            status: 'active',
            userInfo: {
                email: '',
                password: '',
                phone: ''
            }
        });

        const inputError = {
            name: null,
            email: null,
            password: null,
            phone: null
        }

        this.state = {
            userTypeAbstraction: this.props.userTypeAbstraction,
            user: user,
            inProgress: false,
            type: 'form',
            inputError: inputError
        };
        this.onValueChanged = this.onValueChanged.bind(this);
        this.save = this.save.bind(this);
    }

    onValueChanged(event) {
        let user = { ...this.state.user };
        switch (String(event.target.id)) {
            case 'name':
                user.userInfo.name = String(event.target.value);
                user.metadata.name = String(event.target.value);
                break;
            case 'email':
                user.userInfo.email = String(event.target.value);
                break;
            case 'password':
                let pw = event.target.value !== '' ? sha512(String(event.target.value)) : "";
                user.userInfo.password = pw;
                break;
            case 'phone':
                user.userInfo.phone = String(event.target.value);
                break;
            case 'department':
                user.userInfo.department = String(event.target.value);
                break;
            case 'position':
                user.userInfo.position = String(event.target.value);
                break;
            case 'description':
                user.userInfo.description = String(event.target.value);
                break;

        }
        this.setState({ user });
    }
    save(e) {
        e.preventDefault();
        const { t } = this.props;
        const { kind, metadata } = this.state.user;
        const newUser = _.assign({}, this.state.user);
        //input 에러처리 
        if (newUser.metadata.name === '') {
            this.setState({ inputError: { name: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:NAME`) }) } });
            return
        } else {
            this.setState({ inputError: { name: null } });
        }
        if (newUser.userInfo.email === '') {
            this.setState({ inputError: { email: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:EMAIL`) }) } });
            return
        } else {
            this.setState({ inputError: { email: null } });
        }
        if (newUser.userInfo.password === '') {
            this.setState({ inputError: { password: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:PASSWORD`) }) } });
            return
        } else {
            this.setState({ inputError: { password: null } });
        }
        if (newUser.userInfo.phone === '') {
            this.setState({ inputError: { phone: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:PHONE`) }) } });
            return
        } else {
            this.setState({ inputError: { phone: null } });
        }
        this.setState({ inProgress: true });
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
        const { t } = this.props;
        return <div className="co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.user.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.user.kind, t) })}</h1>
                <p className="co-m-pane__explanation">{t('STRING:USER-CREATE_0')}</p>

                <fieldset disabled={!this.props.isCreate}>

                    <Section label={t('CONTENT:NAME')} isRequired={true}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="name" />
                        {this.state.inputError.name &&
                            <p className="error_text">{this.state.inputError.name}</p>
                        }
                    </Section>
                    <Section label={t('CONTENT:EMAIL')} isRequired={true}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="email" />
                        {this.state.inputError.email &&
                            <p className="error_text">{this.state.inputError.email}</p>
                        }
                    </Section>
                    <Section label={t('CONTENT:PASSWORD')} isRequired={true} >
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="password" />
                        {this.state.inputError.password &&
                            <p className="error_text">{this.state.inputError.password}</p>
                        }
                    </Section>
                    <Section label={t('CONTENT:PHONE')} isRequired={true}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="phone" />
                        {this.state.inputError.phone &&
                            <p className="error_text">{this.state.inputError.phone}</p>
                        }
                    </Section>
                    <Section label={t('CONTENT:DEPARTMENT')} isRequired={false}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="department" />
                    </Section>
                    <Section label={t('CONTENT:POSITION')} isRequired={false}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="position" />
                    </Section>
                    <Section label={t('CONTENT:DESCRIPTION')} isRequired={false}>
                        <textarea className="form-control form-group" style={{ resize: 'none' }}
                            onChange={this.onValueChanged}
                            id="description" />
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
        userTypeAbstraction={params.type}
        titleVerb="Create"
        isCreate={true}
    />;
};
export type UserState_ = {
    userTypeAbstraction?: CreateType,
    user: any,
    inProgress: boolean,
    error?: any,
    type: string,
    inputError?: any
};

export type UserProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    userTypeAbstraction?: CreateType,
    saveButtonText?: string,
    t: any
};



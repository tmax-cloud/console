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

const Section = ({ label, children, isRequired }) => {
    return <div className={"row form-group " + (isRequired ? 'required' : '')}>
        <div className="col-xs-2 control-label">
            <strong>{label}</strong>
        </div>
        <div className="col-xs-4">{children}</div>
    </div>
}

class UserGroupFormComponent extends React.Component<UserGroupProps_, UserGroupState_>  {
    constructor(props) {
        super(props);
        const existingUserGroup = _.pick(props.obj, ['metadata', 'type']);
        const userGroup = _.defaultsDeep({}, props.fixed, existingUserGroup, {
            apiVersion: 'tmax.io/v1',
            kind: 'Usergroup',
            metadata: {
                name: ''
            },
            status: 'active',
            userGroupInfo: {
            }
        });

        this.state = {
            userGroupTypeAbstraction: this.props.userGroupTypeAbstraction,
            userGroup: userGroup,
            inProgress: false,
            type: 'form',
            quota: [['', '']]
        };
        this.onValueChanged = this.onValueChanged.bind(this);
        this.save = this.save.bind(this);
    }

    onValueChanged(event) {
        let userGroup = { ...this.state.userGroup };
        switch (String(event.target.id)) {
            case 'name':
                userGroup.userGroupInfo.name = String(event.target.value);
                userGroup.metadata.name = String(event.target.value);
                break;
            case 'department':
                userGroup.userGroupInfo.department = String(event.target.value);
                break;
            case 'position':
                userGroup.userGroupInfo.position = String(event.target.value);
                break;
            case 'description':
                userGroup.userGroupInfo.description = String(event.target.value);
                break;

        }
        this.setState({ userGroup });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.userGroup;
        this.setState({ inProgress: true });
        const newUserGroup = _.assign({}, this.state.userGroup);

        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newUserGroup)
            : k8sUpdate(ko, newUserGroup, metadata.namespace, newUserGroup.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            history.push('/k8s/cluster/usergroups');
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { t } = this.props;
        return <div className="co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.userGroup.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.userGroup.kind, t) })}</h1>
                <p className="co-m-pane__explanation">{t('STRING:USERGROUP-CREATE_0')}</p>
                <fieldset disabled={!this.props.isCreate}>
                    <Section label={t('CONTENT:NAME')} isRequired={true}>
                        <input className="form-control form-group"
                            type="text"
                            onChange={this.onValueChanged}
                            id="name"
                            required />
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
                        <Link to='/k8s/cluster/userGroups' className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateUserGroup = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <UserGroupFormComponent
        t={t}
        userGroupTypeAbstraction={params.type}
        titleVerb="Create"
        isCreate={true}
    />;
};
export type UserGroupState_ = {
    userGroupTypeAbstraction?: CreateType,
    userGroup: any,
    inProgress: boolean,
    error?: any,
    type: string,
    quota: Array<any>
};

export type UserGroupProps_ = {
    obj?: K8sResourceKind,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    userGroupTypeAbstraction?: CreateType,
    saveButtonText?: string,
    t: any
};



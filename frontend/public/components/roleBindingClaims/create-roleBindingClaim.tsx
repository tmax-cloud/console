/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { RadioGroup } from '../radio';
import { k8sCreate, k8sUpdate, k8sList, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj, ResourceIcon } from '../utils';
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

class RoleBindingClaimFormComponent extends React.Component<RoleBindingClaimProps_, RoleBindingClaimState_>  {
    constructor(props) {
        super(props);
        const existingRoleBindingClaim = _.pick(props.obj, ['metadata', 'type']);
        const roleBindingClaim = _.defaultsDeep({}, props.fixed, existingRoleBindingClaim, {
            apiVersion: 'tmax.io/v1',
            kind: 'RoleBindingClaim',
            metadata: {
                name: '',
                namespace: ''
            },
            resourceName: '',
            subjects: [{
                kind: '',
                name: ''
            }],
            roleRef: {
                kind: '',
                name: '',
                apiGroup: ''
            }
        });

        this.state = {
            roleBindingClaimTypeAbstraction: this.props.roleBindingClaimTypeAbstraction,
            roleBindingClaim: roleBindingClaim,
            inProgress: false,
            type: 'form',
            namespaceList: [],
            roleList: [],
            selectedRole: '',
            subjectKind: 'User',
            selectedSubjectNamespace: ''
        };
        this.getRoleList = this.getRoleList.bind(this);
        this.getNamespaceList = this.getNamespaceList.bind(this);
        this.onResourceNameChanged = this.onResourceNameChanged.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onNamespaceChange = this.onNamespaceChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onSubjectChange = this.onSubjectChange.bind(this);
        this.onSubjectNameChange = this.onSubjectNameChange.bind(this);
        this.save = this.save.bind(this);
    }
    componentDidMount() {
        this.getRoleList();
        this.getNamespaceList();
    }
    getRoleList() {
        let finalRoleList = [];
        // clusterRole  
        const ko = kindObj('ClusterRole');
        k8sList(ko)
            .then(reponse => reponse)
            .then((data) => {
                let clusterRoleList = data
                    .map(cur => {
                        return {
                            kind: 'ClusterRole',
                            name: cur.metadata.name,
                            nameString: `${cur.metadata.name}(Cluster Role)`,
                            apiGroup: "rbac.authorization.k8s.io/v1"
                        }
                    })
                clusterRoleList.forEach(element => {
                    finalRoleList.push(element);
                });
            }, err => {
                this.setState({ error: err.message, inProgress: false })
                this.setState({ roleList: [] });
            });
        // 해당 ns의 Role
        const role = kindObj('Role');
        k8sList(role)
            .then(reponse => reponse)
            .then((data) => {
                let roleList = data
                    .map(cur => {
                        return {
                            kind: 'Role',
                            name: cur.metadata.name,
                            nameString: `${cur.metadata.name}(Role)`,
                            apiGroup: "rbac.authorization.k8s.io/v1"
                        }
                    })
                roleList.forEach(element => {
                    finalRoleList.push(element);
                });
            }, err => {
                this.setState({ error: err.message, inProgress: false })
                this.setState({ roleList: [] });
            });
        // role + clusterRole list  

        this.setState({
            roleList: finalRoleList
        });
    }
    getNamespaceList() {
        const ko = kindObj('Namespace');
        k8sList(ko)
            .then(reponse => reponse)
            .then((data) => {
                let namespaceList = data
                    .map(cur => {
                        return {
                            name: cur.metadata.name
                        }
                    })
                let roleBindingClaim = { ...this.state.roleBindingClaim };
                if (namespaceList.length === 0) {
                    return;
                }
                this.setState({ roleBindingClaim });

                this.setState({
                    namespaceList: namespaceList,
                });
            }, err => {
                this.setState({ error: err.message, inProgress: false })
                this.setState({ roleList: [] });
            });
    }
    onResourceNameChanged(event) {
        let roleBindingClaim = { ...this.state.roleBindingClaim };
        roleBindingClaim['resourceName'] = String(event.target.value);
        this.setState({ roleBindingClaim });
    }

    onNameChanged(event) {
        let roleBindingClaim = { ...this.state.roleBindingClaim };
        roleBindingClaim.metadata.name = String(event.target.value);
        this.setState({ roleBindingClaim });
    }
    onRoleChange(event) {
        let roleObj = JSON.parse(event.target.value)
        let roleBindingClaim = { ...this.state.roleBindingClaim };
        roleBindingClaim['roleRef'] = roleObj;
        this.setState({ roleBindingClaim });
    }
    onNamespaceChange(event) {
        this.setState({
            selectedSubjectNamespace: event.target.value
        });
        let roleBindingClaim = { ...this.state.roleBindingClaim };
        this.setState({ roleBindingClaim });
    }
    onSubjectChange(event) {
        this.setState({
            subjectKind: event.target.value
        });
        let roleBindingClaim = { ...this.state.roleBindingClaim };
        roleBindingClaim['subjects'][0].kind = String(event.target.value);
        this.setState({ roleBindingClaim });
    }
    onSubjectNameChange(event) {
        let roleBindingClaim = { ...this.state.roleBindingClaim };
        roleBindingClaim['subjects'][0].name = String(event.target.value);
        this.setState({ roleBindingClaim });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.roleBindingClaim;
        this.setState({ inProgress: true });
        const roleBindingClaim = _.assign({}, this.state.roleBindingClaim);
        console.log(roleBindingClaim)
        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, roleBindingClaim)
            : k8sUpdate(ko, roleBindingClaim, metadata.namespace, roleBindingClaim.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            console.log(this.state)
            history.push(formatNamespacedRouteForResource('rolebindingclaims'));
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { roleList, subjectKind, namespaceList } = this.state
        const { t } = this.props;
        let roleOptions = roleList.map(cur => {
            // return <option value={cur.name} >
            //     <span>
            //         <span className="co-icon-space-r">
            //             <ResourceIcon kind="Container" />
            //         </span>
            //     </span> {cur.nameString}</option>;
            let roleObj = JSON.stringify(cur)
            return <option value={roleObj} > {cur.nameString} </option>;
        });
        let namespaceOptions = namespaceList.map(cur => {
            return <option value={cur.name} data-content="<ResourceIcon kind='Container'/>">{cur.name}</option>;
        });
        const subjectKinds = [
            { value: 'User', title: t('CONTENT:USER') },
            { value: 'Group', title: t('CONTENT:GROUP') },
            { value: 'ServiceAccount', title: t('RESOURCE:SERVICEACCOUNT') },
        ];
        return <div className="co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.roleBindingClaim.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.roleBindingClaim.kind, t) })}</h1>
                {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}

                <fieldset disabled={!this.props.isCreate}>
                    {/* Name */}
                    <FirstSection label={t('CONTENT:NAME')} children={
                        <input className="form-control"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.roleBindingClaim.metadata.name}
                            required />
                    } id="name" />

                    {/* Resource Name */}
                    <FirstSection label={t('CONTENT:RESOURCENAME')} children={
                        <input className="form-control"
                            type="text"
                            onChange={this.onResourceNameChanged}
                            value={this.state.roleBindingClaim['resourceName']}
                            required />
                    } id="resourceName" />

                    {/* Role */}
                    <FirstSection label={t('RESOURCE:ROLE')} children={
                        <select onChange={this.onRoleChange} className="form-control" id="role">
                            {roleOptions}
                        </select>} id="role" />

                    {/* Subject */}
                    <FirstSection label={t('CONTENT:SUBJECT')} children={
                        <div>
                            <RadioGroup currentValue={subjectKind} items={subjectKinds} onChange={this.onSubjectChange} />
                            {subjectKind === 'ServiceAccount' && (
                                <FirstSection label={t('CONTENT:SUBJECTNAMESPACE')} children={
                                    <select onChange={this.onNamespaceChange} className="form-control" id="subjectNamespace">
                                        {namespaceOptions}
                                    </select>} id="subjectNamespace" />
                            )}
                            <label htmlFor="subject-name" className="rbac-edit-binding__input-label">
                                {t('CONTENT:SUBJECTNAME')}
                            </label>
                            <input className="form-control" type="text" placeholder={t('CONTENT:NAME')} onChange={this.onSubjectNameChange} required id="subject-name" />
                        </div>
                    } id='sucject' />

                    {/* Button Bar */}
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
                        <Link to={formatNamespacedRouteForResource('rolebindingclaims')} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateRoleBindingClaim = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <RoleBindingClaimFormComponent
        t={t}
        fixed={{ metadata: { namespace: params.ns } }}
        roleBindingClaimTypeAbstraction={params.type}
        explanation={pageExplanation[params.type]}
        titleVerb="Create"
        isCreate={true}
    />;
};
export type RoleBindingClaimState_ = {
    roleBindingClaimTypeAbstraction?: CreateType,
    roleBindingClaim: K8sResourceKind,
    inProgress: boolean,
    error?: any,
    type: string,
    namespaceList: Array<any>,
    roleList: Array<any>,
    selectedRole: String,
    subjectKind: String,
    selectedSubjectNamespace: String
};

export type RoleBindingClaimProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    roleBindingClaimTypeAbstraction?: CreateType,
    saveButtonText?: string,
    explanation: string,
    t: any
};


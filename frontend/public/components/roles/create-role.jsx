/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { RadioGroup } from '../radio';
import { RoleEditor } from '../utils/role-editor';
import { coFetch, coFetchJSON } from '../../co-fetch';

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

class RoleFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingRole = _.pick(props.obj, ['metadata', 'type']);
    const role = _.defaultsDeep({}, props.fixed, existingRole, {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        name: '',
        namespace: '',
      },
    });

    this.state = {
      roleTypeAbstraction: this.props.roleTypeAbstraction,
      role: role,
      inProgress: false,
      type: 'form',
      roleList: [['', '', { All: 1, Create: 1, Delete: 1, Get: 1, List: 1, Patch: 1, Update: 1, Watch: 1 }]],
      APIGroupList: [],
      ResourceList: [],
    };
    this.setKind = this.setKind.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.getAPIGroupList = this.getAPIGroupList.bind(this);
    this.dataProcessing = this.dataProcessing.bind(this);
    this.save = this.save.bind(this);
    this._updateRoles = this._updateRoles.bind(this);
  }
  componentDidMount() {
    this.getAPIGroupList();
  }
  setKind(e) {
    let role = { ...this.state.role };
    role.kind = e.target.value;
    if (role.kind === 'ClusterRole') {
      role.metadata.namespace = null;
    }
    this.setState({ role });
  }
  getAPIGroupList() {
    coFetchJSON(`${document.location.origin}/api/kubernetes/apis`).then(
      data => {
        const APIGroupList = data.groups.map(group => group.preferredVersion.groupVersion);
        APIGroupList.unshift('Core');
        APIGroupList.unshift('All');
        this.setState({
          ResourceList: ['All'],
          APIGroupList: APIGroupList,
        });
      },
      err => {
        this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
      },
    );
  }
  _updateRoles(role) {
    this.setState({
      roleList: role.rolePairs,
    });
  }
  onNameChanged(event) {
    let role = { ...this.state.role };
    role.metadata.name = String(event.target.value);
    this.setState({ role });
  }
  onNamespaceChanged(namespace) {
    let role = { ...this.state.role };
    role.metadata.namespace = String(namespace);
    this.setState({ role });
  }
  dataProcessing(originData) {
    // originData = [['apiGroup','resource', { 'Create': 1, 'Delete': 1}],['apiGroup','resource', { 'Create': 1, 'Delete': 1}]]
    // changedData = [{verbs:['create','delete'],apiGroups:'apiGroup',resources:'resource'},{verbs:['create','delete'],apiGroups:'apiGroup',resources:'resource'}]
    let changedData = [];
    originData.forEach(originRule => {
      //api Group
      let apiGroup = originRule[0] === 'All' ? '*' : originRule[0] === 'Core' ? '' : originRule[0];
      let resource = originRule[1] === 'All' ? '*' : originRule[1];
      let rule = { verbs: [], apiGroups: [apiGroup], resources: [resource] };
      //verbs data가공
      let originVerbs = _.assign({}, originRule[2]); // { 'All':1, 'Create': 1, 'Delete': 1}
      let verbs = [];
      if (originVerbs.All) {
        verbs.push('*');
      } else {
        delete originVerbs.All;
        Object.keys(originVerbs).forEach(verb => {
          if (originVerbs[verb] === 1) {
            verbs.push(verb);
          }
        });
      }
      rule.verbs = verbs;
      changedData.push(rule);
    });
    return changedData;
  }
  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.role;
    this.state.roleList.forEach(role => {
      if (role[0] === '') {
        role[0] = this.state.APIGroupList[0];
      }
    });
    //rule데이터 가공
    let changedData = this.dataProcessing(this.state.roleList);
    this.setState({ inProgress: true });
    const newRole = _.assign({}, this.state.role);
    newRole.rules = changedData;
    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newRole) : k8sUpdate(ko, newRole, metadata.namespace, newRole.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        kind === 'Role' ? history.push('/k8s/ns/' + metadata.namespace + '/roles/' + metadata.name) : history.push('/k8s/cluster/clusterroles/' + metadata.name);
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;
    const { kind, metadata, roleRef } = this.state.role;
    const { APIGroupList, ResourceList } = this.state;
    const roleKinds = [
      { value: 'Role', title: 'Namespace Role (Role)', desc: t('STRING:ROLE-CREATE_0') },
      { value: 'ClusterRole', title: 'Cluster Role (Cluster Role)', desc: t('STRING:ROLE-CREATE_1') },
    ];
    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.role.kind, t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.role.kind, t) })}</h1>
          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:ROLETYPE')}>
              <RadioGroup currentValue={kind} items={roleKinds} onChange={this.setKind} />
            </Section>
            <div className="separator"></div>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.role.metadata.name} id="role-name" required />
            </Section>
            {kind === 'Role' && (
              <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
                <NsDropdown id="role-namespace" t={t} onChange={this.onNamespaceChanged} />
              </Section>
            )}
            <Section label={t('CONTENT:GRANTRESOURCES')} isRequired={true}>
              <RoleEditor desc={t('STRING:ROLE-CREATE_2')} APIGroupList={APIGroupList} ResourceList={ResourceList} t={t} rolePairs={this.state.roleList} updateParentData={this._updateRoles} />
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('roles')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateRole = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <RoleFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} roleTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

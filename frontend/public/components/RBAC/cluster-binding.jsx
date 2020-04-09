import * as _ from 'lodash-es';
import * as React from 'react';
import * as fuzzy from 'fuzzysearch';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';

import { getQN, k8sCreate, k8sPatch } from '../../module/k8s';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from '../factory';
import {
  ButtonBar, Cog, Dropdown, Firehose, history, kindObj, LoadingInline,
  ResourceCog, ResourceName, ResourceLink,
  navFactory,
  SectionHeading,
  ResourceSummary,
  ScrollToTopOnMount
} from '../utils';
import { fromNow } from '../utils/datetime';
import { RadioGroup } from '../radio';
import { confirmModal } from '../modals';
import { kindForReference } from '../../module/k8s';
import { isSystemRole } from './index';
import { connectToFlags, FLAGS, flagPending } from '../../features';
import { SafetyFirst } from '../safety-first';
import { getActiveNamespace, formatNamespacedRouteForResource, UIActions } from '../../ui/ui-actions';
import { breadcrumbsForOwnerRefs } from '../utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];
const subjectKinds = [
  { value: 'User', title: 'User' },
  { value: 'Group', title: 'Group' },
  { value: 'ServiceAccount', title: 'Service Account' },
];

const ClusterRoleBindingHeader = props => (
  <ListHeader>
    <ColHead {...props} className="col-xs-6 col-sm-6" sortField="metadata.name">
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-sm-6 hidden-xs"
      sortField="metadata.creationTimestamp"
    >
      Created
    </ColHead>
  </ListHeader>
);

const Section = ({ label, children }) => <div className="row">
  <div className="col-xs-2">
    <strong>{label}</strong>
  </div>
  <div className="col-xs-10">
    {children}
  </div>
</div>;

const ClusterRoleBindingRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterRoleBindingRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ClusterRoleBinding"
            resource={obj}
          />
          <ResourceLink
            kind="ClusterRoleBinding"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-6 col-sm-6 hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
      </div>
    );
  };
const NsDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }
  const kind = openshiftFlag ? 'Project' : 'Namespace';
  const resources = [{ kind }];
  return <ListDropdown {...props} desc="Namespaces" resources={resources} selectedKeyKind={kind} placeholder="Select namespace" />;
};
const NsDropdown = connectToFlags(FLAGS.OPENSHIFT)(NsDropdown_);

const NsRoleDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }

  const roleFilter = role => !isSystemRole(role);

  let kinds;
  if (props.fixed) {
    kinds = [props.selectedKeyKind];
  } else if (props.namespace) {
    kinds = ['Role', 'ClusterRole'];
  } else {
    kinds = ['ClusterRole'];
  }
  const resourceForKind = kind => ({ kind, namespace: kind === 'Role' ? props.namespace : null });
  const resources = _.map(kinds, resourceForKind);

  return <ListDropdown
    {...props}
    dataFilter={roleFilter}
    desc="Namespace Roles (Role)"
    resources={resources}
    placeholder="Select role name"
  />;
};
const NsRoleDropdown = connectToFlags(FLAGS.OPENSHIFT)(NsRoleDropdown_);
class ListDropdown_ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {},
    };

    if (props.selectedKey) {
      this.state.selectedKey = props.selectedKeyKind ? `${props.selectedKey}-${props.selectedKeyKind}` : props.selectedKey;
    }

    this.state.title = props.loaded ? <span className="text-muted">{props.placeholder}</span> : <LoadingInline />;

    this.autocompleteFilter = (text, item) => fuzzy(text, item.props.name);
    // Pass both the resource name and the resource kind to onChange()
    this.onChange = key => {
      const { name, kindLabel } = _.get(this.state, ['items', key], {});
      this.setState({ selectedKey: key, title: <ResourceName kind={kindLabel} name={name} /> });
      this.props.onChange(name, kindLabel);
    };
  }

  componentWillMount() {
    // we need to trigger state changes to get past shouldComponentUpdate...
    //   but the entire working set of data can be loaded in memory at this point in time
    //   in which case componentWillReceiveProps would not be called for a while...
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, loadError } = nextProps;

    if (loadError) {
      this.setState({
        title: <div className="cos-error-title">Error Loading {nextProps.desc}</div>
      });
      return;
    }

    if (!loaded) {
      return;
    }

    const state = {};

    const { resources, dataFilter } = nextProps;
    state.items = {};
    _.each(resources, ({ data }, kindLabel) => {
      _.reduce(data, (acc, resource) => {
        if (!dataFilter || dataFilter(resource)) {
          acc[`${resource.metadata.name}-${kindLabel}`] = { kindLabel, name: resource.metadata.name };
        }
        return acc;
      }, state.items);
    });

    const { selectedKey } = this.state;
    // did we switch from !loaded -> loaded ?
    if (!this.props.loaded && !selectedKey) {
      state.title = <span className="text-muted">{nextProps.placeholder}</span>;
    }

    if (selectedKey) {
      const item = state.items[selectedKey];
      // item may not exist if selectedKey is a role and then user switches to creating a ClusterRoleBinding
      if (item) {
        state.title = <ResourceName kind={item.kindLabel} name={item.name} />;
      }
    }

    this.setState(state);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(this.state, nextState)) {
      return false;
    }
    return true;
  }

  render() {
    const { desc, fixed, placeholder, id, loaded } = this.props;
    const items = {};
    const sortedItems = _.keys(this.state.items).sort();

    _.each(this.state.items, (v, key) => items[key] = <ResourceName kind={v.kindLabel} name={v.name} />);

    const { selectedKey } = this.state;

    const Component = fixed
      ? items[selectedKey]
      : <Dropdown
        autocompleteFilter={this.autocompleteFilter}
        autocompletePlaceholder={placeholder}
        items={items}
        sortedItemKeys={sortedItems}
        selectedKey={selectedKey}
        title={this.state.title}
        onChange={this.onChange}
        id={id}
        menuClassName="dropdown-menu--text-wrap" />;

    return <div>
      {Component}
      {loaded && _.isEmpty(items) && <p className="alert alert-info"><span className="pficon pficon-info" aria-hidden="true"></span>No {desc} found or defined.</p>}
    </div>;
  }
}

const ListDropdown = props => {
  const resources = _.map(props.resources, resource => _.assign({ isList: true, prop: resource.kind }, resource));
  return <Firehose resources={resources}>
    <ListDropdown_ {...props} />
  </Firehose>;
};

ListDropdown.propTypes = {
  dataFilter: PropTypes.func,
  desc: PropTypes.string,
  // specify both key/kind
  selectedKey: PropTypes.string,
  selectedKeyKind: PropTypes.string,
  fixed: PropTypes.bool,
  resources: PropTypes.arrayOf(PropTypes.shape({
    kind: PropTypes.string.isRequired,
    namespace: PropTypes.string,
  })).isRequired,
  placeholder: PropTypes.string,
};

const NsRoleDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }

  const roleFilter = role => !isSystemRole(role);

  let kinds;
  if (props.fixed) {
    kinds = [props.selectedKeyKind];
  } else if (props.namespace) {
    kinds = ['Role', 'ClusterRole'];
  } else {
    kinds = ['ClusterRole'];
  }
  const resourceForKind = kind => ({ kind, namespace: kind === 'Role' ? props.namespace : null });
  const resources = _.map(kinds, resourceForKind);

  return <ListDropdown
    {...props}
    dataFilter={roleFilter}
    desc="Namespace Roles (Role)"
    resources={resources}
    placeholder="Select role name"
  />;
};
const NsRoleDropdown = connectToFlags(FLAGS.OPENSHIFT)(NsRoleDropdown_);

const ClusterRoleDropdown = props => <ListDropdown
  {...props}
  dataFilter={role => !isSystemRole(role)}
  desc="Cluster-wide Roles (ClusterRole)"
  resources={[{ kind: 'ClusterRole' }]}
  placeholder="Select role name"
/>;

export const CreateClusterRoleBinding = ({ match: { params }, location }) => {
  const searchParams = new URLSearchParams(location.search);
  const roleKind = searchParams.get('rolekind');
  const roleName = searchParams.get('rolename');
  const metadata = { namespace: getActiveNamespace() };
  const fixed = {
    kind: (params.ns || roleKind === 'Role') ? 'RoleBinding' : undefined,
    metadata: { namespace: params.ns },
    roleRef: { kind: roleKind, name: roleName },
  };
  return <BaseEditRoleBinding
    metadata={metadata}
    fixed={fixed}
    isCreate={true}
    titleVerb="Create"
  />;
};
const BaseEditRoleBinding = connect(null, { setActiveNamespace: UIActions.setActiveNamespace })(
  class BaseEditRoleBinding_ extends SafetyFirst {
    constructor(props) {
      super(props);

      this.subjectIndex = props.subjectIndex || 0;

      const existingData = _.pick(props.obj, ['metadata.name', 'metadata.namespace', 'roleRef', 'subjects']);
      existingData.kind = props.kind;
      const data = _.defaultsDeep({}, props.fixed, existingData, {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: {
          name: '',
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
        },
        subjects: [{
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'User',
          name: '',
        }],
      });
      this.state = { data, inProgress: false };
      this.state.data.kind = 'ClusterRoleBinding';
      this.state.data.metadata.namespace = null;

      this.setKind = this.setKind.bind(this);
      this.setSubject = this.setSubject.bind(this);
      this.save = this.save.bind(this);

      this.setData = patch => this.setState({ data: _.defaultsDeep({}, patch, this.state.data) });
      this.changeName = e => this.setData({ metadata: { name: e.target.value } });
      this.changeNamespace = namespace => this.setData({ metadata: { namespace } });
      this.changeRoleRef = (name, kindId) => this.setData({ roleRef: { name, kind: kindId } });
      this.changeSubjectKind = e => this.setSubject({ kind: e.target.value });
      this.changeSubjectName = e => this.setSubject({ name: e.target.value });
      this.changeSubjectNamespace = namespace => this.setSubject({ namespace });
    }

    setKind() {
      const kind = 'ClusterRoleBinding';
      const patch = { kind };
      if (kind === 'ClusterRoleBinding') {
        patch.metadata = { namespace: null };
      }
      this.setData(patch);
    }

    getSubject() {
      return _.get(this.state.data, `subjects[${this.subjectIndex}]`);
    }

    setSubject(patch) {
      const { kind, name, namespace } = Object.assign({}, this.getSubject(), patch);
      const data = Object.assign({}, this.state.data);
      data.subjects[this.subjectIndex] = kind === 'ServiceAccount' ? { kind, name, namespace } : { apiGroup: 'rbac.authorization.k8s.io', kind, name };
      this.setState({ data });
    }

    save(e) {
      e.preventDefault();

      const { kind, metadata, roleRef } = this.state.data;
      const subject = this.getSubject();

      if (!kind || !metadata.name || !roleRef.kind || !roleRef.name || !subject.kind || !subject.name ||
        (kind === 'RoleBinding' && !metadata.namespace) ||
        (subject.kind === 'ServiceAccount') && !subject.namespace) {
        this.setState({ error: 'Please complete all fields.' });
        return;
      }

      this.setState({ inProgress: true });

      const ko = kindObj(kind);
      (this.props.isCreate
        ? k8sCreate(ko, this.state.data)
        : k8sPatch(ko, { metadata }, [{ op: 'replace', path: `/subjects/${this.subjectIndex}`, value: subject }])
      ).then(
        () => {
          this.setState({ inProgress: false });
          if (metadata.namespace) {
            this.props.setActiveNamespace(metadata.namespace);
          }
          history.push(formatNamespacedRouteForResource('clusterrolebindings'));
        },
        err => this.setState({ error: err.message, inProgress: false })
      );
    }

    render() {
      const { kind, metadata, roleRef } = this.state.data;
      const subject = this.getSubject();
      const { fixed, saveButtonText } = this.props;
      const RoleDropdown = kind === 'RoleBinding' ? NsRoleDropdown : ClusterRoleDropdown;
      const title = `${this.props.titleVerb} ${kindObj(kind).label}`;

      return <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <form className="co-m-pane__body-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{title}</h1>
          <p className="co-m-pane__explanation">Associate a user/group to the selected role to define the type of access and resources that are allowed.</p>

          {/* {!_.get(fixed, 'kind') && <RadioGroup currentValue={kind} items={bindingKinds} onChange={this.setKind} />} */} {/* 라디오 버튼 없앰. 개발자도구 component로 보니까 state.data.kind값만 바꾸어주면 될듯. */}

          <div className="separator"></div>

          <Section label="Role Binding">
            <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">Name</label>
            {_.get(fixed, 'metadata.name')
              ? <ResourceName kind={kind} name={metadata.name} />
              : <input className="form-control" type="text" onChange={this.changeName} placeholder="Role binding name" value={metadata.name} required id="role-binding-name" />}
            {kind === 'RoleBinding' && <div>
              <div className="separator"></div>
              <label htmlFor="ns-dropdown" className="rbac-edit-binding__input-label">Namespace</label>
              <NsDropdown fixed={!!_.get(fixed, 'metadata.namespace')} selectedKey={metadata.namespace} onChange={this.changeNamespace} id="ns-dropdown" />
            </div>}
          </Section>

          <div className="separator"></div>

          <Section label="Role">
            <label htmlFor="role-dropdown" className="rbac-edit-binding__input-label">Role Name</label>
            <RoleDropdown
              fixed={!!_.get(fixed, 'roleRef.name')}
              namespace={metadata.namespace}
              onChange={this.changeRoleRef}
              selectedKey={_.get(fixed, 'roleRef.name') || roleRef.name}
              selectedKeyKind={_.get(fixed, 'roleRef.kind') || roleRef.kind}
              id="role-dropdown"
            />
          </Section>

          <div className="separator"></div>

          <Section label="Subject">
            <RadioGroup currentValue={subject.kind} items={subjectKinds} onChange={this.changeSubjectKind} />
            {subject.kind === 'ServiceAccount' && <div>
              <div className="separator"></div>
              <label htmlFor="subject-namespace" className="rbac-edit-binding__input-label">Subject Namespace</label>
              <NsDropdown id="subject-namespace" selectedKey={subject.namespace} onChange={this.changeSubjectNamespace} />
            </div>}
            <div className="separator"></div>
            <label htmlFor="subject-name" className="rbac-edit-binding__input-label">Subject Name</label>
            <input className="form-control" type="text" onChange={this.changeSubjectName} placeholder="Subject name" value={subject.name} required id="subject-name" />
          </Section>

          <div className="separator"></div>

          <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
            <button type="submit" className="btn btn-primary" id="save-changes">{saveButtonText || 'Create Binding'}</button>
            <Link to={formatNamespacedRouteForResource('rolebindings')} className="btn btn-default" id="cancel">Cancel</Link>
          </ButtonBar>
        </form>
      </div>;
    }
  });

const Details = ({ obj: servicebroker }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={servicebroker} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              {/* {activeDeadlineSeconds && (
                  <React.Fragment>
                    <dt>Active Deadline</dt>
                    <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                  </React.Fragment>
                )} */}
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

// const DetailsForKind = kind =>
//   function DetailsForKind_({ obj }) {
//     return (
//       <React.Fragment>
//         <div className="co-m-pane__body">
//           <SectionHeading text={`${kindForReference(kind)} Overview`} />
//           <ResourceSummary
//             resource={obj}
//             podSelector="spec.podSelector"
//             showNodeSelector={false}
//           />
//         </div>
//       </React.Fragment>
//     );
//   };

export const ClusterRoleBindingList = props => {
  const { kinds } = props;
  const Row = ClusterRoleBindingRow(kinds[0]);
  Row.displayName = 'ClusterRoleBindingRow';
  return <List {...props} Header={ClusterRoleBindingHeader} Row={Row} />;
};
ClusterRoleBindingList.displayName = ClusterRoleBindingList;

export const ClusterRoleBindingsPage = props => (
  <ListPage
    {...props}
    ListComponent={ClusterRoleBindingList}
    canCreate={true}
    kind="ClusterRoleBinding"
  />
);
ClusterRoleBindingsPage.displayName = 'ClusterRoleBindingsPage';

export const ClusterRoleBindingsDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'ClusterRoleBinding Details',
        path: props.match.url
      })
    }
    kind="ClusterRoleBinding"
    menuActions={menuActions}
    pages={[
      // navFactory.details(DetailsForKind(props.kind)),
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

ClusterRoleBindingsDetailsPage.displayName = 'ClusterRoleBindingsDetailsPage';

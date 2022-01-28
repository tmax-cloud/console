import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import * as classNames from 'classnames';
import { ActionGroup, Button } from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';
import { FLAGS } from '@console/shared/src/constants';
import { ClusterRoleBindingModel, RoleBindingModel } from '../../models';
import { getQN, k8sCreate, k8sPatch, referenceFor } from '../../module/k8s';
import * as UIActions from '../../actions/ui';
import { MultiListPage, Table, TableRow, TableData } from '../factory';
import { RadioGroup } from '../radio';
import { confirmModal } from '../modals';
import { ButtonBar, Kebab, Firehose, ListDropdown, MsgBox, NsDropdown, ResourceKebab, ResourceLink, ResourceName, StatusBox, getQueryArgument, history, kindObj, resourceObjPath, useAccessReview, getNamespace } from '../utils';
import { isSystemRole } from './index';
import { connectToFlags, flagPending } from '../../reducers/features';
import { useTranslation, withTranslation } from 'react-i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { pluralToKind } from '../hypercloud/form';
import { isSingleClusterPerspective } from '@console/internal/hypercloud/perspectives';

const bindingKind = binding => (binding.metadata.namespace ? 'RoleBinding' : 'ClusterRoleBinding');

// Split each binding into one row per subject
export const flatten = resources =>
  _.flatMap(resources, resource => {
    const ret = [];

    _.each(resource.data, binding => {
      if (!binding) {
        return undefined;
      }
      if (_.isEmpty(binding.subjects)) {
        const subject = { kind: '-', name: '-' };
        return ret.push(Object.assign({}, binding, { subject }));
      }
      _.each(binding.subjects, (subject, subjectIndex) => {
        ret.push(
          Object.assign({}, binding, {
            subject,
            subjectIndex,
            rowKey: `${getQN(binding)}|${subject.kind}|${subject.name}${subject.namespace ? `|${subject.namespace}` : ''}`,
          }),
        );
      });
    });

    return ret;
  });

const menuActions = ({ subjectIndex, subjects }, startImpersonate) => {
  const subject = subjects[subjectIndex];

  const { t } = useTranslation();

  const actions = [
    (kind, obj) => ({
      label: `${kind.kind === 'RoleBinding' ? t('SINGLE:MSG_ROLEBINDINGS_DUPLICATEROLEBINDING_1') : t('SINGLE:MSG_ROLEBINDINGS_DUPLICATEROLEBINDING_2')}`,
      href: `${resourceObjPath(obj, kind.kind)}/copy?subjectIndex=${subjectIndex}`,
      // Only perform access checks when duplicating cluster role bindings.
      // It's not practical to check namespace role bindings since we don't know what namespace the user will pick in the form.
      accessReview: _.get(obj, 'metadata.namespace') ? null : { group: kind.apiGroup, resource: kind.plural, verb: 'create' },
    }),
    (kind, obj) => ({
      label: t('COMMON:MSG_MAIN_ACTIONBUTTON_39', { 0: ResourceLabel(kind, t) }),
      href: `${resourceObjPath(obj, kind.kind)}/edit?subjectIndex=${subjectIndex}`,
      accessReview: {
        group: kind.apiGroup,
        resource: kind.plural,
        name: obj.metadata.name,
        namespace: obj.metadata.namespace,
        verb: 'update',
      },
    }),
    subjects.length === 1
      ? Kebab.factory.Delete
      : (kind, binding) => ({
          label: t('COMMON:MSG_MAIN_ACTIONBUTTON_40', { 0: ResourceLabel(kind, t) }),
          callback: () =>
            confirmModal({
              title: t('COMMON:MSG_MAIN_ACTIONBUTTON_40', { 0: ResourceLabel(kind, t) }),
              message: t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_2', { 0: subject.name, 1: ResourceLabel(modelFor(subject.kind), t) }),
              btnText: t('COMMON:MSG_MAIN_ACTIONBUTTON_41'),
              executeFn: () => k8sPatch(kind, binding, [{ op: 'remove', path: `/subjects/${subjectIndex}` }]),
            }),
          accessReview: {
            group: kind.apiGroup,
            resource: kind.plural,
            name: binding.metadata.name,
            namespace: binding.metadata.namespace,
            verb: 'patch',
          },
        }),
  ];

  if (subject.kind === 'User' || subject.kind === 'Group') {
    actions.unshift(() => ({
      label: t(subject.kind === 'User' ? 'COMMON:MSG_MAIN_ACTIONBUTTON_18' : 'COMMON:MSG_MAIN_ACTIONBUTTON_43', { 0: subject.name }),
      needTranslate: false,
      // label: `Impersonate ${subject.kind} "${subject.name}"`,
      callback: () => startImpersonate(subject.kind, subject.name),
    }));
  }

  return actions;
};

const tableColumnClasses = [classNames('col-md-3', 'col-sm-4', 'col-xs-6'), classNames('col-md-3', 'col-sm-4', 'hidden-xs'), classNames('col-lg-2', 'col-md-3', 'hidden-sm', 'hidden-xs'), classNames('col-lg-2', 'hidden-md', 'hidden-sm', 'hidden-xs'), classNames('col-lg-2', 'col-md-3', 'col-sm-4', 'col-xs-6'), Kebab.columnClass];

const RoleBindingsTableHeader = t => [
  {
    title: t('COMMON:MSG_DETAILS_TABROLEBINDINGS_TABLEHEADER_1'),
    sortField: 'metadata.name',
    transforms: [sortable],
    props: { className: tableColumnClasses[0] },
  },
  {
    title: t('COMMON:MSG_MAIN_TABLEHEADER_105'),
    sortField: 'roleRef.name',
    transforms: [sortable],
    props: { className: tableColumnClasses[1] },
  },
  {
    title: t('COMMON:MSG_DETAILS_TABROLEBINDINGS_TABLEHEADER_3'),
    sortField: 'subject.kind',
    transforms: [sortable],
    props: { className: tableColumnClasses[2] },
  },
  {
    title: t('COMMON:MSG_DETAILS_TABROLEBINDINGS_TABLEHEADER_4'),
    sortField: 'subject.name',
    transforms: [sortable],
    props: { className: tableColumnClasses[3] },
  },
  {
    title: t('COMMON:MSG_DETAILS_TABROLEBINDINGS_TABLEHEADER_5'),
    sortField: 'metadata.namespace',
    transforms: [sortable],
    props: { className: tableColumnClasses[4] },
  },
  {
    title: '',
    props: { className: tableColumnClasses[5] },
  },
];

RoleBindingsTableHeader.displayName = 'RoleBindingsTableHeader';

export const BindingName = ({ binding }) => {
  <ResourceLink kind={bindingKind(binding)} name={binding.metadata.name} namespace={binding.metadata.namespace} className="co-resource-item__resource-name" />;
};

export const BindingKebab = connect(null, {
  startImpersonate: UIActions.startImpersonate,
})(({ binding, startImpersonate }) => (binding.subjects ? <ResourceKebab actions={menuActions(binding, startImpersonate)} kind={bindingKind(binding)} resource={binding} /> : null));

export const RoleLink = ({ binding }) => {
  const kind = binding.roleRef.kind;

  // Cluster Roles have no namespace and for Roles, the Role's namespace matches the Role Binding's namespace
  const ns = kind === 'ClusterRole' ? undefined : binding.metadata.namespace;
  return <ResourceLink kind={kind} name={binding.roleRef.name} namespace={ns} />;
};

const RoleBindingsTableRow = ({ obj: binding, index, key, style }) => {
  return (
    <TableRow id={binding.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={bindingKind(binding)} name={binding.metadata.name} namespace={binding.metadata.namespace} className="co-resource-item__resource-name" />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <RoleLink binding={binding} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>{binding.subject.kind}</TableData>
      <TableData className={classNames(tableColumnClasses[3], 'co-break-word')}>{binding.subject.name}</TableData>
      <TableData className={classNames(tableColumnClasses[4], 'co-break-word')}>{binding.metadata.namespace ? <ResourceLink kind="Namespace" name={binding.metadata.namespace} /> : 'All Namespaces'}</TableData>
      <TableData className={tableColumnClasses[5]}>
        <BindingKebab binding={binding} />
      </TableData>
    </TableRow>
  );
};

const EmptyMsg = () => {
  const { t } = useTranslation();
  return <MsgBox title={t('COMMON:MSG_DETAILS_TABDETAILS_ROLEBINDINGS_1')} detail={t('COMMON:MSG_DETAILS_TABDETAILS_ROLEBINDINGS_2')} />;
};

export const BindingsList = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Role Bindings" EmptyMsg={EmptyMsg} Header={RoleBindingsTableHeader.bind(null, t)} Row={RoleBindingsTableRow} virtualize />;
};

export const bindingType = binding => {
  if (!binding) {
    return undefined;
  }
  if (binding.roleRef.name.startsWith('system:')) {
    return 'system';
  }
  return binding.metadata.namespace ? 'namespace' : 'cluster';
};

const roleResources = [
  { kind: 'RoleBinding', namespaced: true },
  { kind: 'ClusterRoleBinding', namespaced: false, optional: true },
];

const rowFilters = t => {
  return [
    {
      filterGroupName: t('COMMON:MSG_COMMON_FILTER_15'),
      type: 'role-binding-kind',
      reducer: bindingType,
      itemsGenerator: ({ ClusterRoleBinding: data }) => {
        const items = [
          { id: 'namespace', title: 'Namespace Role Bindings' },
          { id: 'system', title: 'System Role Bindings' },
        ];
        if (data && data.loaded && !data.loadError) {
          items.unshift({ id: 'cluster', title: 'Cluster-wide Role Bindings' });
        }
        return items;
      },
    },
  ];
};

export const RoleBindingsPage = ({ namespace = undefined, showTitle = true, mock = false, staticFilters = undefined, createPath = '/k8s/cluster/rolebindings/~new', single = false, displayTitleRow = true }) => {
  const { t } = useTranslation();

  const pages = isSingleClusterPerspective()
    ? null
    : [
        {
          href: 'rolebindings',
          name: t('COMMON:MSG_LNB_MENU_76'),
        },
        {
          href: 'rolebindingclaims',
          name: t('COMMON:MSG_LNB_MENU_101'),
        },
      ];

  const ko = kindObj(pluralToKind('rolebindings'));
  const { namespaced, plural } = ko;
  //const usedNamespace = !namespace && namespaced ? _.get(match, 'params.ns') : namespace;
  const usedNamespace = namespace;

  let multiNavBaseURL;
  if (namespaced) {
    if (usedNamespace) {
      multiNavBaseURL = `/k8s/ns/${usedNamespace}`;
    } else {
      multiNavBaseURL = `/k8s/all-namespaces`;
    }
  } else {
    multiNavBaseURL = `/k8s/cluster`;
  }

  if (single) {
    return (
      <MultiListPage
        canCreate={!mock}
        createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel(RoleBindingModel, t) })}
        createProps={{
          to: createPath,
        }}
        mock={mock}
        filterLabel="by role or subject"
        flatten={flatten}
        label={t('COMMON:MSG_LNB_MENU_76')}
        ListComponent={BindingsList}
        namespace={namespace}
        resources={roleResources}
        rowFilters={staticFilters ? [] : rowFilters.bind(null, t)()}
        staticFilters={staticFilters}
        showTitle={showTitle}
        displayTitleRow={displayTitleRow}
        textFilter="role-binding"
        title={t('COMMON:MSG_LNB_MENU_76')}
        isClusterScope
      />
    );
  }

  return (
    <MultiListPage
      canCreate={!mock}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel(RoleBindingModel, t) })}
      createProps={{
        to: createPath,
      }}
      mock={mock}
      filterLabel="by role or subject"
      flatten={flatten}
      label={t('COMMON:MSG_LNB_MENU_76')}
      ListComponent={BindingsList}
      namespace={namespace}
      resources={roleResources}
      rowFilters={staticFilters ? [] : rowFilters.bind(null, t)()}
      staticFilters={staticFilters}
      showTitle={showTitle}
      displayTitleRow={displayTitleRow}
      textFilter="role-binding"
      title={t('COMMON:MSG_LNB_MENU_76')}
      isClusterScope
      multiNavPages={pages}
      multiNavBaseURL={multiNavBaseURL}
    />
  );
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

  const { t } = useTranslation();
  return <ListDropdown {...props} dataFilter={roleFilter} desc="Namespace Roles (Role)" resources={resources} placeholder={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_13')} />;
};
const NsRoleDropdown = connectToFlags(FLAGS.OPENSHIFT)(NsRoleDropdown_);

const ClusterRoleDropdown = props => {
  const { t } = useTranslation();
  return <ListDropdown {...props} dataFilter={role => !isSystemRole(role)} desc="Cluster-wide Roles (ClusterRole)" resources={[{ kind: 'ClusterRole' }]} placeholder={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_13')} />;
};

const bindingKinds = t => [
  {
    value: 'RoleBinding',
    title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_2'),
    desc: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_3'),
  },
  {
    value: 'ClusterRoleBinding',
    title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_4'),
    desc: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_5'),
  },
];
const subjectKinds = t => [
  { value: 'User', title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_15') },
  { value: 'Group', title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_16') },
  { value: 'ServiceAccount', title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_17') },
];

const Section = ({ label, children }) => (
  <div>
    <div className="co-form-section__label">{label}</div>
    <div className="co-form-subsection">{children}</div>
  </div>
);

const BaseEditRoleBinding = connect(null, { setActiveNamespace: UIActions.setActiveNamespace })(
  withTranslation()(
    class BaseEditRoleBinding_ extends React.Component {
      constructor(props) {
        super(props);

        this.subjectIndex = props.subjectIndex || 0;

        const existingData = _.pick(props.obj, ['metadata.name', 'metadata.namespace', 'roleRef', 'subjects']); //_.pick 동작 확인 필요
        if (props.obj !== undefined) {
          existingData.kind = props.obj.kind;
        }
        const data = _.defaultsDeep(
          existingData,
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'RoleBinding',
            metadata: {
              name: '',
            },
            roleRef: {
              apiGroup: 'rbac.authorization.k8s.io',
            },
            subjects: [
              {
                apiGroup: 'rbac.authorization.k8s.io',
                kind: 'User',
                name: '',
              },
            ],
          },
          props.fixed,
          {},
        );
        this.state = { data, inProgress: false };

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

      setKind(e) {
        const kind = e.target.value;
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

        if (!kind || !metadata.name || !roleRef.kind || !roleRef.name || !subject.kind || !subject.name || (kind === 'RoleBinding' && !metadata.namespace) || (subject.kind === 'ServiceAccount' && !subject.namespace)) {
          this.setState({ error: 'Please complete all fields.' });
          return;
        }

        this.setState({ inProgress: true });

        const ko = kindObj(kind);
        (this.props.isCreate ? k8sCreate(ko, this.state.data) : k8sPatch(ko, { metadata }, [{ op: 'replace', path: `/subjects/${this.subjectIndex}`, value: subject }])).then(
          obj => {
            this.setState({ inProgress: false });
            if (metadata.namespace) {
              this.props.setActiveNamespace(metadata.namespace);
            }
            history.push(resourceObjPath(obj, referenceFor(obj)));
          },
          err => this.setState({ error: err.message, inProgress: false }),
        );
      }

      render() {
        const { kind, metadata, roleRef } = this.state.data;
        const subject = this.getSubject();
        const { fixed, saveButtonText, t } = this.props;
        const RoleDropdown = kind === 'RoleBinding' ? NsRoleDropdown : ClusterRoleDropdown;
        const title = t(this.props.titleVerb, { 0: ResourceLabel({ kind: kind }, t) });

        return (
          <div className="co-m-pane__body">
            <Helmet>
              <title>{title}</title>
            </Helmet>
            <form className="co-m-pane__body-group co-m-pane__form" onSubmit={this.save}>
              <h1 className="co-m-pane__heading">{title}</h1>
              <p className="co-m-pane__explanation">{t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV1_1')}</p>

              {!_.get(fixed, 'kind') && (
                <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_1')}>
                  <RadioGroup currentValue={kind} items={bindingKinds.bind(null, t)()} onChange={this.setKind} />
                </Section>
              )}

              <div className="co-form-section__separator" />

              <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_6')}>
                <div className="form-group">
                  <label htmlFor="role-binding-name" className="co-required">
                    {t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_7')}
                  </label>
                  {_.get(fixed, 'metadata.name') ? <ResourceName kind={kind} name={metadata.name} /> : <input className="pf-c-form-control" type="text" onChange={this.changeName} placeholder={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_8')} value={metadata.name} required id="role-binding-name" />}
                </div>
                {kind === 'RoleBinding' && (
                  <div className="form-group">
                    <label htmlFor="ns-dropdown" className="co-required">
                      {t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_9')}
                    </label>
                    <NsDropdown fixed={!!_.get(fixed, 'metadata.namespace')} selectedKey={metadata.namespace} onChange={this.changeNamespace} id="ns-dropdown" />
                  </div>
                )}
              </Section>

              <div className="co-form-section__separator" />

              <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_11')}>
                <div className="form-group">
                  <label htmlFor="role-dropdown" className="co-required">
                    {t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_12')}
                  </label>
                  <RoleDropdown fixed={!!_.get(fixed, 'roleRef.name')} namespace={metadata.namespace} onChange={this.changeRoleRef} selectedKey={_.get(fixed, 'roleRef.name') || roleRef.name} selectedKeyKind={_.get(fixed, 'roleRef.kind') || roleRef.kind} id="role-dropdown" />
                </div>
              </Section>

              <div className="co-form-section__separator" />

              <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_14')}>
                <div className="form-group">
                  <RadioGroup currentValue={subject.kind} items={subjectKinds.bind(null, t)()} onChange={this.changeSubjectKind} />
                </div>
                {subject.kind === 'ServiceAccount' && (
                  <div className="form-group">
                    <label htmlFor="subject-namespace" className="co-required">
                      {t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_20')}
                    </label>
                    <NsDropdown id="subject-namespace" selectedKey={subject.namespace} onChange={this.changeSubjectNamespace} />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="subject-name" className="co-required">
                    {t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_18')}
                  </label>
                  <input className="pf-c-form-control" type="text" onChange={this.changeSubjectName} placeholder={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_19')} value={subject.name} required id="subject-name" />
                </div>
              </Section>

              <div className="co-form-section__separator" />

              <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
                <ActionGroup className="pf-c-form">
                  <Button type="submit" id="save-changes" variant="primary">
                    {isCreatePage(this.state.data.metadata) ? t('COMMON:MSG_COMMON_BUTTON_COMMIT_1') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')}
                  </Button>
                  <Button onClick={history.goBack} id="cancel" variant="secondary">
                    {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
                  </Button>
                </ActionGroup>
              </ButtonBar>
            </form>
          </div>
        );
      }
    },
  ),
);

export const CreateRoleBinding = ({ match: { params }, location }) => {
  const searchParams = new URLSearchParams(location.search);
  const roleKind = searchParams.get('rolekind');
  const roleName = searchParams.get('rolename');
  const metadata = { namespace: UIActions.getActiveNamespace() };
  const clusterAllowed = useAccessReview({
    group: ClusterRoleBindingModel.apiGroup,
    resource: ClusterRoleBindingModel.plural,
    verb: 'create',
  });
  const fixed = {
    kind: params.ns || roleKind === 'Role' || !clusterAllowed ? 'RoleBinding' : undefined,
    metadata: { namespace: params.ns },
    roleRef: { kind: roleKind, name: roleName },
  };
  return <BaseEditRoleBinding metadata={metadata} fixed={fixed} isCreate={true} titleVerb="COMMON:MSG_MAIN_CREATEBUTTON_1" />;
};

const getSubjectIndex = () => {
  const subjectIndex = getQueryArgument('subjectIndex') || '0';
  return parseInt(subjectIndex, 10);
};

const BindingLoadingWrapper = props => {
  const fixed = {};
  _.each(props.fixedKeys, k => (fixed[k] = _.get(props.obj.data, k)));
  return (
    <StatusBox {...props.obj}>
      <BaseEditRoleBinding {...props} obj={props.obj.data} fixed={fixed} />
    </StatusBox>
  );
};

export const EditRoleBinding = ({ match: { params }, kind }) => (
  <Firehose resources={[{ kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
    <BindingLoadingWrapper fixedKeys={['kind', 'metadata', 'roleRef']} subjectIndex={getSubjectIndex()} titleVerb="COMMON:MSG_MAIN_ACTIONBUTTON_15" saveButtonText="Save" />
  </Firehose>
);

export const CopyRoleBinding = ({ match: { params }, kind }) => (
  <Firehose resources={[{ kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
    <BindingLoadingWrapper isCreate={true} fixedKeys={['kind']} subjectIndex={getSubjectIndex()} titleVerb={`${kind === 'RoleBinding' ? 'SINGLE:MSG_ROLEBINDINGS_DUPLICATEROLEBINDING_1' : 'SINGLE:MSG_ROLEBINDINGS_DUPLICATEROLEBINDING_2'}`} /> {/* TODO: 'Duplicate {{0}} 이라는 스트링 나오면 적용해야함 */}
  </Firehose>
);

export const isCreatePage = metadata => {
  return !_.has(metadata, 'selfLink');
};

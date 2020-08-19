/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import * as fuzzy from 'fuzzysearch';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind, k8sList, k8sGet } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { ValueEditor } from '../utils/value-editor';
import * as PropTypes from 'prop-types';
import { NsDropdown } from '../RBAC/bindings';
import { connectToFlags, FLAGS, flagPending } from '../../features';
import * as classNames from 'classnames';
import { Dropdown, Firehose, ResourceName, LoadingInline, ResourceLink } from '../utils';

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
      this.props.onChange(name, kindLabel, this.props.id);
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

    // Namespace Role Binding 생성인데 Cluster Role 서비스만 에러일 때 롤 조회도 안됨.
    // if (loadError) {
    //   this.setState({
    //     title: <div className="cos-error-title">{this.props.t('ADDITIONAL:ERRORLOADING', { something: this.props.t(`CONTENT:${nextProps.desc.toUpperCase()}`) })}</div>,
    //   });
    //   return;
    // }

    // if (!loaded) {
    //   return;
    // }

    const state = {};

    const { resources, dataFilter } = nextProps;

    // Namespace Role Binding 생성일 때 Cluster Role이랑 Role 서비스 둘 다 오류일 때만 에러 표시되도록
    if (resources.hasOwnProperty('Role') && resources.hasOwnProperty('ClusterRole')) {
      if (resources.Role.loaded === false && resources.ClusterRole.loaded === false && loadError) {
        this.setState({
          title: <div className="cos-error-title">{this.props.t('ADDITIONAL:ERRORLOADING', { something: this.props.t(`CONTENT:${nextProps.desc.toUpperCase()}`) })}</div>,
        });
        return;
      }
    } else {
      if (loadError) {
        this.setState({
          title: <div className="cos-error-title">{this.props.t('ADDITIONAL:ERRORLOADING', { something: this.props.t(`CONTENT:${nextProps.desc.toUpperCase()}`) })}</div>,
        });
        return;
      }
      if (!loaded) {
        return;
      }
    }

    state.items = {};
    _.each(resources, ({ data }, kindLabel) => {
      _.reduce(
        data,
        (acc, resource) => {
          if (!dataFilter || dataFilter(resource)) {
            acc[`${resource.metadata.name}-${kindLabel}`] = { kindLabel, name: resource.metadata.name };
          }
          return acc;
        },
        state.items,
      );
    });

    const { selectedKey } = this.state;
    if (Object.keys(state.items).length === 0 || this.props.selectedKey == null) {
      selectedKey = undefined;
      state.selectedKey = undefined;
    }

    // did we switch from !loaded -> loaded ?
    if (!this.props.loaded && !selectedKey) {
      state.title = <span className="text-muted">{nextProps.placeholder}</span>;
    }

    if (selectedKey) {
      const item = state.items[selectedKey];
      // item may not exist if selectedKey is a role and then user switches to creating a ClusterRoleBinding
      if (item) {
        state.title = <ResourceName kind={item.kindLabel} name={item.name} />;
      } else {
        // state.selectedKey = undefined;
        state.title = <span className="text-muted">{nextProps.placeholder}</span>;
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

    _.each(this.state.items, (v, key) => (items[key] = <ResourceName kind={v.kindLabel} name={v.name} />));

    const { selectedKey } = this.state;

    const Component = fixed ? items[selectedKey] : <Dropdown autocompleteFilter={this.autocompleteFilter} autocompletePlaceholder={placeholder} items={items} sortedItemKeys={sortedItems} selectedKey={selectedKey} title={this.state.title} onChange={this.onChange} id={id} menuClassName="dropdown-menu--text-wrap" />;

    return (
      <div>
        {Component}
        {/* {loaded && _.isEmpty(items) && (
          <p className="alert alert-info">
            <span className="pficon pficon-info" aria-hidden="true"></span>
            {(this.props.t('ADDITIONAL:NOFOUNDORDEFINED'), { something: desc })}
          </p>
        )} */}
      </div>
    );
  }
}

export const ListDropdown = props => {
  const resources = _.map(props.resources, resource => _.assign({ isList: true, prop: resource.kind }, resource));
  return (
    <Firehose resources={resources}>
      <ListDropdown_ {...props} />
    </Firehose>
  );
};

ListDropdown.propTypes = {
  dataFilter: PropTypes.func,
  desc: PropTypes.string,
  // specify both key/kind
  selectedKey: PropTypes.string,
  selectedKeyKind: PropTypes.string,
  fixed: PropTypes.bool,
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      kind: PropTypes.string.isRequired,
      namespace: PropTypes.string,
    }),
  ).isRequired,
  placeholder: PropTypes.string,
};

const TaskDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }
  const kind = openshiftFlag ? 'Project' : 'Task';

  const resources = props.namespace ? [{ kind, namespace: props.namespace }] : [];
  const { t } = props;
  return <ListDropdown {...props} desc="Task" resources={resources} selectedKeyKind={kind} placeholder={t('STRING:PIPELINE-CREATE_2')} />;
};

const TaskDropdown = connectToFlags(FLAGS.OPENSHIFT)(TaskDropdown_);

const PipelineResourceDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }
  const kind = openshiftFlag ? 'Project' : 'PipelineResource';

  // const resources = [{ kind, namespace: props.namespace || null }];
  const resources = props.namespace ? [{ kind, namespace: props.namespace }] : [];
  const { t } = props;
  return <ListDropdown {...props} desc="PipelineResource" resources={resources} selectedKeyKind={kind} placeholder={t('STRING:PIPELINE-CREATE_3')} />;
};

const PipelineResourceDropdown = connectToFlags(FLAGS.OPENSHIFT)(PipelineResourceDropdown_);

const ServiceAccountDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }
  const kind = openshiftFlag ? 'Project' : 'ServiceAccount';
  // const resources = [{ kind, namespace: props.namespace }];
  const resources = props.namespace ? [{ kind, namespace: props.namespace }] : [];
  const { t } = props;
  return <ListDropdown {...props} desc="ServiceAccount" resources={resources} selectedKeyKind={kind} placeholder={t('STRING:TASKRUN-CREATE_6')} />;
};

const ServiceAccountDropdown = connectToFlags(FLAGS.OPENSHIFT)(ServiceAccountDropdown_);

/*
{
  "apiVersion": "tekton.dev/v1beta1",
  "kind": "TaskRun",
  "metadata": {
    "name": "taskrun-with-parameters"
  },
  "spec": {
    "params": [
      {
        "name": "flags",
        "type": "array",
        "default": [
          "hello",
          "world"
        ]
      },
      {
        "name": "someURL",
        "type": "string"
      }
    ],
    "resources": {
      "inputs": [
        {
          "name": "input-resource",
          "resourceRef": {
            "name": "real-resource-1"
          }
        }
      ],
      "outputs": [
        {
          "name": "output-resource",
          "resourceRef": {
            "name": "real-resource-2"
          }
        }
      ]
    },
    "taskRef": {
      "name": "task-name-1"
    },
    "serviceAccountName": "sa-1",
    "workspaces": [
      {
        "name": "workspace-1",
        "persistentVolumeClaim": {
          "claimName": "mypvc"
        },
        "subPath": "foo"
      }
    ],
    "timeout": "1h30m"
  }
}
*/
class TaskRunFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingTaskRun = _.pick(props.obj, ['metadata', 'type']);
    const TaskRun = _.defaultsDeep({}, props.fixed, existingTaskRun, {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'TaskRun',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        params: [],
      },
      resources: {},
      taskRef: {
        name: '',
      },
    });
    /*
apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
    name: example-taskrun
    namespace: example-namespace
spec:
    serviceAccountName: example-san
    taskRef:
        name: example-task
    inputs:
        resources:
            - name: git-source
              resourceRef:
                name: example-pipeline-resource-git
        params:
            - name: example-string
              value: input-string
    outputs:
        resources:
            - name: output-image
              resourceRef:
                name: example-pipeline-resource-image
*/
    this.state = {
      TaskRunTypeAbstraction: this.props.TaskRunTypeAbstraction,
      TaskRun: TaskRun,
      inProgress: false,
      type: 'form',
      name: '',
      timeout: '',
      selectedNamespace: '',
      taskList: [],
      selectedTask: '',
      paramList: [],
      arrayParamList: [],
      inputList: [],
      outputList: [],
      pipelineResourceList: [],
      serviceAccountList: [],
      selectedServiceAccount: '',
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.onTaskChanged = this.onTaskChanged.bind(this);
    this.onParamChanged = this.onParamChanged.bind(this);
    this.onPipelineResourceChanged = this.onPipelineResourceChanged.bind(this);
    this.onServiceAccountChanged = this.onServiceAccountChanged.bind(this);
    this.onTimeoutChanged = this.onTimeoutChanged.bind(this);
    this._updateArrayParms = this._updateArrayParms.bind(this);
    this.changeTimeoutFormat = this.changeTimeoutFormat.bind(this);

    this.getTaskList = this.getTaskList.bind(this);
    this.getPipelineResourceList = this.getPipelineResourceList.bind(this);
    this.getServiceAccountList = this.getServiceAccountList.bind(this);
    this.getTaskDetails = this.getTaskDetails.bind(this);

    this.save = this.save.bind(this);
  }

  componentDidMount() {}

  onNamespaceChanged(namespace) {
    this.setState({ selectedNamespace: namespace, selectedServiceAccount: null, selectedTask: null, paramList: [], arrayParamList: [], outputList: [], inputList: [] }, () => {
      // this.getTaskList();
      this.getPipelineResourceList();
      this.getServiceAccountList();
    });
  }
  onTaskChanged(taskName) {
    this.setState({ selectedTask: String(taskName) }, () => {
      this.getTaskDetails();
    });
  }

  onNameChanged(e) {
    this.setState({ name: e.target.value });
  }
  onTimeoutChanged(e) {
    this.setState({ timeout: e.target.value });
  }

  onParamChanged(e, paramIndex) {
    this.setState({
      paramList: this.state.paramList.map((item, idx) => {
        return idx === paramIndex
          ? {
              ...item,
              value: e.target.value,
            }
          : item;
      }),
    });
  }
  onPipelineResourceChanged(pipelineName, kindLabel, id) {
    const [, type, resourceIdx] = id.split('-');
    this.setState({
      [`${type}List`]: this.state[`${type}List`].map((item, idx) => {
        return idx == resourceIdx
          ? {
              ...item,
              selectedPR: pipelineName,
            }
          : item;
      }),
    });
  }
  onServiceAccountChanged = serviceAccountName => {
    this.setState({ selectedServiceAccount: String(serviceAccountName) });
  };
  _updateArrayParms({ values, editorIdx }, nameValueId) {
    const pl = this.state.arrayParamList.map((item, idx) => {
      return idx === editorIdx
        ? {
            ...item,
            values,
          }
        : item;
    });
    this.setState({
      arrayParamList: this.state.arrayParamList.map((item, idx) => {
        return idx === editorIdx
          ? {
              ...item,
              values,
            }
          : item;
      }),
    });
  }

  getTaskList() {
    const { selectedNamespace } = this.state;
    k8sList(kindObj('Task'), { ns: selectedNamespace }).then(
      taskList => {
        this.setState({
          taskList: taskList.map(item => ({
            name: item.metadata.name,
            task: item,
          })),
          paramList: [],
          arryaParamList: [],
          outputList: [],
          inputList: [],
          selectedTask: null,
        });
      },
      err => {
        this.setState({ error: err.message, inProgress: false });
        this.setState({ taskList: [], paramList: [], arrayParamList: [], outputList: [], inputList: [] });
      },
    );
  }
  getTaskDetails() {
    k8sGet(kindObj('Task'), this.state.selectedTask, this.state.selectedNamespace).then(
      details => {
        //params, resource가 없는경우
        const params = details.spec.params
          ? details.spec.params.map(cur => {
              return {
                name: cur.name,
                type: cur.type,
                default: cur.default || '',
                value: cur.default || '',
                description: cur.description || '',
                isRequired: !cur.default,
              };
            })
          : [];
        const paramList = [];
        const arrayParamList = [];
        params.forEach(item => {
          if (item.type && item.type === 'array') {
            arrayParamList.push({
              values: [[item.default ? item.default : '']],
              ...item,
            });
          } else {
            // string type
            paramList.push({ value: '', ...item });
          }
        });
        const inputList = details.spec.resources ? details.spec.resources.inputs || [] : [];
        const outputList = details.spec.resources ? details.spec.resources.outputs || [] : [];
        inputList.forEach(item => {
          item.selectedPR = null;
          item.isRequired = !item.optional ? true : false;
        });
        outputList.forEach(item => {
          item.selectedPR = null;
          item.isRequired = !item.optional ? true : false;
        });

        this.setState({
          inputList: inputList,
          outputList: outputList,
          paramList: paramList,
          arrayParamList: arrayParamList,
        });
      },
      err => {
        this.setState({ error: err.message, inProgress: false });
        this.setState({ paramList: [], arrayParamList: [], outputList: [], inputList: [] });
      },
    );
  }

  getPipelineResourceList() {
    const { selectedNamespace } = this.state;
    k8sList(kindObj('PipelineResource'), { ns: selectedNamespace })
      .then(reponse => reponse)
      .then(
        data => {
          this.setState({
            pipelineResourceList: data.map(item => ({
              name: item.metadata.name,
            })),
          });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ pipelineResourceList: [] });
        },
      );
  }
  getServiceAccountList() {
    const { selectedNamespace } = this.state;
    k8sList(kindObj('ServiceAccount'), { ns: selectedNamespace }).then(
      data => {
        this.setState({
          serviceAccountList: data.map(item => ({
            name: item.metadata.name,
            serviceAccount: item,
          })),
        });
      },
      err => {
        this.setState({ error: err.message, inProgress: false });
        this.setState({ serviceAccountList: [] });
      },
    );
  }
  changeTimeoutFormat(timeout) {
    timeout = Number(timeout);
    if (timeout == 0) {
      return 0;
    }
    if (timeout >= 60) {
      return `${(timeout - (timeout % 60)) / 60}h${timeout % 60}m`;
    } else return `${timeout}m`;
  }

  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.TaskRun;
    const { name, selectedNamespace, selectedTask, paramList, arrayParamList, inputList, outputList, selectedServiceAccount, timeout } = this.state;
    this.setState({ inProgress: true });
    const newTaskRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'TaskRun',
      metadata: {
        name,
        namespace: selectedNamespace,
      },
      spec: {
        params: paramList
          .filter(item => item.isRequired || item.value)
          .map(item => ({
            name: item.name,
            value: item.value,
          }))
          .concat(
            arrayParamList.map(item => ({
              // TODO : 필수 입력 , 필수 입력 아닌데 입력했을 경우 필터링
              name: item.name,
              value: item.values.map(item => item[0] || item.default || ''),
            })),
          ),
        resources: {
          inputs: inputList.map(item => ({ name: item.name, resourceRef: { name: item.selectedPR || '' } })),
          outputs: outputList.map(item => ({ name: item.name, resourceRef: { name: item.selectedPR || '' } })),
        },
        taskRef: {
          name: selectedTask,
        },
        serviceAccountName: selectedServiceAccount || '',
        timeout: timeout ? this.changeTimeoutFormat(timeout) : '',
      },
    };
    console.log('newTask', newTaskRun);
    const ko = kindObj(kind);

    (this.props.isCreate ? k8sCreate(ko, newTaskRun) : k8sUpdate(ko, newTaskRun, metadata.namespace, newTaskRun.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push(formatNamespacedRouteForResource('taskruns'));
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;
    const { taskList, pipelineResourceList, serviceAccountList, paramList, arrayParamList, inputList, outputList } = this.state;

    const params = paramList.map((item, idx) => {
      return (
        <div className="form-group" key={idx}>
          <label style={{ display: 'block' }} htmlFor={item.name} className={classNames('rbac-edit-binding__input-label', { required: item.isRequired })}>
            {item.name}
          </label>
          <span style={{ display: 'block' }}>{item.description}</span>
          <input
            className="form-control"
            type="text"
            // placeholder={item.default || ''}
            required={item.isRequired}
            onChange={e => {
              this.onParamChanged(e, idx);
            }}
            id={item.name}
            value={item.value}
          />
          {/* TODO: 번역 */}
          {item.default && <span>{`입력하지 않을 경우 태스크 생성 시 설정한 기본 값으로 자동 입력됩니다.`}</span>}
        </div>
      );
    });
    const arrayParams = arrayParamList.map((item, idx) => {
      return (
        <div className="form-group" key={idx}>
          <label style={{ display: 'block' }} htmlFor={item.name} className={classNames('rbac-edit-binding__input-label', { required: item.isRequired })}>
            {item.name}
          </label>
          <span style={{ display: 'block' }}>{item.description}</span>
          <ValueEditor title="false" desc={item.default && `입력하지 않을 경우 태스크 생성 시 설정한 기본 값으로 자동 입력됩니다.`} t={t} values={arrayParamList[idx].values} updateParentData={this._updateArrayParms} editorIdx={idx} />
        </div>
      );
    });

    const inputs = inputList.map((item, idx) => {
      return (
        <div key={idx}>
          <label htmlFor={item.name} className="rbac-edit-binding__input-label">{`${item.name} ( ${item.type} )`}</label>
          <PipelineResourceDropdown id={`pipeline-input-${idx}`} t={t} namespace={this.state.selectedNamespace} onChange={this.onPipelineResourceChanged} />
          {/* <select
            id={item.name}
            className="form-control"
            onChange={e => {
              this.onPipelineResourceChanged(e, idx, 'input');
            }}
            required={item.isRequired}
          >
            {pipelineResourceList.map(cur => {
              return <option value={cur.name}>{cur.name}</option>;
            })}
          </select> */}
        </div>
      );
    });
    const outputs = outputList.map((item, idx) => {
      return (
        <div key={idx}>
          <label htmlFor={item.name} className="rbac-edit-binding__input-label">
            {`${item.name} ( ${item.type} )`}
          </label>
          <PipelineResourceDropdown id={`pipeline-output-${idx}`} t={t} namespace={this.state.selectedNamespace} onChange={this.onPipelineResourceChanged} />
        </div>
      );
    });

    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.TaskRun.kind, t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.TaskRun.kind, t) })}</h1>
          {/* <p className="co-m-pane__explanation">Represents an identity for processes that run in a pod.</p> */}

          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onNameChanged} defaultValue={this.state.name} id="taskrun-name" required />
            </Section>
            <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="taskrun-namespace" t={t} onChange={this.onNamespaceChanged} selectedKey={this.state.selectedNamespace} />
            </Section>
            <Section label={t('STRING:PIPELINE-CREATE_2')} isRequired={true}>
              <TaskDropdown id="task-list" t={t} namespace={this.state.selectedNamespace} selectedKey={this.state.selectedTask} onChange={this.onTaskChanged}></TaskDropdown>
            </Section>
            <div className="separator"></div>

            <Section label={t('STRING:TASKRUN-CREATE_0')}>
              {params}
              {arrayParams}
            </Section>
            <div className="separator"></div>

            <Section label={t('CONTENT:INPUTRESOURCE')} isRequired={false}>
              {inputs}
            </Section>
            <div className="separator"></div>
            <Section label={t('CONTENT:OUTPUTRESOURCE')} isRequired={false}>
              {outputs}
            </Section>
            <div className="separator"></div>
            <Section label={t('STRING:TASKRUN-CREATE_2')} isRequired={false}>
              <div style={{ display: 'flex' }}>
                <input className="form-control" type="number" onChange={this.onTimeoutChanged} placeholder={t('STRING:TASKRUN-CREATE_1')} id="timeout" />
                {t('STRING:TASKRUN-CREATE_4')}
              </div>
              <span>{t('STRING:TASKRUN-CREATE_3')}</span>
            </Section>
            <Section label={t('STRING:TASKRUN-CREATE_5')} isRequired={false}>
              <ServiceAccountDropdown id="service-account" t={t} onChange={this.onServiceAccountChanged} namespace={this.state.selectedNamespace} selectedKey={this.state.selectedServiceAccount} />
              <span>You can execute the Task in your TaskRun with a specific set of credentials by specifying a ServiceAccount. If you do not explicitly specify this, the TaskRun executes with the credentials specified in the configmap-defaults ConfigMap. If this default is not specified, TaskRuns will execute with the default service account set for the target namespace.</span>
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('taskruns')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateTaskRun = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <TaskRunFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} TaskRunTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

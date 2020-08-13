/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind, k8sList, k8sGet } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { ValueEditor } from '../utils/value-editor';

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
    this.setState({ selectedNamespace: namespace }, () => {
      this.getTaskList();
      this.getPipelineResourceList();
      this.getServiceAccountList();
    });
  }
  onTaskChanged(e) {
    this.setState({ selectedTask: e.target.value }, () => {
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

  onPipelineResourceChanged(e, resourceIdx, type) {
    this.setState({
      [`${type}List`]: this.state[`${type}List`].map((item, idx) => {
        return idx === resourceIdx
          ? {
              ...item,
              selectedPR: e.target.value,
            }
          : item;
      }),
    });
  }
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
        if (taskList.length > 0) {
          this.setState(
            {
              taskList: taskList.map(item => ({
                name: item.metadata.name,
                task: item,
              })),
              selectedTask: taskList[0].metadata.name,
            },
            () => {
              this.getTaskDetails();
            },
          );
        } else {
          this.setState({ taskList: [], paramList: [], outputList: [], inputList: [], selectedTask: null });
        }
      },
      err => {
        this.setState({ error: err.message, inProgress: false });
        this.setState({ resourceRefList: [], paramList: [], outputList: [], inputList: [] });
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
                description: cur.description || '',
              };
            })
          : [];
        const paramList = [];
        const arrayParamList = [];
        params.forEach(item => {
          if (item.type && item.type === 'array') {
            arrayParamList.push({
              values: [['']],
              ...item,
            });
          } else {
            paramList.push({ ...item, value: '' });
          }
        });
        const selectedPR = this.state.pipelineResourceList.length > 0 ? this.state.pipelineResourceList[0] : null;
        const inputList = details.spec.resources ? details.spec.resources.inputs || [] : [];
        const outputList = details.spec.resources ? details.spec.resources.outputs || [] : [];
        inputList.forEach(item => {
          item.selectedPR = selectedPR;
        });
        outputList.forEach(item => {
          item.selectedPR = selectedPR;
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
        this.setState({ paramList: [], outputList: [], inputList: [] });
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
          selectedServiceAccount: data.length > 0 ? data[0].metadata.name : '',
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
    }
  }

  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.TaskRun;
    const { name, selectedNamespace, selectedTask, paramList, arrayParamList, inputList, outputList, selectedServiceAccount, timeout } = this.state;
    this.setState({ inProgress: true });
    // const newTaskRun0 = _.assign({}, this.state.TaskRun);
    const newTaskRun = {
      apiVersion: 'tekton.dev/v1alpha1',
      kind: 'TaskRun',
      metadata: {
        name,
        namespace: selectedNamespace,
      },
      spec: {
        params: paramList
          .map(item => ({
            name: item.name,
            value: item.value || '',
          }))
          .concat(
            arrayParamList.map(item => ({
              name: item.name,
              value: item.values.map(item => item[0] || item.default || ''),
            })),
          ),
        resources: {
          inputs: inputList.map(item => ({ name: item.name, resourceRef: { name: item.selectedPR } })),
          outputs: outputList.map(item => ({ name: item.name, resourceRef: { name: item.selectedPR } })),
        },
        taskRef: {
          name: selectedTask,
        },
        serviceAccountName: selectedServiceAccount || '',
        timeout: timeout ? this.changeTimeoutFormat(timeout) : '',
      },
    };
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
          <label style={{ display: 'block' }} htmlFor={item.name} className="rbac-edit-binding__input-label">
            {item.name}
          </label>
          <span style={{ display: 'block' }}>{item.description}</span>
          <input
            className="form-control"
            type="text"
            placeholder={item.default || ''}
            required={!item.default ? true : false}
            onChange={e => {
              this.onParamChanged(e, idx);
            }}
            id={item.name}
          />
          <span>{`입력하지 않을 경우 '${item.default || ''}'(으)로 자동 입력됩니다.`}</span>
        </div>
      );
    });
    const arrayParams = arrayParamList.map((item, idx) => {
      return (
        <div className="form-group" key={idx}>
          <label style={{ display: 'block' }} htmlFor={item.name} className="rbac-edit-binding__input-label">
            {item.name}
          </label>
          <span style={{ display: 'block' }}>{item.description}</span>
          <ValueEditor title="false" desc={`입력하지 않을 경우 '${item.default || ''}'(으)로 자동 입력됩니다.`} valueString={item.default || ''} t={t} values={arrayParamList[idx].values} updateParentData={this._updateArrayParms} editorIdx={idx} />
        </div>
      );
    });

    const inputs = inputList.map((item, idx) => {
      return (
        <div key={idx}>
          <label htmlFor={item.name} className="rbac-edit-binding__input-label">{`${item.name} ( ${item.type} )`}</label>
          <select
            id={item.name}
            className="form-control"
            onChange={e => {
              this.onPipelineResourceChanged(e, idx, 'input');
            }}
            required={item.optional ? true : false}
          >
            {pipelineResourceList.map(cur => {
              return <option value={cur.name}>{cur.name}</option>;
            })}
          </select>
        </div>
      );
    });
    const outputs = outputList.map((item, idx) => {
      return (
        <div key={idx}>
          <label htmlFor={item.name} className="rbac-edit-binding__input-label">
            {`${item.name} ( ${item.type} )`}
          </label>
          <select
            id={item.name}
            className="form-control"
            onChange={e => {
              this.onPipelineResourceChanged(e, idx, 'output');
            }}
            required={item.optional ? true : false}
          >
            {pipelineResourceList.map(cur => {
              return <option value={cur.name}>{cur.name}</option>;
            })}
          </select>
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
              <NsDropdown id="taskrun-namespace" t={t} onChange={this.onNamespaceChanged} />
            </Section>
            <Section label="태스크 선택" isRequired={true}>
              <select id="task-list" onChange={this.onTaskChanged} className="form-control" required>
                {taskList.map(cur => {
                  return <option value={cur.name}>{cur.name}</option>;
                })}
              </select>
            </Section>
            <div className="separator"></div>

            <Section label="태스크 파라미터 값" isRequired={true}>
              {params}
              {arrayParams}
            </Section>
            <div className="separator"></div>

            <Section label="인풋 리소스" isRequired={false}>
              {inputs}
            </Section>
            <div className="separator"></div>

            <Section label="아웃풋 리소스" isRequired={false}>
              {outputs}
            </Section>
            <div className="separator"></div>
            <Section label="타임아웃 실패 시점 설정" isRequired={false}>
              <div style={{ display: 'flex' }}>
                <input className="form-control" type="number" onChange={this.onTimeoutChanged} placeholder="예 : 60, 120, 30" id="timeout" />분
              </div>
              <span>시간 초과 필드를 사용하여 원하는 시간 초과 값을 분 단위로 설정할 수 있습니다. 값이 지정되지 않을 경우, 세계 시간 기준으로 기본 타임아웃 값이 적용됩니다. 값을 0으로 설정 시, 태스크 런이 되지 않습니다.</span>
            </Section>
            <Section label="서비스 어카운트 지정" isRequired={false}>
              <label htmlFor="service-account-list" className="rbac-edit-binding__input-label">
                서비스 어카운트
              </label>
              <select id="service-account-list" onChange={e => this.setState({ selectedServiceAccount: e.target.value })} className="form-control">
                {serviceAccountList.map(cur => {
                  return <option value={cur.name}>{cur.name}</option>;
                })}
              </select>
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

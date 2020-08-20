/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sList, k8sGet, k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput, makeQuery } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { ResourceModalEditor, ParameterModalEditor, VolumeModalEditor, StepModalEditor } from '../utils';
import { FirstSection, SecondSection, PodTemplate, VolumeclaimTemplate } from '../utils/form';

class TaskFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingTask = _.pick(props.obj, ['metadata', 'type']);
    const task = _.defaultsDeep({}, props.fixed, existingTask, {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'Task',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        resources: {
          inputs: [],
          outputs: [],
        },
        params: [],
        volumes: [],
        steps: [],
      },
    });

    const inputError = {
      name: null,
      namespace: null,
      step: null,
    };

    this.state = {
      taskTypeAbstraction: this.props.taskTypeAbstraction,
      namespace: '',
      task: task,
      inProgress: false,
      type: 'form',
      inputResourceNames: '',
      inputResources: '',
      outputResourceNames: '',
      outputResources: '',
      parameterConfigNames: '',
      parameterConfigs: '',
      volumeNames: '',
      volumes: '',
      stepNames: '',
      steps: '',
      inputError: inputError,
      // imageRegistryList: [],
      // imageList: [],
      // imageTagList: [],
      // imageAllTagList: [],
      imageRegistry: '',
      image: '',
      imageTag: '',
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this._updateInputName = this._updateInputName.bind(this);
    this._updateInputResources = this._updateInputResources.bind(this);
    this._updateOutputName = this._updateOutputName.bind(this);
    this._updateOutputResources = this._updateOutputResources.bind(this);
    this._updateParameterConfigName = this._updateParameterConfigName.bind(this);
    this._updateParameterConfigs = this._updateParameterConfigs.bind(this);
    this._updateVolumeName = this._updateVolumeName.bind(this);
    this._updateVolumes = this._updateVolumes.bind(this);
    this._updateStepName = this._updateStepName.bind(this);
    this._updateSteps = this._updateSteps.bind(this);

    this.save = this.save.bind(this);
  }
  componentDidMount() {}

  onNameChanged(event) {
    let task = { ...this.state.task };
    task.metadata.name = String(event.target.value);
    this.setState({ task });
  }
  onNamespaceChanged(namespace) {
    let task = { ...this.state.task };
    task.metadata.namespace = String(namespace);
    this.setState({ task });
    this.setState({ namespace });
  }

  _updateInputName(resources) {
    this.setState({
      inputResourceNames: resources.names,
    });
  }

  _updateInputResources(resources) {
    this.setState({
      inputResources: resources,
    });
  }

  _updateOutputName(resources) {
    this.setState({
      outputResourceNames: resources.names,
    });
  }

  _updateOutputResources(resources) {
    this.setState({
      outputResources: resources,
    });
  }

  _updateParameterConfigName(parameters) {
    this.setState({
      parameterConfigNames: parameters.names,
    });
  }

  _updateParameterConfigs(parameters) {
    this.setState({
      parameterConfigs: parameters,
    });
  }

  _updateVolumeName(volumes) {
    this.setState({
      volumeNames: volumes.names,
    });
  }

  _updateVolumes(volumes) {
    this.setState({
      volumes: volumes,
    });
  }

  _updateStepName(steps) {
    this.setState({
      stepNames: steps.names,
    });
  }

  _updateSteps(steps) {
    this.setState({
      steps: steps,
    });
  }

  save(e) {
    e.preventDefault();
    const t = this.props.t;

    let task = _.cloneDeep(this.state.task);

    if (!task.metadata.name) {
      this.setState({ inputError: { name: t('VALIDATION:EMPTY-INPUT', { something: t(`CONTENT:NAME`) }) } });
      return;
    } else {
      this.setState({ inputError: { name: null } });
    }
    if (!task.metadata.namespace) {
      this.setState({ inputError: { namespace: t('VALIDATION:EMPTY-SELECT', { something: t(`CONTENT:NAMESPACE`) }) } });
      return;
    } else {
      this.setState({ inputError: { namespace: null } });
    }
    if (this.state.steps.length === 0) {
      this.setState({ inputError: { step: t('VALIDATION:EMPTY-LIST', { something: t(`CONTENT:STEP`) }) } });
      return;
    } else {
      this.setState({ inputError: { step: null } });
    }

    this.state.inputResources.length > 0 &&
      this.state.inputResources.forEach(cur => {
        let inputresource = {
          name: cur[0],
          type: cur[1],
          targetPath: cur[2],
          optional: cur[3],
        };
        task.spec.resources.inputs.push(inputresource);
      });

    this.state.outputResources.length > 0 &&
      this.state.outputResources.forEach(cur => {
        let outputresource = {
          name: cur[0],
          type: cur[1],
          targetPath: cur[2],
          optional: cur[3],
        };
        task.spec.resources.outputs.push(outputresource);
      });

    this.state.parameterConfigs.length > 0 &&
      this.state.parameterConfigs.forEach(cur => {
        let defaultValue = [];
        if (cur[2] === 'Array') {
          cur[3].forEach(dv => {
            defaultValue.push(dv[0]);
          });
        }
        let params = {
          name: cur[0],
          description: cur[1],
          type: cur[2].toLowerCase(),
          default: cur[2] === 'String' ? cur[3] : defaultValue,
        };
        task.spec.params.push(params);
      });

    this.state.volumes.length > 0 &&
      this.state.volumes.forEach(cur => {
        let volume = {};
        if (cur[1] === 'emptyDir') {
          volume = {
            name: cur[0],
            emptyDir: {},
          };
        } else if (cur[1] === 'ConfigMap') {
          volume = {
            name: cur[0],
            configMap: {
              name: cur[2],
            },
          };
        } else if (cur[1] === 'Secret') {
          volume = {
            name: cur[0],
            secret: {
              secretName: cur[3],
            },
          };
        }
        task.spec.volumes.push(volume);
      });

    this.state.steps.length > 0 &&
      this.state.steps.forEach(cur => {
        let step = {};
        let volumeMounts = [];
        volumeMounts.push({ name: cur[11], mountPath: cur[12] });
        if (cur[13]) {
          // type: preset
          if (cur[14] === 'Approve') {
            // preset: Approve
            if (cur[15]) {
              // imageType: imageRegistry
              step = {
                name: cur[0].toLowerCase(),
                image: `${cur[1]}/${cur[2]}:${cur[3]}`,
                volumeMounts: volumeMounts, // 여러개 올수 있음
              };
            } else {
              // imageType: free
              step = {
                name: cur[0].toLowerCase(),
                image: cur[16],
                volumeMounts: volumeMounts,
              };
            }
          } else if (cur[14] === 'Notify') {
            // preset: Notify
            let env = ['MAIL_SERVER', 'MAIL_FROM', 'MAIL_SUBJECT', 'MAILCONTENT'].map((val, idx) => ({
              name: val,
              value: cur[idx + 4],
            }));
            if (cur[15]) {
              // imageType: imageRegistry
              step = {
                name: cur[0].toLowerCase(),
                image: `${cur[1]}/${cur[2]}:${cur[3]}`,
                env: env,
                volumeMounts: volumeMounts,
              };
            } else {
              // imageType: free
              step = {
                name: cur[0].toLowerCase(),
                image: cur[16],
                env: env,
                volumeMounts: volumeMounts,
              };
            }
          }
        } else {
          //  type: free
          let env = cur[10].map(val => ({
            name: val[0],
            value: val[1],
          }));
          let command = cur[9].map(val => val[0]);
          let args = cur[8].map(val => val[0]);
          if (cur[15]) {
            // imageType: imageRegistry
            step = {
              name: cur[0].toLowerCase(),
              image: `${cur[1]}/${cur[2]}:${cur[3]}`,
              env: env,
              command: command,
              args: args,
              volumeMounts: volumeMounts,
            };
          } else {
            step = {
              name: cur[0].toLowerCase(),
              image: cur[16],
              env: env,
              command: command,
              args: args,
              volumeMounts: volumeMounts,
            };
          }
        }
        task.spec.steps.push(step);
      });
    console.log(task);
    this.setState({ inProgress: true });

    const ko = kindObj('Task');
    (this.props.isCreate ? k8sCreate(ko, task) : k8sUpdate(ko, task, task.namespace, task.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push(`/k8s/ns/${task.namespace}/tasks`);
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;

    return (
      <div className="form-create co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Task', t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Task', t) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:TASK-CREATE_0')}</p>

          <fieldset disabled={!this.props.isCreate}>
            <FirstSection label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.task.metadata.name} id="task-name" />
              {this.state.inputError.name && <p className="error_text">{this.state.inputError.name}</p>}
            </FirstSection>
            <FirstSection label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="task-namespace" t={t} onChange={this.onNamespaceChanged} />
              {this.state.inputError.namespace && <p className="error_text">{this.state.inputError.namespace}</p>}
            </FirstSection>
            <hr />
            <FirstSection label={t('CONTENT:INPUTRESOURCE')} isRequired={false}>
              <ResourceModalEditor desc={} title="false" valueString="InputResource" t={t} resources={this.state.inputResources} names={this.state.inputResourceNames} visibleData={this._updateInputName} realData={this._updateInputResources} />
            </FirstSection>
            <FirstSection label={t('CONTENT:OUTPUTRESOURCE')} isRequired={false}>
              <ResourceModalEditor desc={} title="false" valueString="OutputResource" t={t} resources={this.state.outputResources} names={this.state.outputResourceNames} visibleData={this._updateOutputName} realData={this._updateOutputResources} />
            </FirstSection>
            <FirstSection label={t('CONTENT:TASKPARAMETER')} isRequired={false}>
              <ParameterModalEditor desc={} title="false" valueString="TaskParameter" t={t} parameters={this.state.parameterConfigs} names={this.state.parameterConfigNames} visibleData={this._updateParameterConfigName} realData={this._updateParameterConfigs} />
            </FirstSection>
            <hr />
            <FirstSection label={t('CONTENT:VOLUME')} isRequired={false}>
              <VolumeModalEditor desc={} title="false" valueString="Volume" t={t} volumes={this.state.volumes} names={this.state.volumeNames} visibleData={this._updateVolumeName} realData={this._updateVolumes} />
            </FirstSection>
            <FirstSection label={t('CONTENT:STEP')} isRequired={true}>
              <StepModalEditor desc={} title="false" valueString="Step" t={t} namespace={this.state.namespace} steps={this.state.steps} names={this.state.stepNames} visibleData={this._updateStepName} realData={this._updateSteps} volumeList={this.state.volumeNames} />
              {this.state.inputError.step && <p className="error_text">{this.state.inputError.step}</p>}
            </FirstSection>

            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('tasks')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateTask = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <TaskFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} taskAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

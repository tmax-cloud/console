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
import { FirstSection, SecondSection, PodTemplate, VolumeclaimTemplate } from '../utils/form';
// import {TaskModal} from './../modals/input-resource-modal';

class TaskFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingTask = _.pick(props.obj, ['metadata', 'type']);
    const task = _.defaultsDeep({}, props.fixed, existingTask, {
      apiVersion: 'v1',
      kind: 'Task',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {},
    });

    this.state = {
      taskTypeAbstraction: this.props.taskTypeAbstraction,
      task: task,
      inProgress: false,
      type: 'form',
      inputResources: [],
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.onInputResource = this.onInputResource.bind(this);
    // this.onLabelChanged = this.onLabelChanged.bind(this);
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
  }
  onInputResource(e) {
    console.log('input resource: ', e);
  }
  save(e) {
    e.preventDefault();

    this.setState({ inProgress: true });
    let task = _.cloneDeep(this.state.task);

    (this.props.isCreate ? k8sCreate(ko, task) : k8sUpdate(ko, task, task.namespace, task.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push(formatNamespacedRouteForResource('tasks'));
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
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.task.metadata.name} id="task-name" required />
            </FirstSection>
            <FirstSection label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="task-namespace" t={t} onChange={this.onNamespaceChanged} />
            </FirstSection>
            <hr />
            <FirstSection label={t('CONTENT:INPUTRESOURCE')} isRequired={false}>
              <div>{/* <ValueEditor desc={t('STRING:CREATE-DEPLOYMENT_0')} title="false" valueString="RunCommand" t={t} values={this.state.inputResources} updateParentData={} /> */}</div>
              <span
                className="btn-link pairs-list__btn"
                onClick={() => {
                  import('./../modals/input-resource-modal').then(m => {
                    m.TaskModal({ onInputResource: this.onInputResource });
                  });
                }}
              >
                <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                {t('CONTENT:ADDMORE')}
              </span>
            </FirstSection>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('task')} className="btn btn-default" id="cancel">
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

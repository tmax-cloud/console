import * as _ from 'lodash-es';
import * as React from 'react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { match as RMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { ListView } from '../../utils/list-view';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { k8sGet, k8sList } from '../../../../module/k8s';
import { ClusterTaskModel, TaskModel, PipelineResourceModel, ServiceAccountModel, TaskRunModel } from '../../../../models';
import { Button } from '@patternfly/react-core';
import store from '../../../../redux';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { getActiveNamespace } from '@console/internal/reducers/ui';
import { Workspace } from '../utils/workspaces';

const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};
let defaultArrayLength = 0;
const taskRunFormFactory = params => {
  return WithCommonForm(CreateTaskRunComponent, params, defaultValues);
};

const paramItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  return (
    <div className="row" key={item.id}>
      <div className="col-xs-4 pairs-list__value-field">
        <input id={`${name}[${index}].value`} ref={methods.register()} className="pf-c-form-control" defaultValue={item.value} name={`${name}[${index}].value`} />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Button
          type="button"
          data-test-id="pairs-list__delete-btn"
          className="pairs-list__span-btns"
          onClick={() => {
            const values = _.get(ListActions.getValues(), name);
            if (!!values && values.length > defaultArrayLength) {
              ListActions.remove(index);
            }
          }}
          variant="plain"
        >
          {ListDefaultIcons.deleteIcon}
        </Button>
      </div>
    </div>
  );
};

const CreateTaskRunComponent: React.FC<TaskRunFormProps> = props => {
  const { t } = useTranslation();
  const methods = useFormContext();
  const [lists, setLists] = useState({
    inputList: [],
    outputList: [],
    paramList: [],
    workspaceList: [],
    paramValueListData: [],
  });

  const [pipelineList, setPipelineList] = useState([]);
  const [serviceAccountList, setServiceAccountList] = useState([]);

  const namespace = getActiveNamespace(store.getState());
  React.useEffect(() => {
    k8sList(PipelineResourceModel, { ns: namespace }).then(list => {
      setPipelineList(list);
    });

    k8sList(ServiceAccountModel, { ns: namespace }).then(list => {
      setServiceAccountList(list);
    });
  }, []);

  const selectedTask = useWatch({
    control: methods.control,
    name: 'taskRef.name',
    defaultValue: '',
  });

  const getTaskDetails = async (taskKind, taskName) => {
    let task;
    if (taskKind === 'Task') {
      task = await k8sGet(TaskModel, taskName, namespace);
    } else if (taskKind === 'ClusterTask') {
      task = await k8sGet(ClusterTaskModel, taskName, null);
    }
    if (!!task) {
      const inputsData = task.spec?.resources?.inputs?.map(input => {
        return {
          name: input.name,
          required: !input.optional,
          type: input.type,
          description: input.description,
        };
      });

      const outputsData = task.spec?.resources?.outputs?.map(output => {
        return {
          name: output.name,
          required: !output.optional,
          type: output.type,
          description: output.description,
        };
      });

      const paramValueListData = task.spec?.params?.map(param => {
        if (param.type === 'array') {
          defaultArrayLength = param.default?.length;
          const valueList = param.default?.map(value => {
            return {
              value: value,
            };
          });
          return { value: valueList };
        } else {
          return { value: param.default };
        }
      });

      const paramsData = task.spec?.params?.map(param => {
        return {
          name: param.name,
          value: param.default,
          description: param.description,
          type: param.type,
          required: !!param.default,
        };
      });

      const workspacesData = task.spec?.workspaces?.map(workspace => {
        return {
          name: workspace.name,
          description: workspace.description,
        };
      });

      setLists({
        inputList: inputsData || [],
        outputList: outputsData || [],
        paramValueListData: paramValueListData || [],
        paramList: paramsData || [],
        workspaceList: workspacesData || [],
      });
    }
  };

  const inputs =
    lists.inputList.length > 0 ? (
      lists.inputList.map((item, index) => {
        return (
          <Section label={`${item.name} (${item.type})`} id={`input_${index}`} key={`input_${index}`} isRequired={item.required} description={item.description}>
            <>
              <ResourceListDropdown name={`spec.resources.inputs.${item.name}.resourceRef.name`} type="single" resourceList={pipelineList} methods={methods} defaultValue="" placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_8')} useHookForm />
            </>
          </Section>
        );
      })
    ) : (
      <div className="help-block">{t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_4')}</div>
    );

  const outputs =
    lists.outputList.length > 0 ? (
      lists.outputList.map((item, index) => {
        return (
          <Section label={`${item.name} (${item.type})`} id={`output_${index}`} key={`output_${index}`} isRequired={item.required} description={item.description}>
            <>
              <ResourceListDropdown name={`spec.resources.outputs.${item.name}.resourceRef.name`} type="single" resourceList={pipelineList} methods={methods} defaultValue="" placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_8')} useHookForm />
            </>
          </Section>
        );
      })
    ) : (
      <div className="help-block">{t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_7')}</div>
    );

  // MEMO : ListView는 name에 민감해서 ListView와 item renderer의 item들의 이름은 고정시키고 name부분은 hidden input으로 넣어둠.
  const params =
    lists.paramList.length > 0 ? (
      lists.paramList.map((item, index) => {
        if (item.type === 'array') {
          return (
            <Section label={item.name} id={`${selectedTask}_param_${index}`} key={`${selectedTask}_param_${index}`} description={item.description} isRequired={item.required}>
              <>
                <input ref={methods.register} type="hidden" id={`params.${index}.name`} name={`params.${index}.name`} value={item.name} />
                <ListView name={`params.${index}.value`} methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={paramItemRenderer} defaultItem={{ value: '' }} defaultValues={lists.paramValueListData[index]?.value} />
              </>
            </Section>
          );
        } else {
          return (
            <Section label={item.name} id={`${selectedTask}_param_${index}`} key={`${selectedTask}_param_${index}`} description={item.description} isRequired={item.required}>
              <>
                <input ref={methods.register} type="hidden" id={`params[${index}].name`} name={`params[${index}].name`} value={item.name} />
                <input ref={methods.register} className="pf-c-form-control" id={`params[${index}].value`} name={`params[${index}].value`} defaultValue={item.value} />
              </>
            </Section>
          );
        }
      })
    ) : (
      <div className="help-block">{t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_10')}</div>
    );

  const workspaces = lists.workspaceList.length > 0 ? lists.workspaceList.map((item, index) => <Workspace namespace={namespace} methods={methods} id={`spec.workspaces[${index}]`} {...item} />) : <div className="help-block">{t('SINGLE:MSG_TASKS_CREATFORM_DIV2_84')}</div>;

  React.useEffect(() => {
    const taskKind = selectedTask.split('~~')[0];
    const taskName = selectedTask.split('~~')[1];
    getTaskDetails(taskKind, taskName);
  }, [selectedTask]);

  return (
    <>
      <hr />
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_5')} id="task" isRequired={true} >
        <ResourceDropdown
          name="taskRef.name"
          type="single"
          resources={[
            {
              kind: TaskModel.kind,
              namespace: namespace,
              prop: 'task',
            },
            {
              kind: ClusterTaskModel.kind,
              prop: 'clustertask',
            },
          ]}
          methods={methods}
          defaultValue=""
          placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_5')}
          idFunc={resource => `${resource.kind}~~${resource.metadata.name}`}
          useHookForm
        />
      </Section>
      {selectedTask != '' ? (
        <>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_7')} id="inputresource">
            <div>{inputs}</div>
          </Section>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_9')} id="outputresource">
            <div>{outputs}</div>
          </Section>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_6')} id="taskparameter">
            <div>{params}</div>
          </Section>
          <Section label="워크스페이스" id="workspace">
            <div>{workspaces}</div>
          </Section>
        </>
      ) : null}
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_11')} id="timeout" description={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_13')}>
        <div>
          <input ref={methods.register} className="pf-c-form-control" id="time_input" name="spec.timeout" type="number" placeholder={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_14')} /> {t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_15')}
        </div>
      </Section>
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_14')} id="serviceaccount" description={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_16')}>
        <ResourceListDropdown name="spec.serviceAccountName" type="single" kind={ServiceAccountModel.kind} resourceList={serviceAccountList} methods={methods} defaultValue="" placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_15')} autocompletePlaceholder={t('COMMON:MSG_COMMON_FILTER_2')} useHookForm />
      </Section>
    </>
  );
};

export const CreateTaskRun: React.FC<CreateTaskRunProps> = ({ match: { params }, kind }) => {
  const formComponent = taskRunFormFactory(params);
  const TaskRunFormComponent = formComponent;

  return <TaskRunFormComponent fixed={{ apiVersion: `${TaskRunModel.apiGroup}/${TaskRunModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm />;
};

const changeTimeoutFormat = timeout => {
  timeout = Number(timeout);
  if (timeout == 0 || isNaN(timeout)) {
    return '0';
  }
  if (timeout >= 60) {
    return `${(timeout - (timeout % 60)) / 60}h${timeout % 60}m`;
  } else return `${timeout}m`;
};

export const onSubmitCallback = data => {
  // MEMO : task name data
  const task = data.taskRef?.name;
  const taskKind = task.split('~~')[0];
  const taskName = task.split('~~')[1];
  delete data.taskRef;

  // MEMO : timeout data
  const formattedTimeout = changeTimeoutFormat(data.spec?.timeout);
  delete data.spec?.timeout;

  // MEMO : inputs data
  const inputs = data.spec?.resources?.inputs;
  let formattedInputs = [];
  for (const inputName in inputs) {
    const inputObj = {
      name: inputName,
      ...inputs[inputName],
    };
    formattedInputs.push(inputObj);
  }
  delete data.spec?.resources?.inputs;

  // MEMO : outputs data
  const outputs = data.spec?.resources?.outputs;
  let formattedOutputs = [];
  for (const outputName in outputs) {
    const outputObj = {
      name: outputName,
      ...outputs[outputName],
    };
    formattedOutputs.push(outputObj);
  }
  delete data.spec?.resources?.outputs;

  // MEMO : paramters data
  const params = _.cloneDeep(data.params);
  const formattedParams = params?.map(param => {
    if (Array.isArray(param.value)) {
      const valueList = param.value.map(obj => {
        return obj.value;
      });
      return { name: param.name, value: valueList };
    } else {
      return { name: param.name, value: param.value };
    }
  });
  delete data.params;

  _.forEach(data.spec.workspaces, workspace => {
    _.forEach(workspace.name, (type, name) => {
      workspace.name = name;
      if (type === 'EmptyDirectory') {
        workspace.emptyDir = {};
      } else if (type === 'VolumeClaimTemplate') {
        workspace.volumeClaimTemplate.spec.accessModes = [workspace.volumeClaimTemplate.spec.accessModes];
      }
    });
  });

  data = _.defaultsDeep({ kind: TaskRunModel.kind, spec: { taskRef: { kind: taskKind, name: taskName }, params: formattedParams, timeout: formattedTimeout, resources: { inputs: formattedInputs, outputs: formattedOutputs } } }, data);
  // console.log('data? ', data);
  return data;
};

type CreateTaskRunProps = {
  match: RMatch<{
    ns?: string;
  }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
};

type TaskRunFormProps = {};

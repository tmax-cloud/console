import * as _ from 'lodash-es';
import * as React from 'react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { match as RMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { ListView } from '../../utils/list-view';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { k8sGet } from '../../../../module/k8s';
import { TaskModel, PipelineResourceModel, ServiceAccountModel, TaskRunModel } from '../../../../models';
import { Button } from '@patternfly/react-core';
import store from '../../../../redux';
import { getActiveNamespace } from '@console/internal/reducers/ui';

const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};

const taskRunFormFactory = params => {
  return WithCommonForm(CreateTaskRunComponent, params, defaultValues);
};

const paramItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => {
  return (
    <div className="row" key={item.id}>
      <div className="col-xs-4 pairs-list__value-field">
        <input ref={register()} className="pf-c-form-control" defaultValue={item.value} name={`${name}[${index}].value`} />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Button
          type="button"
          data-test-id="pairs-list__delete-btn"
          className="pairs-list__span-btns"
          onClick={() => {
            ListActions.remove(index);
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
  const [selectedTask, setSelectedTask] = useState('');
  const [inputList, setInputList] = useState([]);
  const [outputList, setOutputList] = useState([]);
  const [paramList, setParamList] = useState([]);
  const [workspaceList, setWorkspaceList] = useState([]);

  const namespace = getActiveNamespace(store.getState());

  const getTaskDetails = async selectedTaskName => {
    const task = await k8sGet(TaskModel, selectedTaskName, getActiveNamespace(store.getState()));

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

    setInputList(inputsData || []);
    setOutputList(outputsData || []);

    const paramValueListData = task.spec?.params?.map(param => {
      if (param.type === 'array') {
        const valueList = param.default.map(value => {
          return {
            value: value,
          };
        });
        return { value: valueList };
      } else {
        return { value: param.default };
      }
    });

    // MEMO : ListView의 value를 세팅해주는 방법이 reset이 최선일까..?
    // MEMO : reset할 때 params 부분 이외에 다른 value들은 그대로 있게 하기 위해 이렇게 함.
    const prevValues = methods.getValues();
    methods.reset({ ...prevValues, params: paramValueListData });

    const paramsData = task.spec?.params?.map(param => {
      return {
        name: param.name,
        value: param.default,
        description: param.description,
        type: param.type,
        required: !!param.default,
      };
    });

    setParamList(paramsData || []);

    const workspacesData = task.spec?.workspaces?.map(workspace => {
      return {
        name: workspace.name,
        description: workspace.description,
      };
    });
    setWorkspaceList(workspacesData || []);
  };

  const inputs = inputList.map((item, index) => {
    return (
      <Section label={`${item.name} (${item.type})`} id={`input_${index}`} key={`input_${index}`} isRequired={item.required} description={item.description}>
        <>
          <input ref={methods.register} type="hidden" id={`spec.resources.inputs[${index}].name`} name={`spec.resources.inputs[${index}].name`} value={item.name} />
          <ResourceDropdown name={`spec.resources.inputs[${index}].resourceRef.name`} placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_8')} resources={[{ kind: PipelineResourceModel.kind, namespace: namespace, prop: 'pipelineresource' }]} type="single" useHookForm />
        </>
      </Section>
    );
  });

  const outputs = outputList.map((item, index) => {
    return (
      <Section label={`${item.name} (${item.type})`} id={`output_${index}`} key={`output_${index}`} isRequired={item.required} description={item.description}>
        <>
          <input ref={methods.register} type="hidden" id={`spec.resources.outputs[${index}].name`} name={`spec.resources.outputs[${index}].name`} value={item.name} />
          <ResourceDropdown name={`spec.resources.outputs[${index}].resourceRef.name`} placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_8')} resources={[{ kind: PipelineResourceModel.kind, namespace: namespace, prop: 'pipelineresource' }]} type="single" useHookForm />
        </>
      </Section>
    );
  });

  const params = paramList.map((item, index) => {
    if (item.type === 'array') {
      return (
        <Section label={item.name} id={`${selectedTask}_param_${index}`} key={`${selectedTask}_param_${index}`}>
          <>
            <input ref={methods.register} type="hidden" id={`params[${index}].name`} name={`params[${index}].name`} value={item.name} />
            <ListView name={`params[${index}].value`} methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={paramItemRenderer} defaultItem={{ value: '' }} />
          </>
        </Section>
      );
    } else {
      return (
        <Section label={item.name} id={`${selectedTask}_param_${index}`} key={`${selectedTask}_param_${index}`}>
          <>
            <input ref={methods.register} type="hidden" id={`params[${index}].name`} name={`params[${index}].name`} value={item.name} />
            <input ref={methods.register} className="pf-c-form-control" id={`params[${index}].value`} name={`params[${index}].value`} defaultValue={item.value} />
          </>
        </Section>
      );
    }
  });

  const workspaces = workspaceList.map((item, index) => {
    return (
      <Section label={item.name} description={item.description} key={index} id={`workspace_${index}_${item.name}`}>
        <></>
      </Section>
    );
  });

  const onTaskSelect = selectedTaskName => {
    setSelectedTask(selectedTaskName);
    getTaskDetails(selectedTaskName);
  };

  return (
    <>
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_5')} id="task">
        <ResourceDropdown name="spec.taskRef.name" placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_5')} resources={[{ kind: TaskModel.kind, namespace: namespace, prop: 'task' }]} onChange={onTaskSelect} type="single" useHookForm />
      </Section>
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
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_11')} id="timeout" description={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_13')}>
        <div>
          <input ref={methods.register} className="pf-c-form-control" id="time_input" name="spec.timeout" type="number" placeholder="예: 60, 120, 30" /> 분
        </div>
      </Section>
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_14')} id="serviceaccount" description={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_16')} isRequired={true}>
        <ResourceDropdown name="spec.serviceAccountName" placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_15')} resources={[{ kind: ServiceAccountModel.kind, namespace: namespace, prop: 'serviceaccount' }]} type="single" useHookForm />
      </Section>
    </>
  );
};

export const CreateTaskRun: React.FC<CreateTaskRunProps> = ({ match: { params }, kind }) => {
  const formComponent = taskRunFormFactory(params);
  const TaskRunFormComponent = formComponent;

  return <TaskRunFormComponent fixed={{ apiVersion: `${TaskRunModel.apiGroup}/${TaskRunModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

const changeTimeoutFormat = timeout => {
  timeout = Number(timeout);
  if (timeout == 0) {
    return 0;
  }
  if (timeout >= 60) {
    return `${(timeout - (timeout % 60)) / 60}h${timeout % 60}m`;
  } else return `${timeout}m`;
};

export const onSubmitCallback = data => {
  let params = _.cloneDeep(data.params);
  const formattedTimeout = changeTimeoutFormat(data.spec.timeout);
  delete data.params;
  delete data.spec.timeout;
  const prettyParams = params?.map(param => {
    if (Array.isArray(param.value)) {
      const valueList = param.value.map(obj => {
        return obj.value;
      });
      return { name: param.name, value: valueList };
    } else {
      return { name: param.name, value: param.value };
    }
  });
  data = _.defaultsDeep(data, { kind: TaskRunModel.kind, spec: { params: prettyParams, timeout: formattedTimeout } });
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

import { history, resourcePathFromModel } from '@console/internal/components/utils';
import { apiVersionForModel } from '@console/internal/module/k8s';
import { ClusterTaskModel, PipelineModel } from '../../../../../../public/models';
import { Pipeline, PipelineResourceTask, PipelineResourceTaskParam, PipelineTask } from '../../../utils/pipeline-augment';
import { getTaskParameters } from '../resource-utils';
import { TASK_ERROR_STRINGS, TaskErrorType } from './const';
import { PipelineBuilderFormikValues, PipelineBuilderFormValues, TaskErrorMap } from './types';

export const getErrorMessage = (errorTypes: TaskErrorType[], errorMap: TaskErrorMap) => (taskName: string): string => {
  if (!taskName) {
    return TASK_ERROR_STRINGS[TaskErrorType.MISSING_NAME];
  }

  const errorList: TaskErrorType[] | undefined = errorMap?.[taskName];
  if (!errorList) return null;

  const hasRequestedError = errorList.filter(error => errorTypes.includes(error));
  return hasRequestedError.length > 0 ? TASK_ERROR_STRINGS[hasRequestedError[0]] : null;
};

export const taskParamIsRequired = (param: PipelineResourceTaskParam): boolean => {
  return false;
};

export const convertResourceToTask = (resource: PipelineResourceTask, runAfter?: string[]): PipelineTask => {
  return {
    name: resource.metadata.name,
    runAfter,
    taskRef: {
      kind: resource.kind === ClusterTaskModel.kind ? ClusterTaskModel.kind : undefined,
      name: resource.metadata.name,
    },
    params: getTaskParameters(resource).map(param => ({
      name: param.name,
      value: param.default,
    })),
  };
};

export const getPipelineURL = (namespace: string) => {
  return `/k8s/ns/${namespace}/pipelines`;
};

const removeListRunAfters = (task: PipelineTask, listIds: string[]): PipelineTask => {
  if (task?.runAfter && listIds.length > 0) {
    // Trim out any runAfters pointing at list nodes
    const runAfter = (task.runAfter || []).filter(runAfterName => !listIds.includes(runAfterName));

    return {
      ...task,
      runAfter,
    };
  }

  return task;
};

const removeEmptyDefaultParams = (task: PipelineTask): PipelineTask => {
  if (task.params?.length > 0) {
    // Since we can submit, this param has a default; check for empty values and remove
    // 20210929 Policy changed
    task.params.forEach(param => {if(param.value === undefined) param.value = '' });
    return {
      ...task,
      //params: task.params.filter(param => !!param.value),
    };
  }

  return task;
};

export const convertBuilderFormToPipeline = (formValues: PipelineBuilderFormikValues, namespace: string, existingPipeline?: Pipeline): Pipeline => {
  const { name, resources, params, workspaces, tasks, listTasks, metadata } = formValues;
  const listIds = listTasks.map(listTask => listTask.name);
  const labels = metadata?.labels;

  return {
    ...existingPipeline,
    apiVersion: apiVersionForModel(PipelineModel),
    kind: PipelineModel.kind,
    metadata: {
      ...existingPipeline?.metadata,
      name,
      namespace,
      labels,
    },
    spec: {
      ...existingPipeline?.spec,
      params,
      resources,
      workspaces,
      tasks: tasks.map(task => removeEmptyDefaultParams(removeListRunAfters(task, listIds))),
    },
  };
};

export const convertPipelineToBuilderForm = (pipeline: Pipeline): PipelineBuilderFormValues => {
  if (!pipeline) return null;

  const {
    metadata: { name },
    spec: { params = [], resources = [], workspaces = [], tasks = [] },
  } = pipeline;

  return {
    name,
    params,
    resources,
    workspaces,
    tasks,
    listTasks: [],
  };
};

export const goToYAML = (existingPipeline?: Pipeline, namespace?: string) => {
  history.push(existingPipeline ? `${resourcePathFromModel(PipelineModel, existingPipeline?.metadata?.name, existingPipeline?.metadata?.namespace)}/yaml` : `${getPipelineURL(namespace)}/~new`);
};

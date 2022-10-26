import * as _ from 'lodash-es';
import { TaskRunModel } from '@console/internal/models/hypercloud';
import { workspaceTypeKeys } from '../utils/workspaces';

const changeTimeoutFormat = timeout => {
  timeout = Number(timeout);
  if (timeout == 0 || isNaN(timeout)) {
    return '0';
  }
  if (timeout >= 60) {
    return `${(timeout - (timeout % 60)) / 60}h${timeout % 60}m`;
  } else return `${timeout}m`;
};

const changeTimeoutToNumberFormat = timeout => {
  if (!timeout || timeout === '0' || timeout.indexOf('m') === -1) {
    return 0;
  }
  let hour = 0;
  let minute = 0;
  if (timeout.indexOf('h') > -1) {
    hour = Number(timeout.split('h')[0]);
    minute = Number(timeout.slice(timeout.indexOf('h') + 1, timeout.length - 1));
  } else {
    minute = Number(timeout.slice(0, timeout.length - 1));
  }
  return 60 * hour + minute;
};

// form data를 정제
export const onSubmitCallback = data => {
  if (_.isEmpty(data)) {
    return data;
  }

  // MEMO : task name data
  const task = data?.taskRef?.name;
  let taskRef = undefined;
  if (task) {
    const taskKind = task.split('~~')[0];
    const taskName = task.split('~~')[1];
    taskRef = { kind: taskKind, name: taskName };
  }
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
    if (Array.isArray(param?.value)) {
      const valueList = param?.value.map(obj => {
        return obj.value;
      });
      return { name: param?.name, value: valueList };
    } else {
      return { name: param?.name, value: param?.value };
    }
  });
  delete data.params;

  // MEMO : workspaces data
  _.forEach(data.spec.workspaces, workspace => {
    _.forEach(workspace.name, (type, name) => {
      workspace.name = name;
      if (type === 'EmptyDirectory') {
        workspace.emptyDir = {};
      } else if (type === 'VolumeClaimTemplate') {
        if (workspace?.volumeClaimTemplate?.spec?.accessModes) {
          workspace.volumeClaimTemplate.spec.accessModes = [workspace.volumeClaimTemplate.spec.accessModes];
        }
      }
    });
  });

  data = _.defaultsDeep({ kind: TaskRunModel.kind, spec: { taskRef, params: formattedParams, timeout: formattedTimeout, resources: { inputs: formattedInputs, outputs: formattedOutputs } } }, data);
  return data;
};

// form data로 변환
export const convertToForm = (data: any) => {
  if (_.isEmpty(data)) {
    return data;
  }
  const _data = _.cloneDeep(data);

  // MEMO : task name data
  const taskRefKind = _.get(_data, 'spec.taskRef.kind', '');
  const taskRefName = _.get(_data, 'spec.taskRef.name', '');
  const taskRef = taskRefKind && taskRefName ? { name: `${taskRefKind}~~${taskRefName}` } : undefined;

  // MEMO : timeout data
  const timeout = changeTimeoutToNumberFormat(data?.spec?.timeout);

  // MEMO : inputs data
  const inputs = data?.spec?.resources?.inputs?.reduce((acc, cur) => {
    acc[cur.name] = { resourceRef: cur.resourceRef };
    return acc;
  }, {});

  // MEMO : outputs data
  const outputs = data?.spec?.resources?.outputs?.reduce((acc, cur) => {
    acc[cur.name] = { resourceRef: cur.resourceRef };
    return acc;
  }, {});

  // MEMO : paramters data
  const params = _.get(_data, 'spec.params', [])?.map(param => {
    return _.isString(param.value) ? param : { name: param.name, value: param?.value?.map(v => ({ value: v })) };
  });

  // MEMO : workspaces data
  const workspaces = _.get(_data, 'spec.workspaces', [])?.map(workspace => {
    const type = Object.keys(workspaceTypeKeys).find(key => !!_.get(workspace, key));
    const _workspace = _.merge({ [workspace.name]: workspaceTypeKeys[type] }, { [type]: _.cloneDeep(workspace[type]) });
    if (workspaceTypeKeys[type] === 'EmptyDirectory') {
      delete _workspace.emptyDir;
    } else if (workspaceTypeKeys[type] === 'VolumeClaimTemplate') {
      _workspace[type].spec.accessModes = workspace[type].spec.accessModes?.[0] || '';
    }
    return _workspace;
  });

  const omittedData = _.omit(_data, ['spec.taskRef', 'spec.timeout', 'spec.resources.inputs', 'spec.resources.outputs', 'spec.params', 'spec.workspaces']);
  const result = _.merge(omittedData, { taskRef, params, spec: { timeout, resources: { inputs, outputs }, workspaces } });
  return result;
};

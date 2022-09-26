import * as _ from 'lodash-es';
import { TaskModel } from '@console/internal/models/hypercloud';
import { SelectorInput } from '@console/internal/components/utils';

// form data를 정제
export const onSubmitCallback = data => {
  if (_.isEmpty(data)) {
    return data;
  }
  let labels = {};
  if (_.isArray(data?.metadata?.labels)) {
    data?.metadata?.labels.forEach(cur => {
      labels = typeof cur === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
    });
  } else {
    labels = typeof data.metadata.labels === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
  }
  delete data.metadata.labels;
  data = _.defaultsDeep({ metadata: { labels: labels } }, data);
  // apiVersion, kind
  data.kind = TaskModel.kind;
  data.apiVersion = `${TaskModel.apiGroup}/${TaskModel.apiVersion}`;
  // resources
  if (data.spec?.resources?.inputs.length === 0 && data.spec?.resources?.outputs.length === 0) {
    delete data.spec.resources;
  }

  //parameter
  const params = data?.spec?.params?.map((cur, idx) => {
    const stringDefault = cur?.defaultStr;
    const arrayDefault = cur.defaultArr?.map(cur => cur.value)?.filter(cur => !!cur);
    if (cur.type === 'string' && !!stringDefault) {
      data.spec.params[idx].default = stringDefault;
    } else if (arrayDefault?.length > 0) {
      data.spec.params[idx].default = arrayDefault;
    }
    delete data.spec.params[idx].defaultStr;
    delete data.spec.params[idx].defaultArr;
    return cur;
  });
  !!params && (data.spec.params = params);
  // workspace
  const workspace = data?.spec?.workspaces?.map((cur, idx) => {
    let isReadOnly = cur.accessMode === 'readOnly' ? true : false;
    delete data.spec.workspaces[idx].accessMode;

    if (cur.mountPath === '') {
      cur.mountPath = `/workspace/${cur.name}`;
    }

    if (isReadOnly) {
      return { ...cur, readOnly: true };
    } else {
      return { ...cur, readOnly: false };
    }
  });
  !!workspace && (data.spec.workspaces = workspace);
  // volume
  const volumes = data?.spec?.volumes?.map(cur => {
    if (cur?.type === 'emptyDir') {
      return {
        name: cur?.name,
        emptyDir: {},
      };
    } else if (cur?.type === 'configMap') {
      return {
        name: cur?.name,
        configMap: {
          name: cur?.configMap,
        },
      };
    } else if (cur?.type === 'secret') {
      return {
        name: cur?.name,
        secret: {
          secretName: cur?.secret,
        },
      };
    }
  });
  !!volumes && (data.spec.volumes = volumes);
  // step
  const steps = data?.spec?.steps?.map((cur, idx) => {
    // image
    if (cur.registryTypeToggle === 'internal' && cur.registryRegistry) {
      cur.image = `${cur.registryRegistry}/${cur.registryImage}:${cur.registryTag}`;
    }
    delete cur.registryRegistry;
    delete cur.registryImage;
    delete cur.registryTag;
    delete cur.registryTypeToggle;
    delete cur.isFirstTimeEdit;
    // command
    cur.command = cur?.command?.map(curCommand => curCommand?.value);
    //args
    cur.args = cur?.args?.map(curArg => curArg?.value);
    //env
    cur.env = cur?.env?.map(curEnv =>
      curEnv.envType === 'normal'
        ? { name: curEnv?.envKey, value: curEnv?.envValue }
        : {
            name: curEnv?.envKey,
            valueFrom: {
              [`${curEnv.envType}KeyRef`]: {
                key: curEnv.resourceKey,
                name: curEnv.envValue,
              },
            },
          },
    );
    if (cur.commandTypeToggle === 'command') {
      delete data.spec.steps[idx].script;
    } else {
      delete data.spec.steps[idx].command;
      delete data.spec.steps[idx].args;
    }
    delete data.spec.steps[idx].commandTypeToggle;

    if (cur.mountArr) {
      let volumeMounts = cur.mountArr?.map(cur => ({
        mountPath: cur.mountPath,
        name: cur.mountName.value,
      }));
      data.spec.steps[idx].volumeMounts = volumeMounts;
      delete data.spec.steps[idx].mountArr;
    }

    return cur;
  });
  !!steps && (data.spec.steps = steps);
  return data;
};

// form data로 변환
export const convertToForm = (data: any) => {
  if (_.isEmpty(data)) {
    return data;
  }
  const _data = _.cloneDeep(data);

  const labels = Object.entries(_.get(_data, 'metadata.labels', {}))?.map(([key, value]) => `${key}=${value}`);
  const params = _.get(_data, 'spec.params', [])?.map(param => {
    param.type === 'string' && !!param?.default && (param.defaultStr = param?.default);
    param.type === 'array' && !!param?.default && (param.defaultArr = param?.default.map(v => ({ value: v })));
    return param;
  });
  const workspaces = _.get(_data, 'spec.workspaces', [])?.map(workspace => {
    workspace.accessMode = workspace.readOnly ? 'readOnly' : 'readWrite';
    delete workspace.readOnly;
    return workspace;
  });
  const volumes = _.get(_data, 'spec.volumes', [])?.map(volume => {
    if (!volume) {
      return volume;
    }
    if (Object.keys(volume)?.some(v => v === 'emptyDir')) {
      return { name: volume.name, type: 'emptyDir' };
    } else if (Object.keys(volume)?.some(v => v === 'configMap')) {
      return { name: volume.name, type: 'configMap', configMap: volume.configMap.name };
    } else if (Object.keys(volume)?.some(v => v === 'secret')) {
      return { name: volume.name, type: 'secret', secret: volume.secret.secretName };
    } else {
      return { name: volume.name, type: 'emptyDir' };
    }
  });
  const steps = _.get(_data, 'spec.steps', [])?.map(step => {
    step.command = step.command?.map(value => ({ value }));
    step.args = step.args?.map(value => ({ value }));
    step.env = step.env?.map(curEnv => {
      if (curEnv.name && curEnv.value) {
        return { envKey: curEnv.name, envValue: curEnv.value, envType: 'normal' };
      } else if (curEnv.name && curEnv?.valueFrom?.secretKeyRef) {
        return { envKey: curEnv.name, envValue: curEnv.valueFrom.secretKeyRef.name, resourceKey: curEnv.valueFrom.secretKeyRef.key, envType: 'secret' };
      } else if (curEnv.name && curEnv?.valueFrom?.configMapKeyRef) {
        return { envKey: curEnv.name, envValue: curEnv.valueFrom.configMapKeyRef.name, resourceKey: curEnv.valueFrom.configMapKeyRef.key, envType: 'configMap' };
      }
      return curEnv;
    });
    step.commandTypeToggle = step.script ? 'script' : 'command';
    step.mountArr = step.volumeMounts?.map(mount => ({ mountPath: mount.mountPath, mountName: { label: mount.name, value: mount.name } }));
    delete step.volumeMounts;
    return step;
  });

  const omittedData = _.omit(_data, ['metadata.labels', 'spec.params', 'spec.workspaces', 'spec.volumes', 'spec.steps']);
  return _.merge(omittedData, { metadata: { labels }, spec: { params, workspaces, volumes, steps } });
};

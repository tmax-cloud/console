import * as _ from 'lodash-es';
import * as React from 'react';
import { isCreatePage } from '../create-form';

const setLabelField = (defaultValues, setLabels) => {
  const hasLabelField = _.has(defaultValues, 'metadata.labels');
  if (hasLabelField) {
    let labelObj = _.get(defaultValues, 'metadata.labels');
    let labelTemp = [];
    for (let key in labelObj) {
      labelTemp.push(`${key}=${labelObj[key]}`);
    }
    setLabels(labelTemp);
  }
};

const setInputResourceField = (defaultValues, setInputResource) => {
  const hasResourceInput = _.has(defaultValues, 'spec.resources.inputs');
  if (hasResourceInput) {
    let inputResources = _.get(defaultValues, 'spec.resources.inputs');
    setInputResource(inputResources);
  }
};

const setOutputResourceField = (defaultValues, setOutputResource) => {
  const hasResourceOutput = _.has(defaultValues, 'spec.resources.outputs');
  if (hasResourceOutput) {
    let outputResources = _.get(defaultValues, 'spec.resources.outputs');
    setOutputResource(outputResources);
  }
};

const setParamField = (defaultValues, setTaskParameter) => {
  const hasTaskParam = _.has(defaultValues, 'spec.params');
  if (hasTaskParam) {
    const paramDefaultValues = _.get(defaultValues, 'spec.params').map(item => {
      const defaultObj =
        item.type === 'array'
          ? {
              defaultArr: item.default?.map(cur => ({ value: cur })),
            }
          : { defaultStr: item.default };
      return _.assign(item, defaultObj);
    });
    setTaskParameter(paramDefaultValues);
  }
};

const setWorkSpaceField = (defaultValues, setWorkSpace) => {
  const hasWorkSpace = _.has(defaultValues, 'spec.workspaces');
  if (hasWorkSpace) {
    const workSpaceDefaultValues = _.get(defaultValues, 'spec.workspaces').map(item => {
      if (typeof item.readOnly != 'undefined') {
        item.accessMode = 'readOnly';
      } else {
        item.accessMode = 'readWrite';
      }
      delete item.readOnly;
      return item;
    });
    setWorkSpace(workSpaceDefaultValues);
  }
};

const setVolumeField = (defaultValues, setVolume) => {
  const hasVolume = _.has(defaultValues, 'spec.volumes');
  if (hasVolume) {
    let volumeDefaultValues = _.get(defaultValues, 'spec.volumes');
    volumeDefaultValues = volumeDefaultValues?.map(item => {
      const obj = {
        name: item.name,
      };
      if (item.configMap) {
        obj['type'] = 'configMap';
        obj['configMap'] = item.configMap.name;
      } else if (item.secret) {
        obj['type'] = 'secret';
        obj['secret'] = item.secret.secretName;
      } else if (item.emptyDir) {
        obj['type'] = 'emptyDir';
      }
      return obj;
    });
    setVolume(volumeDefaultValues);
  }
};

const setStepField = (defaultValues, setStep) => {
  const hasStep = _.has(defaultValues, 'spec.steps');

  if (hasStep) {
    let stepDefaultValues = _.get(defaultValues, 'spec.steps');
    const setEnv = item => {
      return item.env?.map(cur => {
        const envKey = cur.name;
        let envValue = cur.value;
        let resourceKey = '';
        let envType = 'normal';
        if (_.has(cur, 'valueFrom')) {
          // secretRef, configMap 등
          if (_.has(cur, ['valueFrom', 'secretKeyRef'])) {
            envValue = _.get(cur, 'valueFrom.secretKeyRef.name');
            resourceKey = _.get(cur, 'valueFrom.secretKeyRef.key');
            envType = 'secret';
          } else if (_.has(cur, ['valueFrom', 'configMapKeyRef '])) {
            envValue = _.get(cur, 'valueFrom.configMapKeyRef.name');
            resourceKey = _.get(cur, 'valueFrom.configMapKeyRef.key');
            envType = 'configMap';
          }
        }
        return { envKey, envValue, resourceKey, envType };
      });
    };
    stepDefaultValues = stepDefaultValues?.map(item => {
      const env = setEnv(item);
      return _.assign(item, {
        command: item.command?.map(cur => {
          return { value: cur };
        }),
        env: env,
        args: item.args?.map(cur => {
          return { value: cur };
        }),
        mountArr: item.volumeMounts?.map(cur => ({ mountName: { value: cur.name, label: cur.name }, mountPath: cur.mountPath })),
        selectedVolume: item.volumeMounts?.[0].name,
        commandTypeToggle: item?.script ? 'script' : 'command',
        registryTypeToggle: 'internal',
        isFirstTimeEdit: true,
      });
    });
    setStep(stepDefaultValues);
  }
};

export const useSetTaskHook = props => {
  const { defaultValues, setLabels, setInputResource, setOutputResource, setTaskParameter, setWorkSpace, setVolume, setStep } = props;

  React.useEffect(() => {
    if (!isCreatePage(defaultValues)) {
      setLabelField(defaultValues, setLabels);
      setInputResourceField(defaultValues, setInputResource);
      setOutputResourceField(defaultValues, setOutputResource);
      setParamField(defaultValues, setTaskParameter);
      setWorkSpaceField(defaultValues, setWorkSpace);
      setVolumeField(defaultValues, setVolume);
      setStepField(defaultValues, setStep);
    }
  }, []);
};

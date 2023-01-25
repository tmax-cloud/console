import * as _ from 'lodash-es';
import { PipelineRunModel } from '@console/internal/models/hypercloud';
import { SelectorInput } from '@console/internal/components/utils';

export const onSubmitCallback = data => {
  if (_.isEmpty(data)) {
    return data;
  }

  let labels = SelectorInput.objectify(data.metadata.labels);

  let params = [];
  _.forEach(data.spec.params, (obj, name) => {
    params.push({ name: name, value: obj.value ?? obj.arrayValue.map(subObj => subObj.value) });
  });

  let resources = [];
  _.forEach(data.spec.resources, (obj, name) => {
    resources.push({ name: name, resourceRef: obj.resourceRef });
  });
  _.forEach(data.spec.workspaces, workspace => {
    if (workspace && workspace.type) {
      switch (workspace.type) {
        case 'EmptyDirectory':
          workspace.emptyDir = {};
          break;
        case 'VolumeClaimTemplate':
          workspace.volumeClaimTemplate.spec.accessModes = [workspace.volumeClaimTemplate.spec.accessModes[0]];
          break;
        case 'Secret':
          workspace.secret.secretName = workspace?.secret?.secretName;
          break;
        case 'ConfigMap':
          workspace.configmap.name = workspace?.configmap?.name;
          break;
        case 'PVC':
          workspace.persistentVolumeClaim.claimName = workspace?.persistentVolumeClaim?.claimName;
          break;
      }
      delete workspace.type;
    }
  });

  delete data.metadata.labels;
  delete data.spec.params;
  delete data.spec.resources;

  data.kind = PipelineRunModel.kind;
  data.apiVersion = `${PipelineRunModel.apiGroup}/${PipelineRunModel.apiVersion}`;

  data = _.defaultsDeep({ metadata: { labels: labels }, spec: { params: params, resources: resources } }, data);
  return data;
};

// form data로 변환
export const convertToForm = (data: any) => {
  if (_.isEmpty(data)) {
    return data;
  }
  const _data = _.cloneDeep(data);
  const labels = Object.entries(_.get(_data, 'metadata.labels', {}))?.map(([key, value]) => `${key}=${value}`);

  let params = {};
  _.get(_data, 'spec.params', [])?.forEach(obj => {
    params[obj.name] = Array.isArray(obj.value) ? { arrayValue: obj.value } : { value: obj.value };
  });

  let resources = {};
  _.get(_data, 'spec.resources', [])?.forEach(obj => {
    resources[obj.name] = { resourceRef: { name: obj.resourceRef?.name } };
  });

  const workspaces = [];
  _.forEach(_data.spec?.workspaces, workspace => {
    if (workspace) {
      let newWorkspace = { name: workspace.name };
      const type = 'secret' in workspace ? 'Secret' : 'configmap' in workspace ? 'ConfigMap' : 'emptyDir' in workspace ? 'EmptyDirectory' : 'persistentVolumeClaim' in workspace ? 'PVC' : 'volumeClaimTemplate' in workspace ? 'VolumeClaimTemplate' : '';
      newWorkspace = _.merge(newWorkspace, { type: type });
      switch (type) {
        case 'EmptyDirectory':
          newWorkspace = _.merge(newWorkspace, { emptyDir: {} });
          break;
        case 'VolumeClaimTemplate':
          const accessMode = workspace?.volumeClaimTemplate?.spec?.accessModes[0];
          const storage = workspace?.volumeClaimTemplate?.spec?.resources?.requests?.storage;
          const storageClassName = workspace?.volumeClaimTemplate?.spec?.storageClassName;
          newWorkspace = _.merge(newWorkspace, { volumeClaimTemplate: { spec: { accessModes: [accessMode], resources: { requests: { storage: storage } }, storageClassName: storageClassName } } });
          break;
        case 'Secret':
          newWorkspace = _.merge(newWorkspace, { secret: { secretName: workspace?.secret?.secretName } });
          break;
        case 'ConfigMap':
          newWorkspace = _.merge(newWorkspace, { configmap: { name: workspace?.configmap?.name } });
          break;
        case 'PVC':
          newWorkspace = _.merge(newWorkspace, { persistentVolumeClaim: { claimName: workspace?.persistentVolumeClaim?.claimName } });
          break;
      }
      workspaces.push(newWorkspace);
    }
  });

  const omittedData = _.omit(_data, ['metadata.labels', 'spec.resources', 'spec.params', 'spec.workspaces']);

  const convertedData = _.merge(omittedData, { metadata: { labels }, spec: { resources, params, workspaces } });
  return convertedData;
};

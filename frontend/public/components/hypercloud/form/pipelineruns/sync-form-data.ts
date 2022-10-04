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
    _.forEach(workspace.name, (type, name) => {
      workspace.name = name;
      if (type === 'EmptyDirectory') {
        workspace.emptyDir = {};
      } else if (type === 'VolumeClaimTemplate') {
        workspace.volumeClaimTemplate.spec.accessModes = [workspace.volumeClaimTemplate.spec.accessModes];
      }
    });
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

  const omittedData = _.omit(_data, ['metadata.labels', 'spec.resources', 'spec.params']);

  const convertedData = _.merge(omittedData, { metadata: { labels }, spec: { resources, params } });
  return convertedData;
};

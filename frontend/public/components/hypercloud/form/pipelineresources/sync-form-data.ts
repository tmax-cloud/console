import * as _ from 'lodash-es';
import { SelectorInput } from '@console/internal/components/utils';

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);
  if (_.isArray(data.metadata.labels)) {
    data.metadata.labels.forEach(cur => {
      labels = typeof cur === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
    });
  } else {
    labels = typeof data.metadata.labels === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
  }

  let params = [];
  data.spec.revision && params.push({ name: 'revision', value: data.spec.revision });
  data.spec.url && params.push({ name: 'url', value: data.spec.url });

  delete data.metadata.labels;
  delete data.spec.params;
  delete data.spec.revision;
  delete data.spec.url;

  data = _.defaultsDeep({ metadata: { labels: labels }, spec: { params: params } }, data);
  return data;
};

export const convertToForm = (data: any) => {
  if (_.isEmpty(data)) {
    return data;
  }
  const _data = _.cloneDeep(data);

  const labels = Object.entries(_.get(_data, 'metadata.labels', {}))?.map(([key, value]) => `${key}=${value}`);

  let revision, url;
  _.get(_data, 'spec.params', [])?.forEach(param => {
    if (param.name === 'revision') {
      revision = param.value;
    } else if (param.name === 'url') {
      url = param.value;
    }
  });

  const omittedData = _.omit(_data, ['metadata.labels', 'spec.params']);
  return _.merge(omittedData, { metadata: { labels }, spec: { revision, url } });
};

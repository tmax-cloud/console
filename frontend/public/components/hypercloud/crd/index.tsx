// import * as React from 'react';
import * as _ from 'lodash';
import { K8sKind, CustomResourceDefinitionKind, referenceFor, referenceForModel } from '@console/internal/module/k8s';
import { defaultTemplateMap } from '../form';

export const parseALMExamples = (crd: CustomResourceDefinitionKind) => {
  try {
    return JSON.parse(crd?.metadata?.annotations?.['alm-examples'] ?? '[]');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Unable to parse ALM expamples\n', e);
    return [];
  }
};

export const exampleForModel = (crd: CustomResourceDefinitionKind, model: K8sKind) => {
  const almObj = parseALMExamples(crd);
  const defaultTemplate = defaultTemplateMap.get(model.kind) || {};
  return _.defaultsDeep(
    {},
    {
      kind: model.kind,
      apiVersion: model?.apiGroup ? `${model.apiGroup}/${model.apiVersion}` : `${model.apiVersion}`,
    },
    _.find(almObj, (s: CustomResourceDefinitionKind) => referenceFor(s) === referenceForModel(model)),
    defaultTemplate,
  );
};

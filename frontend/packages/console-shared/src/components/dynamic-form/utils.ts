import * as _ from 'lodash';
import { JSONSchema7 } from 'json-schema';
import { UiSchema } from '@rjsf/core';
//import { UiSchema } from 'react-jsonschema-form';

import { getUiOptions } from '@rjsf/core/lib/utils';

const UNSUPPORTED_SCHEMA_PROPERTIES = []; // Openshift에서는 oneOf, allOf, anyOf에 대한 schema 무시하도록 해놈. 이거 일단 이유를 모르겠어서 없애놈. 나중에 문제 생기면 다시 봐야할듯.

export const useSchemaLabel = (schema: JSONSchema7, uiSchema: UiSchema, defaultLabel?: string) => {
  const options = getUiOptions(uiSchema ?? {});
  const showLabel = options?.label ?? true;
  const label = (options?.title || schema?.title || defaultLabel) as string;
  return [showLabel, label] as [boolean, string];
};

export const useSchemaDescription = (schema: JSONSchema7, uiSchema: UiSchema, defaultDescription?: string) => (getUiOptions(uiSchema ?? {})?.description || schema?.description || defaultDescription) as string;

export const getSchemaErrors = (schema: JSONSchema7): SchemaError[] => {
  return [
    ...(_.isEmpty(schema)
      ? [
          {
            title: 'Empty Schema',
            message: 'Schema is empty.',
          },
        ]
      : []),
    ..._.map(_.intersection(_.keys(schema), UNSUPPORTED_SCHEMA_PROPERTIES), unsupportedProperty => ({
      title: 'Unsupported Property',
      message: `Cannot generate form fields for JSON schema with ${unsupportedProperty} property.`,
    })),
  ];
};

// Returns true if a value is not nil and is empty
const definedAndEmpty = value => !_.isNil(value) && _.isEmpty(value);

// 가지치기하지 말아야 할 key라면 true를 반환
const definedAsEmpty = (keysToShouldNotPrune, key) => !!_.includes(keysToShouldNotPrune, key);

// Helper function for prune
// TODO (jon) Make this pure
const pruneRecursive = (current: any, sample: any, keysToShouldNotPrune: string[]): any => {
  const valueIsEmpty = (value, key) => _.isNil(value) || _.isNaN(value) || (_.isString(value) && _.isEmpty(value)) || (_.isObject(value) && _.isEmpty(pruneRecursive(value, sample?.[key], keysToShouldNotPrune)));

  // Value should be pruned if it is empty and the correspondeing sample is not explicitly
  // defined as an empty value.
  const shouldPrune = (value, key) => valueIsEmpty(value, key) && !definedAndEmpty(sample?.[key]) && !definedAsEmpty(keysToShouldNotPrune, key);

  // Prune each property of current value that meets the pruning criteria
  _.forOwn(current, (value, key) => {
    if (shouldPrune(value, key)) {
      delete current[key];
    }
  });

  // remove any leftover undefined values from the delete operation on an array
  if (_.isArray(current)) {
    _.pull(current, undefined);
  }

  return current;
};

// Deeply remove all empty, NaN, null, or undefined values from an object or array. If a value meets
// the above criteria, but the corresponding sample is explicitly defined as an empty vaolue, it
// will not be pruned.
// Based on https://stackoverflow.com/a/26202058/8895304
export const prune = (obj: any, sample?: any, keysToShouldNotPrune?: string[]): any => {
  return pruneRecursive(_.cloneDeep(obj), sample, keysToShouldNotPrune);
};

type SchemaError = {
  title: string;
  message: string;
};

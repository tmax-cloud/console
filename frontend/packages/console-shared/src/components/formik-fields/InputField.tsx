import * as React from 'react';
import { TextInput, TextInputTypes } from '@patternfly/react-core';
import { BaseInputFieldProps } from './field-types';
import BaseInputField from './BaseInputField';

const InputField: React.FC<BaseInputFieldProps> = ({
  type = TextInputTypes.text,

  ...baseProps
}) => (
  <BaseInputField type={type} {...baseProps}>
    {props =>
      props.resourceType === 'pipeline' ? (
        <div className={'row form-group required'}>
          <div className="col-xs-2 control-label">
            <strong>Name</strong>
          </div>
          <div className="col-xs-10">
            <TextInput
              className="form-control"
              style={{ borderBottomWidth: 'thin' }}
              {...props}
            />
          </div>
        </div>
      ) : (
        <TextInput
          className="form-control"
          style={{ borderBottomWidth: 'thin' }}
          {...props}
        />
      )
    }
  </BaseInputField>
);

export default InputField;

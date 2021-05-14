import * as React from 'react';
import * as _ from 'lodash';
import { FieldArray, useFormikContext, FormikValues } from 'formik';
import { FormGroup } from '@patternfly/react-core';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField, CheckboxField } from '@console/shared';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
export const MultiWorkspacesField: React.FC<MultiWorkspacesFieldProps> = ({ name }) => {
  const { values } = useFormikContext<FormikValues>();
  const fieldValue = _.get(values, name, []);
  const defaultItem = {
    name: '',
    optional: false,
  };

  return (
    <FieldArray
      name={name}
      render={({ push, remove }) => {
        return (
          <FormGroup fieldId={`form-multi-column-input-${name.replace(/\./g, '-')}-field`}>
            {fieldValue.length > 0 &&
              fieldValue.map((value, index) => (
                <div className="workspace-input-field-wrapper" key={`${name}-${index}-inputFieldWrapper`}>
                  <div className="remove-button-wrapper">
                    <Button
                      className="pf-m-link remove-button"
                      data-test-id="pairs-list__delete-btn"
                      onClick={() => {
                        remove(index);
                      }}
                      type="button"
                      variant="link"
                    >
                      <MinusCircleIcon data-test-id="pairs-list__delete-icon" className="pairs-list__side-btn pairs-list__delete-ico co-icon-space-r" />
                      Remove Pipeline workspace
                    </Button>
                  </div>
                  <InputSection label="워크스페이스 이름" customClass="short-margin-top" isRequired={true}>
                    <InputField name={`${name}.${index}.name`} type={TextInputTypes.text} placeholder="Name" />
                  </InputSection>
                  <InputSection>
                    <CheckboxField name={`${name}.${index}.optional`} label='이 워크스페이스를 선택 항목으로 제공합니다.' helpText='선택 항목으로 제공할 경우, 파이프라인 런 메뉴에서 파이프라인 워크스페이스를 필요에 따라 할당할 수 있습니다.'/>
                  </InputSection>
                </div>
              ))}
            <div className="add-button-wrapper">
              <Button
                className="pf-m-link--align-left"
                data-test-id="pairs-list__add-btn"
                onClick={() => {
                  push(defaultItem);
                }}
                type="button"
                variant="link"
              >
                <PlusCircleIcon data-test-id="pairs-list__add-icon" className="co-icon-space-r" />
                Add Pipeline workspace
              </Button>
            </div>
          </FormGroup>
        );
      }}
    />
  );
};

const InputSection: React.FC<InputSectionProps> = ({ label, isRequired, children, customClass = '' }) => {
  return (
    <div className={'form-group workspace-input-section-wrapper ' + customClass}>
      <label className={'control-label ' + (isRequired ? 'co-required' : '')}>{label}</label>
      <div className="row">{children}</div>
    </div>
  );
};

type InputSectionProps = {
  label?: string;
  isRequired?: boolean;
  children?: React.ReactNode;
  customClass?: string;
};
type MultiWorkspacesFieldProps = {
  name: string;
  children?: React.ReactNode;
  addLabel?: string;
  defaultItem?: object;
};
export default MultiWorkspacesField;

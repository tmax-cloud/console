import * as React from 'react';
import * as _ from 'lodash';
import { FieldArray, useFormikContext, FormikValues } from 'formik';
import { FormGroup } from '@patternfly/react-core';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField, CheckboxField } from '@console/shared';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
export const MultiWorkspacesField: React.FC<MultiWorkspacesFieldProps> = ({ name }) => {
  const { values } = useFormikContext<FormikValues>();
  const fieldValue = _.get(values, name, []);
  const defaultItem = {
    name: '',
    optional: false,
  };
  const { t } = useTranslation();

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
                      {`${t('SINGLE:MSG_PIPELINES_CREATEFORM_33')}`}
                    </Button>
                  </div>
                  <InputSection label={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_34')}`} customClass="short-margin-top" isRequired={true}>
                    <InputField name={`${name}.${index}.name`} type={TextInputTypes.text} placeholder={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_34')}`} />
                  </InputSection>
                  <InputSection>
                    <CheckboxField name={`${name}.${index}.optional`} label={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_35')}`} helpText={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_36')}`}/>
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
                {`${t('SINGLE:MSG_PIPELINES_CREATEFORM_32')}`}
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

import * as _ from 'lodash';
import * as React from 'react';
import Form, { FormProps } from '@rjsf/core';
// import Form, { FormProps } from 'react-jsonschema-form';
import { Accordion, ActionGroup, Button, Alert } from '@patternfly/react-core';
import { history } from '@console/internal/components/utils';
import defaultWidgets from './widgets';
import defaultFields from './fields';
import { Tooltip } from '@patternfly/react-core';
import { FieldTemplate as DefaultFieldTemplate, ObjectFieldTemplate as DefaultObjectFieldTemplate, ArrayFieldTemplate as DefaultArrayFieldTemplate, ErrorTemplate as DefaultErrorTemplate } from './templates';
import { K8S_UI_SCHEMA } from './const';
import { getSchemaErrors } from './utils';
import { isSaveButtonDisabled, saveButtonDisabledString } from '@console/internal/components/hypercloud/utils/button-state';
import { useTranslation } from 'react-i18next';
import './styles.scss';

function editFormData(formData) {
  // formData를 수정해야하는 경우 ex - 필수값인데 없이 생성하여도 생성되는 경우 -> Edit 페이지에서 에러 남.
  let { kind } = formData;

  if (kind === 'LimitRange') {
    let changedFormData = formData;
    if (formData?.spec?.limits === null) {
      changedFormData.spec.limits = [];
    }
    return changedFormData;
  }
  return formData;
}
export const DynamicForm: React.FC<DynamicFormProps> = props => {
  const { t } = useTranslation();
  const { ArrayFieldTemplate = DefaultArrayFieldTemplate, errors = [], ErrorTemplate = DefaultErrorTemplate, fields = {}, FieldTemplate = DefaultFieldTemplate, formContext, noValidate = false, ObjectFieldTemplate = DefaultObjectFieldTemplate, onChange = _.noop, onError = _.noop, onSubmit = _.noop, schema, uiSchema = {}, widgets = {}, create = true } = props;
  const schemaErrors = getSchemaErrors(schema);
  let { formData } = props;
  // IF the top level schema is unsupported, don't render a form at all.
  if (schemaErrors.length) {
    // eslint-disable-next-line no-console
    console.warn('A form could not be generated for this resource.', schemaErrors);
    return <Alert isInline className="co-alert co-break-word" variant="info" title={'A form is not available for this resource. Please use the YAML View.'} />;
  }

  formData = editFormData(formData);

  const isButtonDisabled = formData.status && isSaveButtonDisabled(formData);

  return (
    <>
      <Alert isInline className="co-alert co-break-word" variant="info" title={t('COMMON:MSG_COMMON_CREATEFORM_MESSAGE_1')} />
      <Accordion asDefinitionList={false} className="co-dynamic-form__accordion">
        <Form
          className="co-dynamic-form"
          // liveValidate={true}
          noValidate={noValidate}
          ArrayFieldTemplate={ArrayFieldTemplate}
          fields={{ ...defaultFields, ...fields }}
          FieldTemplate={FieldTemplate}
          formContext={{ ...formContext, formData }}
          formData={formData}
          noHtml5Validate
          ObjectFieldTemplate={ObjectFieldTemplate}
          onChange={next => onChange(next.formData)}
          onError={newErrors => onError(_.map(newErrors, error => error.stack))}
          onSubmit={onSubmit}
          schema={schema}
          // Don't show the react-jsonschema-form error list at top
          showErrorList={false}
          uiSchema={_.defaultsDeep({}, K8S_UI_SCHEMA, uiSchema)}
          widgets={{ ...defaultWidgets, ...widgets }}
        >
          {errors.length > 0 && <ErrorTemplate errors={errors} />}
          <div style={{ paddingBottom: '30px' }}>
            <ActionGroup className="pf-c-form">
              {!!isButtonDisabled ? (
                <Tooltip content={saveButtonDisabledString(t)} maxWidth="30rem" position="bottom">
                  <div>
                    <Button type="submit" variant="primary" isDisabled={true}>
                      {create ? t('COMMON:MSG_COMMON_BUTTON_COMMIT_1') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')}
                    </Button>
                  </div>
                </Tooltip>
              ) : (
                <Button type="submit" variant="primary" isDisabled={false}>
                  {create ? t('COMMON:MSG_COMMON_BUTTON_COMMIT_1') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')}
                </Button>
              )}
              <Button onClick={history.goBack} variant="secondary">
                {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
              </Button>
            </ActionGroup>
          </div>
        </Form>
      </Accordion>
    </>
  );
};

type DynamicFormProps = FormProps<any> & {
  errors?: string[];
  ErrorTemplate?: React.FC<{ errors: string[] }>;
  create?: boolean;
};

export * from './types';
export * from './const';

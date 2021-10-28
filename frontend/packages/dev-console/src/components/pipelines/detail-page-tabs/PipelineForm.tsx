import * as React from 'react';
import * as _ from 'lodash';
import { Formik } from 'formik';
import { k8sUpdate, K8sResourceKind } from '@console/internal/module/k8s';
import { PipelineModel } from '@console/internal/models';
import { useTranslation } from 'react-i18next';

export interface PipelineFormProps {
  PipelineFormComponent: React.ComponentType<any>;
  formName: string;
  validationSchema: any;
  obj: K8sResourceKind;
}

const PipelineForm: React.FC<PipelineFormProps> = ({
  PipelineFormComponent,
  formName,
  validationSchema,
  obj,
}) => {
  const { t } = useTranslation();
  let successMessage;
  if (formName == 'parameters') {
    successMessage = t('SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABPARAMETERS_2');
  } else if (formName == 'resources') {
    successMessage = t('SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABRESOURCES_2');
  }
  const initialValues = {
    parameters: _.get(obj.spec, 'params', []),
    resources: _.get(obj.spec, 'resources', []),
  };

  const handleSubmit = (values, actions) => {
    actions.setSubmitting(true);

    k8sUpdate(
      PipelineModel,
      { ...obj, spec: { ...obj.spec, params: values.parameters, resources: values.resources } },
      obj.metadata.namespace,
      obj.metadata.name,
    )
      .then((newObj) => {
        actions.setSubmitting(false);
        actions.resetForm({
          values: {
            parameters: _.get(newObj.spec, 'params', []),
            resources: _.get(newObj.spec, 'resources', []),
          },
          status: { success: successMessage },
        });
      })
      .catch((err) => {
        actions.setSubmitting(false);
        actions.setStatus({ submitError: err.message });
      });
  };

  const handleReset = (values, actions) => {
    actions.resetForm({ status: {} });
  };

  return (
    <div className="co-m-pane__body">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onReset={handleReset}
        validationSchema={validationSchema}
        render={(props) => <PipelineFormComponent namespace={obj.metadata.namespace} {...props} />}
      />
    </div>
  );
};

export default PipelineForm;

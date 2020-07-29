import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Formik, FormikBag } from 'formik';
import { history } from '../../../../../../public/components/utils';
import { k8sCreate, k8sUpdate } from '../../../../../../public/module/k8s';
import { PipelineModel } from '../../../models';
import { Pipeline } from '../../../utils/pipeline-augment';
import PipelineBuilderForm from './PipelineBuilderForm';
import {
  PipelineBuilderFormValues,
  PipelineBuilderFormikValues
} from './types';
import {
  convertBuilderFormToPipeline,
  convertPipelineToBuilderForm,
  getPipelineURL
} from './utils';
import { validationSchema } from './validation-utils';

import './PipelineBuilderPage.scss';

type PipelineBuilderPageProps = RouteComponentProps<{ ns?: string }> & {
  existingPipeline?: Pipeline;
};

export const PipelineBuilderPage: React.FC<PipelineBuilderPageProps> = props => {
  const {
    existingPipeline,
    match: {
      params: { ns }
    }
  } = props;

  const initialValues: PipelineBuilderFormValues = {
    name: '',
    params: [],
    resources: [],
    tasks: [],
    listTasks: [],
    ...(convertPipelineToBuilderForm(existingPipeline) || {})
  };

  const handleSubmit = (
    values: PipelineBuilderFormikValues,
    actions: FormikBag<any, PipelineBuilderFormValues>
  ) => {
    let resourceCall;
    if (existingPipeline) {
      resourceCall = k8sUpdate(
        PipelineModel,
        convertBuilderFormToPipeline(values, ns, existingPipeline),
        ns,
        existingPipeline.metadata.name
      );
    } else {
      resourceCall = k8sCreate(
        PipelineModel,
        convertBuilderFormToPipeline(values, ns)
      );
    }

    return resourceCall
      .then(() => {
        actions.setSubmitting(false);
        history.push(`${getPipelineURL(ns)}/${values.name}`);
      })
      .catch(e => {
        actions.setStatus({ submitError: e.message });
      });
  };

  return (
    <div className="odc-pipeline-builder-page">
      <Helmet>
        <title>Pipeline Builder</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onReset={history.goBack}
        validationSchema={validationSchema}
        render={formikProps => (
          <PipelineBuilderForm
            {...formikProps}
            namespace={ns}
            existingPipeline={existingPipeline}
          />
        )}
      />
    </div>
  );
};

// export default PipelineBuilderPage;

import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Formik, FormikBag } from 'formik';
import { history } from '@console/internal/components/utils';
import { k8sCreate, k8sUpdate } from '@console/internal/module/k8s';
import { PipelineModel } from '@console/internal/models';
import { Pipeline } from '../../../utils/pipeline-augment';
import PipelineBuilderForm from './PipelineBuilderForm';
import { PipelineBuilderFormValues, PipelineBuilderFormikValues } from './types';
import {
  convertBuilderFormToPipeline,
  convertPipelineToBuilderForm,
  getPipelineURL,
} from './utils';
import { validationSchema } from './validation-utils';
//import { useTranslation } from 'react-i18next';
//import { TFunction } from 'i18next';
//import { ResourceLabel } from '../../../../../../public/models/hypercloud/resource-plural'

import './PipelineBuilderPage.scss';
//import { pluralToKind } from 'public/components/hypercloud/form';

type PipelineBuilderPageProps = RouteComponentProps<{ ns?: string }> & {
  existingPipeline?: Pipeline;
  isCreate?: boolean;
};

const PipelineBuilderPage: React.FC<PipelineBuilderPageProps> = (props) => {
  //const { t } = useTranslation();
  const {
    existingPipeline,
    match: {
      params: { ns },
    },
  } = props;

  const initialValues: PipelineBuilderFormValues = {
    name: 'new-pipeline',
    params: [],
    resources: [],
    workspaces: [],
    tasks: [],
    listTasks: [],
    ...(convertPipelineToBuilderForm(existingPipeline) || {}),
  };

  const handleSubmit = (
    values: PipelineBuilderFormikValues,
    actions: FormikBag<any, PipelineBuilderFormValues>,
  ) => {
    let resourceCall;
    if (existingPipeline) {
      resourceCall = k8sUpdate(
        PipelineModel,
        convertBuilderFormToPipeline(values, ns, existingPipeline),
        ns,
        existingPipeline.metadata.name,
      );
    } else {
      resourceCall = k8sCreate(PipelineModel, convertBuilderFormToPipeline(values, ns));
    }

    return resourceCall
      .then(() => {
        actions.setSubmitting(false);
        history.push(`${getPipelineURL(ns)}/${values.name}`);
      })
      .catch((e) => {
        actions.setStatus({ submitError: e.message });
      });
  };
  //const kind = pluralToKind(PipelineModel.kind);
  //const kind = PipelineModel.kind;
  //const title = t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel({kind: kind}, t) });

  return (
    <div className="odc-pipeline-builder-page">
      <Helmet>
        <title>Create Pipeline</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onReset={history.goBack}
        validationSchema={validationSchema}
        render={(formikProps) => (
          <PipelineBuilderForm
            {...formikProps}
            namespace={ns}
            existingPipeline={existingPipeline}
            isCreate={props.isCreate}
          />
        )}
      />
    </div>
  );
};

export default PipelineBuilderPage;

import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Formik, FormikBag } from 'formik';
import { history } from '@console/internal/components/utils';
import { k8sCreate, K8sResourceKindReference, k8sUpdate } from '@console/internal/module/k8s';
import { PipelineModel } from '@console/internal/models';
import { CreateDefault } from '@console/internal/components/hypercloud/crd/create-pinned-resource';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
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

type PipelineBuilderPageProps = RouteComponentProps<{ name: string; appName: string; ns: string; plural: K8sResourceKindReference }> & {
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

  const getCustomFormEditor = ({ isCreate }) => props => {
    const { formData, onChange } = props;
    const initialValues = React.useMemo(() => convertPipelineToBuilderForm(formData), [formData]);
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onReset={history.goBack}
        validationSchema={validationSchema}
        render={formikProps => {
          const { values } = formikProps;
          React.useEffect(() => {
            onChange && onChange(convertBuilderFormToPipeline(values, ns));
          }, [values]);
          return <PipelineBuilderForm {...formikProps} namespace={ns} existingPipeline={existingPipeline} isCreate={isCreate} />;
        }}
      />
    );
  };

  return (
    <div className="odc-pipeline-builder-page">
      <Helmet>
        <title>Create Pipeline</title>
      </Helmet>
      <CreateDefault initialEditorType={EditorType.Form} create={true} model={PipelineModel} match={props.match} loaded={false} customFormEditor={getCustomFormEditor({ isCreate: true })} />;
    </div>
  );
};

export default PipelineBuilderPage;

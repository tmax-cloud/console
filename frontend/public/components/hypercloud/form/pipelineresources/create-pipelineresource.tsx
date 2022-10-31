import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { PipelineResourceModel } from '../../../../models';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { useTranslation } from 'react-i18next';
import { EditDefault } from '../../crd/edit-resource';
import { CreateDefault } from '../../crd/create-pinned-resource';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { K8sResourceKindReference } from 'public/module/k8s';
import { convertToForm, onSubmitCallback } from './sync-form-data';
import { defaultTemplateMap } from '@console/internal/components/hypercloud/form';

const CreatePipelineResourceComponent: React.FC<PipelineResourceFormProps> = props => {
  const { formData } = props;
  const { control } = useFormContext();
  const { t } = useTranslation();

  const [labels] = React.useState(formData?.metadata?.labels || []);

  const typeList = { git: t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_7'), image: t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_8') };
  const type = useWatch({
    control: control,
    name: 'spec.type',
    defaultValue: 'git',
  });

  const methods = useFormContext();
  const {
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;
  let defaultRevision = '';
  let defaultUrl = '';

  if (defaultValues.spec?.params !== undefined) {
    defaultValues.spec.params.forEach(element => {
      if (element.name === 'revision') {
        defaultRevision = element.value;
      }
      if (element.name === 'url') {
        defaultUrl = element.value;
      }
    });
  }

  return (
    <>
      <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_2')} id="label" description={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_3')}>
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={labels} />
      </Section>

      <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_4')} id="type" description={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_10')}>
        <Dropdown name="spec.type" items={typeList} defaultValue={defaultValues.spec?.type} />
      </Section>

      {type === 'git' && (
        <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_5')} id="revision" description={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_11')}>
          <TextInput inputClassName="pf-c-form-control" id="spec.revision" name="spec.revision" defaultValue={defaultRevision} />
        </Section>
      )}
      {type === 'git' && (
        <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_6')} id="url" description={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_12')}>
          <TextInput inputClassName="pf-c-form-control" id="spec.url" name="spec.url" defaultValue={defaultUrl} />
        </Section>
      )}

      {type === 'image' && (
        <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_6')} id="url" description="참조할 이미지 주소 또는 이미지가 저장될 주소">
          <TextInput inputClassName="pf-c-form-control" id="spec.url" name="spec.url" defaultValue={defaultUrl} />
        </Section>
      )}
    </>
  );
};

const getCustomFormEditor = ({ match, kind, Form, isCreate }) => props => {
  const { formData, onChange } = props;
  const _formData = React.useMemo(() => convertToForm(formData), [formData]);
  const setFormData = React.useCallback(formData => onSubmitCallback(formData), [onSubmitCallback]);
  const watchFieldNames = ['metadata.labels', 'spec.revision', 'spec.url', 'spec.type'];
  return <Form {...props} fixed={{ apiVersion: `${PipelineResourceModel.apiGroup}/${PipelineResourceModel.apiVersion}`, kind, metadata: { namespace: match.params.ns } }} onSubmitCallback={onSubmitCallback} isCreate={isCreate} formData={_formData} setFormData={setFormData} onChange={onChange} watchFieldNames={watchFieldNames} />;
};

export const CreatePipelineResource: React.FC<CreatePipelineResourceProps> = props => {
  const { match, kind, obj } = props;
  const Form = WithCommonForm(CreatePipelineResourceComponent, match.params, obj || defaultTemplateMap.get(kind), null, true);

  if (obj) {
    // edit form
    return <EditDefault initialEditorType={EditorType.Form} create={false} model={PipelineResourceModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form, isCreate: false })} obj={obj} />;
  }
  // create form
  return <CreateDefault initialEditorType={EditorType.Form} create={true} model={PipelineResourceModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form, isCreate: true })} />;
};

type CreatePipelineResourceProps = {
  match: RMatch<{ name: string; appName: string; ns: string; plural: K8sResourceKindReference }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
  obj: any;
};

type PipelineResourceFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
  formData: any;
};

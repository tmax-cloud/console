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

const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};

const pipelineResourceFormFactory = params => {
  return WithCommonForm(CreatePipelineResourceComponent, params, defaultValues);
};

const CreatePipelineResourceComponent: React.FC<PipelineResourceFormProps> = props => {
  const { control } = useFormContext();
  const { t } = useTranslation();

  const typeList = { git: t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_7'), image: t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_8') };
  const type = useWatch({
    control: control,
    name: 'spec.type',
    defaultValue: 'git',
  });

  return (
    <>
      <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_2')} id="label" description={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_3')}>
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>

      <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_4')} id="type">
        <Dropdown name="spec.type" items={typeList} defaultValue={type} />
      </Section>

      {type === 'git' && (
        <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_5')} id="revision">
          <TextInput inputClassName="pf-c-form-control" id="spec.revision" name="spec.revision" />
        </Section>
      )}

      <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_6')} id="url">
        <TextInput inputClassName="pf-c-form-control" id="spec.url" name="spec.url" />
      </Section>
    </>
  );
};

export const CreatePipelineResource: React.FC<CreatePipelineResourceProps> = ({ match: { params }, kind }) => {
  const formComponent = pipelineResourceFormFactory(params);
  const PipelineResourceFormComponent = formComponent;
  return <PipelineResourceFormComponent fixed={{ apiVersion: `${PipelineResourceModel.apiGroup}/${PipelineResourceModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);

  let params = [];
  data.spec.revision && params.push({ name: 'revision', value: data.spec.revision });
  params.push({ name: 'url', value: data.spec.url });

  delete data.metadata.labels;
  delete data.spec.params;
  delete data.spec.revision;
  delete data.spec.url;

  data = _.defaultsDeep({ metadata: { labels: labels }, spec: { params: params } }, data);
  return data;
};

type CreatePipelineResourceProps = {
  match: RMatch<{
    ns?: string;
  }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
};

type PipelineResourceFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

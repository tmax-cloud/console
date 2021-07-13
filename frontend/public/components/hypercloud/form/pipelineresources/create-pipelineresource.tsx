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

const defaultValuesTemplate = {
  metadata: {
    name: 'example-name',
  },
  spec: {
    type: 'git'
  }
};

const pipelineResourceFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;
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

  const methods = useFormContext();
  const {
    control: {
      defaultValuesRef: { current: defaultValues }
    },
  } = methods;
  let defaultRevision = '';
  let defaultUrl = '';

  if (defaultValues.spec.params !== undefined) {
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
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>

      <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_4')} id="type" description={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_10')}>
        <Dropdown name="spec.type" items={typeList} defaultValue={defaultValues.spec.type} />
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
        <Section label={t('SINGLE:MSG_PIPELINERESOURCES_CREATEFORM_6')} id="url" description='참조할 이미지 주소 또는 이미지가 저장될 주소'>
          <TextInput inputClassName="pf-c-form-control" id="spec.url" name="spec.url" defaultValue={defaultUrl} />
        </Section>
      )}
    </>
  );
};

export const CreatePipelineResource: React.FC<CreatePipelineResourceProps> = ({ match: { params }, kind, obj }) => {
  const formComponent = pipelineResourceFormFactory(params, obj);
  const PipelineResourceFormComponent = formComponent;
  return <PipelineResourceFormComponent fixed={{ apiVersion: `${PipelineResourceModel.apiGroup}/${PipelineResourceModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);
  if (_.isArray(data.metadata.labels)) {
    data.metadata.labels.forEach(cur => {
      labels = typeof cur === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
    });
  } else {
    labels = typeof data.metadata.labels === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
  }

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
  obj: any;
};

type PipelineResourceFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

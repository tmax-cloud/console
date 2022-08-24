import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { WithCommonForm } from '../create-form';
import { RadioGroup } from '../../utils/radio';
import { TextInput } from '../../utils/text-input';
import { HelmRepositoryModel } from '@console/internal/models/hypercloud/helm-model';
import { helmAPI } from '@console/internal/actions/utils/nonk8s-utils'

const typeItems = [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: 'Public',
    desc: 'Public',
    value: 'Public',
  },
  {
    title: 'Private',
    desc: 'Private',
    value: 'Private',
  },
];

const defaultValuesTemplate = {
  name: '',
  repoURL: '',
};

const repositoryFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;
  return WithCommonForm(CreateHelmRepositoryComponent, params, defaultValues, HelmRepositoryModel);
};
const CreateHelmRepositoryComponent: React.FC<HelmRepositoryFormProps> = props => {
  const methods = useFormContext();

  const {
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;
  const { t } = useTranslation();
  const type = useWatch<string>({
    control: methods.control,
    name: 'type',
    defaultValue: 'Public',
  });

  return (
    <>
      <Section label={'리포지터리 타입'} id="repositorytype">
        <RadioGroup name="type" items={typeItems} inline={false} initValue={type} />
      </Section>
      <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_2')} id="name" isRequired={true}>
        <TextInput inputClassName="pf-c-form-control" id="name" name="name" defaultValue={defaultValues.name} />
      </Section>
      <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
        <TextInput inputClassName="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={defaultValues.repoURL} />
      </Section>
      {type === 'Private' && (
        <>
          <Section label={t('SINGLE:MSG_VIRTUALMACHINES_CREATEFORM_STEP4_DIV2_5')} id="id" isRequired={true}>
            <TextInput inputClassName="pf-c-form-control" id="id" name="id" defaultValue={defaultValues.id} />
          </Section>
          <Section label={t('SINGLE:MSG_VIRTUALMACHINES_CREATEFORM_STEP4_DIV2_6')} id="password" isRequired={true}>
            <TextInput inputClassName="pf-c-form-control" id="password" name="password" defaultValue={defaultValues.password} />
          </Section>
        </>
      )}
    </>
  );
};

export const CreateHelmRepository: React.FC<CreateHelmRepositoryProps> = props => {
  const formComponent = repositoryFormFactory(props.match.params, props.obj);
  const HelmRepositoryFormComponent = formComponent;
  return <HelmRepositoryFormComponent fixed={{}} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
};

export const onSubmitCallback = data => {
  const returnData = {
    nonK8sResource: true,
    kind: HelmRepositoryModel.kind,
    postUrl: `${helmAPI}/repos`,
    name: data.name,
    repoURL: data.repoURL,
  };

  if (data.type === 'Private') {
    Object.assign(returnData, { is_private: true, id: data.id, password: data.password });
  }

  return returnData;
};

type CreateHelmRepositoryProps = {
  match: RMatch<{
    type?: string;
  }>;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
  obj?: any;
};

type HelmRepositoryFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { getIngressUrl } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { WithCommonForm } from '../create-form';
import { RadioGroup } from '../../utils/radio';
import { TextInput } from '../../utils/text-input';
import { HelmRepositoryModel } from '@console/internal/models/hypercloud/helm-model';

const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

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
  return WithCommonForm(CreateRepositoryComponent, params, defaultValues, HelmRepositoryModel);
};
const CreateRepositoryComponent: React.FC<RepositoryFormProps> = props => {
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
  const [postUrl, setPostUrl] = React.useState('');
  React.useEffect(() => {
    const getUrl = async () => {
      const tempHost = await getHost();
      setPostUrl(`${tempHost}/helm/repos`);
    };
    getUrl();
  }, []);
  React.useEffect(() => {
    methods.setValue('postUrl', postUrl);
  }, [postUrl]);

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
      <TextInput inputClassName="pf-c-form-control" id="postUrl" name="postUrl" defaultValue="" hidden={true} />
    </>
  );
};

export const CreateRepository: React.FC<CreateRepositoryProps> = props => {
  const formComponent = repositoryFormFactory(props.match.params, props.obj);
  const RepositoryFormComponent = formComponent;
  return <RepositoryFormComponent fixed={{}} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
};

export const onSubmitCallback = data => {
  const returnData = {
    nonK8sResource: true,
    kind: 'HelmRepository',
    postUrl: data.postUrl,
    name: data.name,
    repoURL: data.repoURL,
  };

  if (data.type === 'Private') {
    Object.assign(returnData, { is_private: true, id: data.id, password: data.password });
  }

  return returnData;
};

type CreateRepositoryProps = {
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

type RepositoryFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};


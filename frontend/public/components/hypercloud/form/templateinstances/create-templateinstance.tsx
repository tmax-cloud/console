import * as _ from 'lodash-es';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { match as RMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { RadioGroup } from '../../utils/radio';
import { TextInput } from '../../utils/text-input';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { k8sGet } from '../../../../module/k8s';
import { TemplateModel, ClusterTemplateModel, TemplateInstanceModel } from '../../../../models';
import store from '../../../../redux';
import { getActiveNamespace } from '@console/internal/reducers/ui';

const defaultValues = {
  metadata: {
    name: 'template-instance-example',
  },
};

const templateInstanceFormFactory = params => {
  return WithCommonForm(CreateTemplateInstanceComponent, params, defaultValues);
};

const CreateTemplateInstanceComponent: React.FC<TemplateInstanceFormProps> = props => {
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const templateType = searchParams.get('type');
  const loadedTemplateName = searchParams.get('templateName');

  const methods = useFormContext();
  const {
    formState: { errors },
  } = methods;
  const namespace = getActiveNamespace(store.getState());
  const [paramList, setParamList] = useState([]);

  const validationError = {
    required: 'COMMON:MSG_COMMON_ERROR_MESSAGE_53',
    pattern: 'COMMON:MSG_COMMON_ERROR_MESSAGE_54',
  };

  const typeItems = [
    {
      title: t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV3_1'),
      value: 'Template',
    },
    {
      title: t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV4_1'),
      value: 'ClusterTemplate',
    },
  ];

  const selectedType = useWatch({
    control: methods.control,
    name: 'type',
    defaultValue: templateType === 'ClusterTemplate' ? 'ClusterTemplate' : 'Template',
  });

  const selectedTemplate = useWatch({
    control: methods.control,
    name: 'template',
    defaultValue: loadedTemplateName ? loadedTemplateName : '',
  });

  const templateDropdown =
    selectedType === 'Template' ? (
      <Section label={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV11_1')} id="template" isRequired={true}>
        {!!loadedTemplateName ? <div>{loadedTemplateName}</div> : <ResourceDropdown name="template" idFunc={resource => `${resource.kind}~~${resource.metadata.name}`} methods={methods} placeholder={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV12_1')} resources={[{ kind: TemplateModel.kind, namespace: namespace, prop: 'template' }]} type="single" defaultValue="" useHookForm />}
      </Section>
    ) : (
      <Section label={t('COMMON:MSG_LNB_MENU_181')} id="clustertemplate" isRequired={true}>
        {!!loadedTemplateName ? <div>{loadedTemplateName}</div> : <ResourceDropdown name="template" idFunc={resource => `${resource.kind}~~${resource.metadata.name}`} methods={methods} placeholder={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV12_1')} resources={[{ kind: ClusterTemplateModel.kind, prop: 'clustertemplate' }]} type="single" defaultValue="" useHookForm />}
      </Section>
    );

  const getTemplateParameters = async selectedTemplateName => {
    if (selectedTemplateName === '') {
      setParamList([]);
    } else {
      if (selectedType === 'Template') {
        const template = await k8sGet(TemplateModel, selectedTemplateName, namespace);
        const parametersList = template?.parameters?.map((paramObj, index) => {
          const inputType = !!paramObj.valueType ? paramObj.valueType : 'text';
          const sectionId = `param-${paramObj.name}`;
          const id = `params.${paramObj.name}`;
          const error = _.get(errors, id);
          const errorMsg = error ? validationError[error.type] : null;
          const validationRule = { required: paramObj.required, pattern: new RegExp(paramObj.regex) };
          if (inputType === 'number') {
            // MEMO : input의 type을 number로 해도 submit 시에 data엔 string으로 들어가있어서 number로 변환해주기 위해 Controller사용하고 input onChange부분에서 숫자로 변환해줌.
            return (
              <Section key={sectionId} id={sectionId} label={paramObj.name} description={paramObj.description} isRequired={paramObj.required} valid={!error} validationErrorDesc={errorMsg}>
                <Controller
                  control={methods.control}
                  name={id}
                  defaultValue={paramObj.value}
                  rules={validationRule}
                  render={props => (
                    <input
                      {...props}
                      type={inputType}
                      className="pf-c-form-control"
                      placeholder={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV14_1')}
                      onChange={e => {
                        props.onChange(parseInt((e.target as HTMLInputElement).value, 10));
                      }}
                    />
                  )}
                />
              </Section>
            );
          } else {
            return (
              <Section key={sectionId} id={sectionId} label={paramObj.name} description={paramObj.description} isRequired={paramObj.required} valid={!error} validationErrorDesc={errorMsg}>
                <TextInput id={id} type={inputType} inputClassName="pf-c-form-control" methods={methods} defaultValue={paramObj.value} placeholder={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV14_1')} valid={!error} validation={validationRule} />
              </Section>
            );
          }
        });
        setParamList(parametersList);
      } else if (selectedType === 'ClusterTemplate') {
        const clusterTemplate = await k8sGet(ClusterTemplateModel, selectedTemplateName);
        const parametersList = clusterTemplate?.parameters?.map((paramObj, index) => {
          const inputType = !!paramObj.valueType ? paramObj.valueType : 'text';
          const sectionId = `param-${paramObj.name}`;
          const id = `params.${paramObj.name}`;
          const error = _.get(errors, id);
          const errorMsg = error ? validationError[error.type] : null;
          const validationRule = { required: paramObj.required, pattern: new RegExp(paramObj.regex) };
          if (inputType === 'number') {
            return (
              <Section key={sectionId} id={sectionId} label={paramObj.name} description={paramObj.description} isRequired={paramObj.required} valid={!error} validationErrorDesc={errorMsg}>
                <Controller
                  control={methods.control}
                  name={id}
                  defaultValue={paramObj.value}
                  rules={validationRule}
                  render={props => (
                    <input
                      {...props}
                      type={inputType}
                      className="pf-c-form-control"
                      placeholder={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV14_1')}
                      onChange={e => {
                        props.onChange(parseInt((e.target as HTMLInputElement).value, 10));
                      }}
                    />
                  )}
                />
              </Section>
            );
          } else {
            return (
              <Section key={sectionId} id={sectionId} label={paramObj.name} description={paramObj.description} isRequired={paramObj.required} valid={!error} validationErrorDesc={errorMsg}>
                <TextInput id={id} type={inputType} inputClassName="pf-c-form-control" methods={methods} defaultValue={paramObj.value} placeholder={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV14_1')} valid={!error} validation={validationRule} />
              </Section>
            );
          }
        });
        setParamList(parametersList);
      }
    }
  };

  useEffect(() => {
    setParamList([]);
  }, [selectedType]);

  useEffect(() => {
    if (!!loadedTemplateName) {
      const templateName = loadedTemplateName;
      getTemplateParameters(templateName);
    } else {
      const templateName = selectedTemplate.split('~~')[1];
      getTemplateParameters(templateName);
    }
  }, [selectedTemplate, errors]);

  return (
    <>
      <Section label={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV8_1')} id="label" description={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV10_1')}>
        <Controller name="labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={methods.control} tags={[]} />
      </Section>
      <div className="co-form-section__separator" />
      <Section label={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV2_23')} id="typeSection" isRequired>
        <RadioGroup name="type" items={typeItems} inline={false} initValue={selectedType} methods={methods} />
      </Section>
      {templateDropdown}
      {!!paramList ? (
        paramList?.length > 0 ? (
          <>
            <label className="control-label">{t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV13_1')}</label>
            {paramList}
          </>
        ) : (
          <>
            <label className="control-label">{t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV13_1')}</label>
            <div className="help-block">{t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV16_1')}</div>
          </>
        )
      ) : null}
    </>
  );
};

export const CreateTemplateInstance: React.FC<CreateTemplateInstanceProps> = ({ match: { params }, kind }) => {
  const { t } = useTranslation();
  const formComponent = templateInstanceFormFactory(params);
  const TemplateInstanceFormComponent = formComponent;

  return <TemplateInstanceFormComponent fixed={{ apiVersion: `${TemplateInstanceModel.apiGroup}/${TemplateInstanceModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} nameSectionTitle={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV5_1')} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm />;
};

export const onSubmitCallback = data => {
  const searchParams = new URLSearchParams(location.search);
  const templateType = searchParams.get('type');
  const loadedTemplateName = searchParams.get('templateName');
  const namespace = getActiveNamespace(store.getState());
  const template = data.template;
  const templateKind = templateType ? templateType : template?.split('~~')[0];
  const templateName = loadedTemplateName ? loadedTemplateName : template?.split('~~')[1];
  delete data.template;
  delete data.type;
  // MEMO : labels data
  const labels = _.cloneDeep(data.labels);
  const formattedLabels = {};
  labels?.forEach(label => {
    const fragments = label.split('=');
    if (fragments?.length > 0) {
      const key = fragments[0];
      const value = fragments[1];
      if (!!value) {
        formattedLabels[key] = value;
      }
    }
  });
  delete data.labels;

  // MEMO : parameters data
  const params = _.cloneDeep(data.params);
  let formattedParams = [];
  for (const key in params) {
    formattedParams.push({ name: key, value: params[key] });
  }
  delete data.params;

  // MEMO : final data
  if (templateKind === 'Template') {
    data = _.defaultsDeep({ metadata: { labels: formattedLabels }, spec: { template: { metadata: { name: templateName, namespace: namespace }, parameters: formattedParams } } }, data);
  } else {
    data = _.defaultsDeep(
      {
        metadata: { labels: formattedLabels },
        spec: {
          clustertemplate: { metadata: { name: templateName }, parameters: formattedParams },
        },
      },
      data,
    );
  }
  //   console.log('data? ', data);
  return data;
};

type CreateTemplateInstanceProps = {
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

type TemplateInstanceFormProps = {};

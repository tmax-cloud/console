import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { WithCommonForm } from '../create-form';
import { match as RMatch } from 'react-router';
import { SelectorInput } from '../../../utils';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Section } from '../../utils/section';
import { TextInput } from '../../utils/text-input';
import { RadioGroup } from '../../utils/radio';
import { ListView } from '../../utils/list-view';
import { ServiceBindingModel } from '../../../../models';
import { CheckboxSingle } from '../../utils/checkbox_single';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { coFetchJSON } from '../../../../co-fetch';
import { k8sList, modelFor } from '../../../../../public/module/k8s';

import { BackupServiceItem } from './backup-service-item';
import { BindingDataItem } from './binding-data-item';
import { BindableResourceListDropDown } from './bindable-resource-list-drop-down';
import { useState } from 'react';

const defaultValuesTemplate = {
  metadata: {
    name: 'example',
    namespace: '',
  },
  spec: {
    application: {
      kind: '',
      group: '',
      version: '',
      name: '',
    },
    services: [
      {
        namespace: '',
        group: '',
        version: '',
        kind: '',
        name: '',
      },
    ],
    mappings: [],
    detectBindingResources: false,
  },
};

const methodItems = t => [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_2'),
    desc: '',
    value: 'Auto',
  },
  {
    title: t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_3'),
    desc: '',
    value: 'Manual',
  },
];

const bindAsFilesItems = t => [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_23'),
    desc: '',
    value: 'false',
  },
  {
    title: t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_24'),
    desc: '',
    value: 'true',
  },
];

const servicebindingFormFactory = (params, obj) => {
  defaultValuesTemplate.metadata.namespace = params.ns;
  const defaultValues = obj || defaultValuesTemplate;

  return WithCommonForm(CreateServiceBindingComponent, params, defaultValues);
};

const backupServiceItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  const onDeleteClick = () => {
    const values = _.get(ListActions.getValues(), name);
    if (!!values && values.length > 1) {
      ListActions.remove(index);
    }
  };

  return <BackupServiceItem item={item} name={name} index={index as number} onDeleteClick={onDeleteClick} methods={methods} ListActions={ListActions} key={index} />;
};

const bindingDataItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  const onDeleteClick = () => {
    const values = _.get(ListActions.getValues(), name);
    if (!!values && values.length > 0) {
      ListActions.remove(index);
    }
  };

  return <BindingDataItem item={item} name={name} index={index as number} onDeleteClick={onDeleteClick} methods={methods} ListActions={ListActions} key={index} />;
};

const CreateServiceBindingComponent: React.FC<ServiceBindingFormProps> = props => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const methodToggle = useWatch({
    name: 'method',
    defaultValue: 'Auto',
  });
  const bindAsFilesToggle = useWatch({
    name: 'bindAsFiles',
    defaultValue: 'false',
  });
  const methods = useFormContext();

  const {
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;

  const selectedApplication = useWatch<string>({
    control: control,
    name: 'spec.application.kind',
  });
  const [applicationList, setApplicationList] = React.useState([]);

  React.useEffect(() => {
    const model = modelFor(selectedApplication);
    if (model) {
      methods.setValue('spec.application.group', model.apiGroup);
      methods.setValue('spec.application.version', model.apiVersion);
      k8sList(model, { ns: defaultValues.metadata.namespace }).then(list => {
        setApplicationList(list);
      });
    } else {
      setApplicationList([]);
    }
  }, [selectedApplication]);

  const [manualVis, setManualVis] = useState(false);
  const [autoVis, setAutoVis] = useState(true);
  React.useEffect(() => {
    if (methodToggle === 'Manual') {
      setManualVis(true);
      setAutoVis(false);
    } else if (methodToggle === 'Auto') {
      setManualVis(false);
      setAutoVis(true);
    }
  }, [methodToggle]);

  return (
    <>
      <Section label="Labels" id="label" description="">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_1')} id="name" description="">
        <RadioGroup name="method" items={methodItems.bind(null, t)()} inline={false} initValue={methodToggle} />
      </Section>

      <div style={{ display: manualVis ? 'block' : 'none' }}>
        <div className="row">
          <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_4')} id="application" description="">
            <div className="col-xs-12 pairs-list__value-field">
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_14')} id="application" description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id="spec.application.group" name="spec.application.group" />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_15')} id="application" description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id="spec.application.version" name="spec.application.version" />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id="application" description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id="spec.application.kind" name="spec.application.kind" />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id="application" description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id="spec.application.name" name="spec.application.name" />
              </Section>
            </div>
          </Section>
        </div>
      </div>

      <div style={{ display: autoVis ? 'block' : 'none' }}>
        <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_4')} id="application" description="">
          <div className="col-xs-12 pairs-list__value-field">
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id="spec.application.kind" description="" isRequired>
              <Controller as={<BindableResourceListDropDown name={'spec.application.kind'} defaultValue={defaultValues.spec.application.kind} methods={methods} placeholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_6')} watchedFieldName={'spec.application.kind'} />} control={methods.control} name={'spec.application.kind'} defaultValue={defaultValues.spec.application.kind} />
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id="spec.application.name" description="" isRequired>
              <Controller as={<ResourceListDropdown name="spec.application.name" defaultValue={defaultValues.spec.application.name} methods={methods} placeholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_8')} resourceList={applicationList} kind={selectedApplication} type="single" watchedFieldName={'spec.application.name'} />} control={methods.control} name={'spec.application.name'} defaultValue={defaultValues.spec.application.name} />
            </Section>
          </div>
        </Section>
      </div>

      <Section id="services" isRequired={true}>
        <ListView methods={methods} name={`spec.services`} addButtonText={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_12')} headerFragment={<></>} itemRenderer={backupServiceItemRenderer} defaultItem={{ namespace: '', group: '', version: '', kind: '', name: '' }} defaultValues={defaultValues.spec.services} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_16')} id="mappings" isRequired={false} description={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_17')}>
        <ListView methods={methods} name={`spec.mappings`} addButtonText={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_18')} headerFragment={<></>} itemRenderer={bindingDataItemRenderer} defaultItem={{}} defaultValues={defaultValues.spec.mappings} />
      </Section>

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_22')} id="bindAsFiles" description={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_25')}>
        <RadioGroup name="bindAsFiles" items={bindAsFilesItems.bind(null, t)()} inline={false} initValue={bindAsFilesToggle} />
      </Section>

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_26')} id="detectBindingResources" description="">
        <CheckboxSingle name="detectBindingResources" label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_27')} defaultValue={defaultValues.spec.detectBindingResources} methods={methods} />
      </Section>

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_28')} id="namingStrategy" description={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_29')}>
        <TextInput inputClassName="pf-c-form-control" id="spec.namingStrategy" name="spec.namingStrategy" placeholder="예: {{ .service.kind | upper}}_{{ .name | upper }}" />
      </Section>
    </>
  );
};

export const CreateServiceBinding: React.FC<CreateServiceBindingProps> = props => {
  const { t } = useTranslation();
  const formComponent = servicebindingFormFactory(props.match.params, props.obj);
  const ServiceBindingFormComponent = formComponent;

  const [bindablesGroupVersion, setBindablesGroupVersion] = React.useState([]);

  React.useEffect(() => {
    const getBindables = async () => {
      const data = await coFetchJSON('api/hypercloud/bindableResources');
      setBindablesGroupVersion(data);
    };
    getBindables();
  }, []);

  const onSubmitCallback = data => {
    delete data.method;

    let apiVersion = `${ServiceBindingModel.apiGroup}/${ServiceBindingModel.apiVersion}`;
    let kind = ServiceBindingModel.kind;
    let labels = SelectorInput.objectify(data.metadata.labels);
    let name = data.metadata.name;
    delete data.metadata.labels;

    let bindAsFiles: boolean;

    bindAsFiles = data.bindAsFiles === 'false' ? false : true;

    let detectBindingResources = data.detectBindingResources;
    delete data.spec.detectBindingResources;

    let application = data.spec.application;
    delete data.spec.application;
    if (bindablesGroupVersion[application.kind].split('/').length == 1) {
      application.group = application.group ?? '';
      application.version = application.version ?? bindablesGroupVersion[application.kind].split('/')[0];
    } else {
      application.group = application.group ?? bindablesGroupVersion[application.kind].split('/')[0];
      application.version = application.version ?? bindablesGroupVersion[application.kind].split('/')[1];
    }

    let services = data.spec.services;
    delete data.spec.services;
    services.forEach(e => {
      if (bindablesGroupVersion[e.kind].split('/').length == 1) {
        e.group = e.group ?? '';
        e.version = e.version ?? bindablesGroupVersion[e.kind].split('/')[0];
      } else {
        e.group = e.group ?? bindablesGroupVersion[e.kind].split('/')[0];
        e.version = e.version ?? bindablesGroupVersion[e.kind].split('/')[1];
      }
    });

    data = _.defaultsDeep({ apiVersion: apiVersion, kind: kind, metadata: { name: name, labels: labels }, spec: { bindAsFiles: bindAsFiles, detectBindingResources: detectBindingResources, application: application, services: services } }, data);

    return data;
  };

  return <ServiceBindingFormComponent fixed={{ metadata: { namespace: props.match.params.ns } }} explanation={t('MSG_COMMON_CREATEFORM_DESCRIPTION_1')} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

type CreateServiceBindingProps = {
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

type ServiceBindingFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

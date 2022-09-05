import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { WithCommonForm } from '../create-form';
import { match as RMatch } from 'react-router';
import { Dropdown, SelectorInput } from '../../../utils';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Section } from '../../utils/section';
import { TextInput } from '../../utils/text-input';
import { RadioGroup } from '../../utils/radio';
import { ListView } from '../../utils/list-view';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { ServiceBindingModel, TaskModel } from '../../../../models';
import { CheckboxSingle } from '../../utils/checkbox_single';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { coFetchJSON } from '../../../../co-fetch';
import * as classNames from 'classnames';
import { k8sList, modelFor } from '../../../../../public/module/k8s';
import { ResourceDropdown } from '../../utils/resource-dropdown';


const defaultValuesTemplate = {
  metadata: {
    name: 'example',
    namespace: '',
  },
  spec: {
    services: [
      {
        namespace: '',
        group: '',
        version: '',
        kind: '',
        name: ''
      }
    ],
    mappings: [
    ],
    detectBindingResources: false
  }
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
  defaultValuesTemplate.metadata.namespace = params.ns
  const defaultValues = obj || defaultValuesTemplate

  return WithCommonForm(CreateServiceBindingComponent, params, defaultValues);
};

const BackupServiceItem = props => {
  const { t } = useTranslation()
  const { item, name, index, onDeleteClick } = props;

  return(
    <>
      <div className="co-form-section__separator" />
      <div className="row" key={item.id}>
        <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_9')} id={`${name}[${index}]`} description="">
          <div className="col-xs-12 pairs-list__value-field">
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_10')} id={`${name}[${index}].namespace`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].namespace`} name={`${name}[${index}].namespace`} defaultValue={item.namespace}/>
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_14')} id={`${name}[${index}].group`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].group`} name={`${name}[${index}].group`} defaultValue={item.group}/>
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_15')} id={`${name}[${index}].version`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].version`} name={`${name}[${index}].version`} defaultValue={item.version}/>
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id={`${name}[${index}].kind`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].kind`} name={`${name}[${index}].kind`} defaultValue={item.kind}/>
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id={`${name}[${index}].name`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].name`} name={`${name}[${index}].name`} defaultValue={item.name}/>
            </Section>
          </div>
          <div className="col-xs-1 pairs-list__action">
            <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
              <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
              <span>{t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_13')}</span>
            </Button>
          </div>
        </Section>
      </div>
    </>
  )
}

const backupServiceItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  const onDeleteClick = () => {
    const values = _.get(ListActions.getValues(), name);
    if (!!values && values.length > 1) {
      ListActions.remove(index);
    }
  };

  return <BackupServiceItem item={item} name={name} index={index as number} onDeleteClick={onDeleteClick} methods={methods} ListActions={ListActions} key={index} />;
};

const BindingDataItem = props => {
  const { t } = useTranslation()
  const { item, name, index, onDeleteClick } = props;

  return(
    <>
      {/* <div className="co-form-section__separator" /> */}
      <div className="row" key={item.id}>
        <Section id={`${name}[${index}]`} description="">
          <div className="col-xs-12 pairs-list__value-field">
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_20')} id={`${name}[${index}].name`} description="" >
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].name`} name={`${name}[${index}].name`} defaultValue={item.name}/>
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_21')} id={`${name}[${index}].value`} description="" >
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].value`} name={`${name}[${index}].value`} defaultValue={item.value}/>
            </Section>
          </div>
          <div className="col-xs-1 pairs-list__action">
            <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
              <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
              <span>{t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_19')}</span>
            </Button>
          </div>
        </Section>
      </div>
    </>
  )
}

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

  const [bindables, setBindables] = React.useState([])
  const [selectedApplication, setSelectedApplication] = React.useState('')
  const [applicationList, setApplicationList] = React.useState([])

  React.useEffect(() => {
    const getBindables = async () => {
      const data = await coFetchJSON('api/hypercloud/bindableResources')
      const keys = Object.keys(data)
      setBindables(keys)
    }
    getBindables()
  }, [])

  React.useEffect(() => {
    const model = modelFor(selectedApplication)
    if (model) {
      k8sList(modelFor(selectedApplication), { ns: defaultValues.metadata.namespace }).then(list => {
        setApplicationList(list)})
    }
    else {
      setApplicationList([])
    }

  }, [selectedApplication])

  return (
    <>
      <Section label="Labels" id="label" description="">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_1')} id="name" description="">
        <RadioGroup name="method" items={methodItems.bind(null, t)()} inline={false} initValue={methodToggle} />
      </Section>

      {methodToggle === 'Manual' && (
        <>
          <div className="row">
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_4')} id="application" description="">
              <div className="col-xs-12 pairs-list__value-field">
                <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_14')} id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.group" name="spec.application.group"/>
                </Section>
                <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_15')} id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.version" name="spec.application.version"/>
                </Section>
                <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.kind" name="spec.application.kind"/>
                </Section>
                <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.name" name="spec.application.name"/>
                </Section>
              </div>
          </Section>
          </div>

          <Section id="services" isRequired={true}>
            <ListView methods={methods} name={`spec.services`} addButtonText={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_12')} headerFragment={<></>} itemRenderer={backupServiceItemRenderer} defaultItem={{ namespace: '', group: '', version: '', kind: '', name: '' }} defaultValues={defaultValues.spec.services}/>
          </Section>
        </>
      )}

      {methodToggle === 'Auto' && (
        <>
          <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_4')} id="application" description="">
            <div className="col-xs-12 pairs-list__value-field">
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id="application" description="" isRequired>
                <Dropdown menuClassName="dropdown-menu--text-wrap" className={classNames('co-type-selector')} items={bindables} title={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_6')} onChange={(e)=>{setSelectedApplication(bindables[e])}} type="single" />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id="application" description="" isRequired>
                <ResourceListDropdown name="spec.application.name" useHookForm resourceList={applicationList} type="single" placeholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_8')} defaultValue={defaultValues.metadata.namespace} autocompletePlaceholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_8')} />
                {/* <ResourceDropdown name="spec.application.name" type="single" resources={[{kind: selectedApplication, namespace: defaultValues.metadata.namespace, prop: selectedApplication }]}/> */}
              </Section>
            </div>
          </Section>
        </>
      )}

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_16')} id="mappings" isRequired={false} description={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_17')}>
        <ListView methods={methods} name={`spec.mappings`} addButtonText={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_18')} headerFragment={<></>} itemRenderer={bindingDataItemRenderer} defaultItem={{}} defaultValues={defaultValues.spec.mappings}/>
      </Section>

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_22')} id="bindAsFiles" description={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_25')}>
        <RadioGroup name="bindAsFiles" items={bindAsFilesItems.bind(null, t)()} inline={false} initValue={bindAsFilesToggle} />
      </Section>

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_26')} id="detectBindingResources" description="">
        <CheckboxSingle name="detectBindingResources" label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_27')} defaultValue={defaultValues.spec.detectBindingResources} methods={methods} />
      </Section>

      <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_28')} id="namingStrategy" description={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_29')}>
        <TextInput inputClassName="pf-c-form-control" id="spec.namingStrategy" name="spec.namingStrategy" placeholder=''/>
      </Section>

    </>

  )
}

export const CreateServiceBinding: React.FC<CreateServiceBindingProps> = (props) => {
  const { t } = useTranslation();
  const formComponent = servicebindingFormFactory(props.match.params, props.obj);
  const ServiceBindingFormComponent = formComponent;
  return <ServiceBindingFormComponent fixed={{ metadata: { namespace: props.match.params.ns } }} explanation={t('MSG_COMMON_CREATEFORM_DESCRIPTION_1')} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true}/>;
};

export const onSubmitCallback = data => {
  delete data.method

  console.log('**', data)

  let apiVersion = `${ServiceBindingModel.apiGroup}/${ServiceBindingModel.apiVersion}`
  let kind = ServiceBindingModel.kind
  let labels = SelectorInput.objectify(data.metadata.labels);
  let name = data.metadata.name;
  delete data.metadata.labels;

  let bindAsFiles: boolean

  bindAsFiles = (data.bindAsFiles==='false') ? false:true

  let detectBindingResources = data.detectBindingResources
  delete data.spec.detectBindingResources;

  data = _.defaultsDeep({ apiVersion: apiVersion, kind: kind, metadata: {name: name, labels: labels}, spec: {bindAsFiles: bindAsFiles, detectBindingResources: detectBindingResources}}, data);
  return data;
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

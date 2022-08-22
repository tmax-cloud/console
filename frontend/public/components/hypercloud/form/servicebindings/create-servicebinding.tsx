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
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { ServiceBindingModel } from '../../../../models';

const defaultValuesTemplate = {
  metadata: {
    name: 'example',
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
    ]
  }
};

const kindItems = t => [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: '리소스 선택',
    desc: '',
    value: 'Auto',
  },
  {
    title: '직접 입력',
    desc: '',
    value: 'Manual',
  },
];

const servicebindingFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;

  return WithCommonForm(CreateServiceBindingComponent, params, defaultValues);
};

const BackupServiceItem = props => {
  const { item, name, index, onDeleteClick, methods } = props;

  return(
    <>
      <div className="co-form-section__separator" />
      <div className="row" key={item.id}>
        <Section label="백업 서비스" id={`${name}[${index}]`} description="">
          <div className="col-xs-12 pairs-list__value-field">
            <Section label="네임스페이스" id={`${name}[${index}].namespace`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].namespace`} name={`${name}[${index}].namespace`} defaultValue={item.namespace}/>
            </Section>
            <Section label="그룹" id={`${name}[${index}].group`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].group`} name={`${name}[${index}].group`} defaultValue={item.group}/>
            </Section>
            <Section label="버젼" id={`${name}[${index}].version`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].version`} name={`${name}[${index}].version`} defaultValue={item.version}/>
            </Section>
            <Section label="리소스" id={`${name}[${index}].kind`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].kind`} name={`${name}[${index}].kind`} defaultValue={item.kind}/>
            </Section>
            <Section label="리소스 이름" id={`${name}[${index}].name`} description="" isRequired>
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].name`} name={`${name}[${index}].name`} defaultValue={item.name}/>
            </Section>
          </div>
          <div className="col-xs-1 pairs-list__action">
            <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
              <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
              <span>{"백업 서비스 삭제"}</span>
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

const CreateServiceBindingComponent: React.FC<ServiceBindingFormProps> = props => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const kindToggle = useWatch({
    name: 'method',
    defaultValue: 'Manual',
  });
  const methods = useFormContext();

  const {
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;

  return (
    <>
      <Section label="Labels" id="label" description="">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label="바인딩 리소스 추가 방식" id="name" description="">
        <RadioGroup name="method" items={kindItems.bind(null, t)()} inline={false} initValue={kindToggle} />
      </Section>

      {kindToggle === 'Manual' && (
        <>
          <div className="row">
            <Section label="애플리케이션" id="application" description="">
              <div className="col-xs-12 pairs-list__value-field">
                <Section label="그룹" id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.group" name="spec.application.group"/>
                </Section>
                <Section label="버젼" id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.version" name="spec.application.version"/>
                </Section>
                <Section label="리소스" id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.kind" name="spec.application.kind"/>
                </Section>
                <Section label="리소스 이름" id="application" description="" isRequired>
                  <TextInput inputClassName="pf-c-form-control" id="spec.application.name" name="spec.application.name"/>
                </Section>
              </div>
            </Section>
          </div>

          <Section id="services" isRequired={true}>
            <ListView methods={methods} name={`spec.services`} addButtonText={"백업 서비스 추가"} headerFragment={<></>} itemRenderer={backupServiceItemRenderer} defaultItem={{ namespace: '', group: '', version: '', kind: '', name: '' }} defaultValues={defaultValues.spec.services}/>
          </Section>

          <div className="co-form-section__separator" />

          <Section label="Mappings" id="mappings" description="">
            <></>
          </Section>
        </>
      )}
    </>

  )
}

export const CreateServiceBinding: React.FC<CreateServiceBindingProps> = (props) => {
  const { t } = useTranslation();
  const formComponent = servicebindingFormFactory(props.match.params, props.obj);
  const ServiceBindingFormComponent = formComponent;
  return <ServiceBindingFormComponent fixed={{ metadata: { namespace: props.match.params.ns } }} explanation={t('SINGLE:MSG_ROLES_CREATEFORM_DIV1_1')} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true}/>;
};

export const onSubmitCallback = data => {
  delete data.method

  let apiVersion = `${ServiceBindingModel.apiGroup}/${ServiceBindingModel.apiVersion}`
  let kind = ServiceBindingModel.kind
  let labels = SelectorInput.objectify(data.metadata.labels);
  let name = data.metadata.name;
  delete data.metadata.labels;

  data = _.defaultsDeep({ apiVersion: apiVersion, kind: kind, metadata: {name: name, labels: labels}}, data);
  console.log('**', data)
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

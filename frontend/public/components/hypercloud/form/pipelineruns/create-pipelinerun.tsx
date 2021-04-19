import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { PipelineModel, PipelineResourceModel, PipelineRunModel } from '../../../../models';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { TextInput } from '../../utils/text-input';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { ListView } from '../../utils/list-view';
import { getActiveNamespace } from '../../../../reducers/ui';
import store from '../../../../redux';
//import { useTranslation } from 'react-i18next';
import { k8sGet, k8sList } from '../../../../module/k8s';
import { Button } from '@patternfly/react-core';

const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};

const pipelineRunFormFactory = params => {
  return WithCommonForm(CreatePipelineRunComponent, params, defaultValues);
};

const paramItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => {
  return (
    <div className='row' key={item.id}>
      <div className='col-xs-4 pairs-list__value-field'>
        <TextInput className='pf-c-form-control' defaultValue={item.value} id={`${name}[${index}].value`} />
      </div>
      <div className='col-xs-1 pairs-list__action'>
        <Button
          type='button'
          data-test-id='pairs-list__delete-btn'
          className='pairs-list__span-btns'
          onClick={() => {
            ListActions.remove(index);
          }}
          variant='plain'
        >
          {ListDefaultIcons.deleteIcon}
        </Button>
      </div>
    </div>
  );
};

const CreatePipelineRunComponent: React.FC<PipelineRunFormProps> = props => {
  const { control } = useFormContext();

  const namespace = getActiveNamespace(store.getState());

  const [paramList, setParamList] = React.useState([]);
  const [resourceList, setResourceList] = React.useState([]);
  const [resourceRefList, setResourceRefList] = React.useState([]);

  React.useEffect(() => {
    k8sList(PipelineResourceModel, { ns: namespace })
      .then((list) => setResourceRefList(list));
  }, []);

  const onSelectPipeline = (selection: string) => {
    k8sGet(PipelineModel, selection, namespace)
      .then(pipeline => {
        let newParamList = pipeline.spec.params?.map(param => ({ name: param.name, type: param.type, default: param.default, value: '' })) ?? [];
        let newResourceList = pipeline.spec.resources?.map(resource => ({ name: resource.name, type: resource.type })) ?? [];

        setParamList(newParamList);
        setResourceList(newResourceList);
      })
      .catch((err) => {
        console.error('Fail to get Pipeline Detail', err);
      });
  }

  //const { t } = useTranslation();

  return (
    <>
      <Section label='Labels' id='label' description='Enter를 입력하여 레이블을 추가할 수 있습니다.'>
        <Controller name='metadata.labels' id='label' labelClassName='co-text-sample' as={SelectorInput} control={control} tags={[]} />
      </Section>

      <div className='co-form-section__separator' />

      <Section label='파이프라인' id='pipeline' isRequired>
        <ResourceDropdown
          name='spec.pipelineRef.name'
          resources={[
            {
              kind: 'Pipeline',
              namespace: namespace,
              prop: 'pipeline'
            },
          ]}
          type='single'
          useHookForm
          onChange={onSelectPipeline}
        />
      </Section>

      {!_.isEmpty(paramList) &&
        <Section label='파이프라인 파라미터' id='param'>
          {paramList.map((cur, idx) => (
            <ul>
              <Section label={cur.name} id={cur.name} description={cur.description}>
                {cur.type === 'array' ?
                  <ListView name={`spec.params.${cur.name}.arrayValue`} addButtonText='추가' headerFragment={<></>} itemRenderer={paramItemRenderer} defaultItem={{ value: '' }} defaultValues={cur.default.map(defaultValue => ({ value: defaultValue }))} />
                  : <TextInput id={`spec.params.${cur.name}.value`} defaultValue={cur.default} />
                }
              </Section>
            </ul>
          )
          )}
        </Section>}
      {!_.isEmpty(resourceList) &&
        <Section label='파이프라인 리소스' id='resource'>
          {resourceList.map((cur, idx) => (
            <ul>
              <Section label={cur.name} id={cur.name}>
                <ResourceListDropdown
                  name={`spec.resources.${cur.name}.resourceRef.name`}
                  resourceList={resourceRefList.filter(ref => cur.type === ref.spec.type)}
                  type='single'
                  useHookForm
                  placeholder='파이프라인 리소스 선택'
                  onChange={onSelectPipeline}
                />
              </Section>
            </ul>
          ))}
        </Section>}

      <div className='co-form-section__separator' />

      <Section label='서비스 어카운트 지정' id='serviceaccount' isRequired>
        <ResourceDropdown
          name='spec.serviceAccountName'
          resources={[
            {
              kind: 'ServiceAccount',
              namespace: namespace,
              prop: 'serviceaccount'
            },
          ]}
          type='single'
          useHookForm
          required
        />
      </Section>
    </>
  );
};

export const CreatePipelineRun: React.FC<CreatePipelineRunProps> = ({ match: { params }, kind }) => {
  const formComponent = pipelineRunFormFactory(params);
  const PipelineRunFormComponent = formComponent;
  return <PipelineRunFormComponent fixed={{ apiVersion: `${PipelineRunModel.apiGroup}/${PipelineRunModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb='Create' onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);

  let params = [];
  _.forEach(data.spec.params, (obj, name) => {
    params.push({ name: name, value: obj.value ?? obj.arrayValue.map(subObj => subObj.value) });
  });

  let resources = [];
  _.forEach(data.spec.resources, (obj, name) => {
    resources.push({ name: name, resourceRef: obj.resourceRef });
  });

  delete data.metadata.labels;
  delete data.spec.params;
  delete data.spec.resources;

  data = _.defaultsDeep(data, { metadata: { labels: labels }, spec: { params: params, resources: resources } });
  return data;
};

type CreatePipelineRunProps = {
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

type PipelineRunFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

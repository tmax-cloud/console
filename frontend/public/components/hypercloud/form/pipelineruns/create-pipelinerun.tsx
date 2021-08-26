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
import { useTranslation } from 'react-i18next';
import { k8sGet, k8sList } from '../../../../module/k8s';
import { Button } from '@patternfly/react-core';
import { Workspace } from '../utils/workspaces';

const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};

const pipelineRunFormFactory = params => {
  return WithCommonForm(CreatePipelineRunComponent, params, defaultValues);
};

const paramItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  return (
    <div className="row" key={item.id}>
      <div className="col-xs-4 pairs-list__value-field">
        <TextInput className="pf-c-form-control" defaultValue={item.value} id={`${name}[${index}].value`} />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Button
          type="button"
          data-test-id="pairs-list__delete-btn"
          className="pairs-list__span-btns"
          onClick={() => {
            ListActions.remove(index);
          }}
          variant="plain"
        >
          {ListDefaultIcons.deleteIcon}
        </Button>
      </div>
    </div>
  );
};

const ParamsListComponent = props => {
  const { t } = useTranslation();
  return props.paramList.map(cur => (
    <ul>
      <Section label={cur.name} id={cur.name} description={cur.description}>
        {cur.type === 'array' ? <ListView name={`spec.params.${cur.name}.arrayValue`} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={paramItemRenderer} defaultItem={{ value: '' }} defaultValues={cur.default.map(defaultValue => ({ value: defaultValue }))} /> : <TextInput id={`spec.params.${cur.name}.value`} defaultValue={cur.default} />}
      </Section>
    </ul>
  ));
};

const ResourceListComponent = props => {
  const { t } = useTranslation();
  return props.resourceList.map(cur => (
    <ul>
      <Section label={cur.name} id={cur.name}>
        <ResourceListDropdown name={`spec.resources.${cur.name}.resourceRef.name`} resourceList={props.resourceRefList.filter(ref => cur.type === ref.spec.type)} type="single" useHookForm placeholder={t('SINGLE:MSG_PIPELINES_CREATEFORM_29')} autocompletePlaceholder={t('COMMON:MSG_COMMON_FILTER_2')} />
      </Section>
    </ul>
  ));
};

const WorkspaceListComponent = props => {
  return props.workspaceList.map((cur, idx) => <Workspace namespace={props.namespace} methods={props.methods} id={`spec.workspaces[${idx}]`} {...cur} />);
};

const CreatePipelineRunComponent: React.FC<PipelineRunFormProps> = props => {
  const methods = useFormContext();
  const { control } = methods;

  const namespace = getActiveNamespace(store.getState());

  const [paramList, setParamList] = React.useState([]);
  const [resourceList, setResourceList] = React.useState([]);
  const [resourceRefList, setResourceRefList] = React.useState([]);
  const [workspaceList, setWorkspaceList] = React.useState([]);

  React.useEffect(() => {
    k8sList(PipelineResourceModel, { ns: namespace }).then(list => setResourceRefList(list));
  }, []);

  const onSelectPipeline = (selection: string) => {
    k8sGet(PipelineModel, selection, namespace)
      .then(pipeline => {
        let newParamList = pipeline.spec.params?.map(param => ({ name: param.name, type: param.type, default: param.default, value: '' })) ?? [];
        let newResourceList = pipeline.spec.resources?.map(resource => ({ name: resource.name, type: resource.type })) ?? [];

        setParamList(newParamList);
        setResourceList(newResourceList);
        setWorkspaceList(pipeline.spec.workspaces);
      })
      .catch(err => {
        console.error('Fail to get Pipeline Detail', err);
      });
  };

  const { t } = useTranslation();

  return (
    <>
      <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_1')} id="label" description={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_2')}>
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_3')} id="pipeline" isRequired>
        <ResourceDropdown
          name="spec.pipelineRef.name"
          placeholder={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_22')}
          resources={[
            {
              kind: 'Pipeline',
              namespace: namespace,
              prop: 'pipeline',
            },
          ]}
          type="single"
          useHookForm
          onChange={onSelectPipeline}
        />
      </Section>

      {!_.isEmpty(paramList) && (
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_4')} id="param">
          <ParamsListComponent paramList={paramList} />
        </Section>
      )}
      {!_.isEmpty(resourceList) && (
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_6')} id="resource">
          <ResourceListComponent resourceList={resourceList} resourceRefList={resourceRefList} />
        </Section>
      )}
      {!_.isEmpty(workspaceList) && (
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_9')} id="workspace">
          <WorkspaceListComponent workspaceList={workspaceList} namespace={namespace} methods={methods} />
        </Section>
      )}

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_17')} id="serviceaccount" >
        <ResourceDropdown
          name="spec.serviceAccountName"
          placeholder={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_18')}
          resources={[
            {
              kind: 'ServiceAccount',
              namespace: namespace,
              prop: 'serviceaccount',
            },
          ]}
          type="single"
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
  return <PipelineRunFormComponent fixed={{ apiVersion: `${PipelineRunModel.apiGroup}/${PipelineRunModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
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

  _.forEach(data.spec.workspaces, workspace => {
    _.forEach(workspace.name, (type, name) => {
      workspace.name = name;
      if (type === 'EmptyDirectory') {
        workspace.emptyDir = {};
      } else if (type === 'VolumeClaimTemplate') {
        workspace.volumeClaimTemplate.spec.accessModes = [workspace.volumeClaimTemplate.spec.accessModes];
      }
    });
  });

  delete data.metadata.labels;
  delete data.spec.params;
  delete data.spec.resources;

  data = _.defaultsDeep({ metadata: { labels: labels }, spec: { params: params, resources: resources } }, data);
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

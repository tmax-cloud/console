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
import { k8sGet, k8sList, K8sResourceKindReference } from '../../../../module/k8s';
import { Button } from '@patternfly/react-core';
import { Workspace } from '../utils/workspaces';
import { EditDefault } from '../../crd/edit-resource';
import { CreateDefault } from '../../crd/create-pinned-resource';
import { EditorType } from '../../../../../packages/console-shared/src/components/synced-editor/editor-toggle';
import { convertToForm, onSubmitCallback } from './sync-form-data';
import { defaultTemplateMap } from '..';

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
  const { formData } = props;
  return props.resourceList.map(cur => (
    <ul>
      <Section label={cur.name} id={cur.name}>
        <ResourceListDropdown name={`spec.resources.${cur.name}.resourceRef.name`} resourceList={props.resourceRefList.filter(ref => cur.type === ref.spec.type)} type="single" useHookForm placeholder={t('SINGLE:MSG_PIPELINES_CREATEFORM_29')} autocompletePlaceholder={t('COMMON:MSG_COMMON_FILTER_2')} defaultValue={formData?.spec?.resources?.[cur.name]?.resourceRef.name} />
      </Section>
    </ul>
  ));
};

const WorkspaceListComponent = props => {
  return props.workspaceList.map((cur, idx) => <Workspace namespace={props.namespace} methods={props.methods} id={`spec.workspaces[${idx}]`} {...cur} />);
};

const CreatePipelineRunComponent: React.FC<PipelineRunFormProps> = props => {
  const { formData } = props;
  const methods = useFormContext();
  const { control } = methods;

  const namespace = getActiveNamespace(store.getState());

  const [labels] = React.useState(formData?.metadata?.labels || []);
  const [paramList, setParamList] = React.useState([]);
  const [resourceList, setResourceList] = React.useState(Object.keys(formData?.spec?.resources)?.map(name => ({ name: name })) || []);
  const [resourceRefList, setResourceRefList] = React.useState([]);
  const [workspaceList, setWorkspaceList] = React.useState(formData?.spec?.workspaces || []);

  React.useEffect(() => {
    k8sList(PipelineResourceModel, { ns: namespace }).then(list => setResourceRefList(list));
    if (!!formData) {
      onSelectPipeline(formData?.spec?.pipelineRef?.name);
    }
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
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={labels} />
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
          defaultValue={formData?.spec?.pipelineRef?.name}
        />
      </Section>

      {!_.isEmpty(paramList) && (
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_4')} id="param">
          <ParamsListComponent paramList={paramList} />
        </Section>
      )}
      {!_.isEmpty(resourceList) && (
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_6')} id="resource">
          <ResourceListComponent resourceList={resourceList} resourceRefList={resourceRefList} formData={formData} />
        </Section>
      )}
      {!_.isEmpty(workspaceList) && (
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_9')} id="workspace">
          <WorkspaceListComponent workspaceList={workspaceList} namespace={namespace} methods={methods} />
        </Section>
      )}

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_17')} id="serviceaccount">
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
          defaultValue={formData?.spec?.serviceAccountName}
        />
      </Section>
    </>
  );
};

const getCustomFormEditor = ({ match, kind, Form, isCreate }) => props => {
  const { formData, onChange } = props;
  const _formData = React.useMemo(() => convertToForm(formData), [formData]);
  const setFormData = React.useCallback(formData => onSubmitCallback(formData), [onSubmitCallback]);
  const watchFieldNames = ['metadata.labels', 'spec.params', 'spec.resources'];
  return <Form fixed={{ apiVersion: `${PipelineRunModel.apiGroup}/${PipelineRunModel.apiVersion}`, kind, metadata: { namespace: match.params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={isCreate} formData={_formData} setFormData={setFormData} onChange={onChange} watchFieldNames={watchFieldNames} />;
};

export const CreatePipelineRun: React.FC<CreatePipelineRunProps> = props => {
  const { match, kind, obj } = props;
  const formComponent = WithCommonForm(CreatePipelineRunComponent, match.params, obj || defaultTemplateMap.get(kind), null, true);

  if (obj) {
    // edit form
    return <EditDefault initialEditorType={EditorType.Form} create={false} model={PipelineRunModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form: formComponent, isCreate: false })} obj={obj} />;
  }
  // create form
  return <CreateDefault initialEditorType={EditorType.Form} create={true} model={PipelineRunModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form: formComponent, isCreate: true })} />;
};

type CreatePipelineRunProps = {
  match: RMatch<{
    name: string;
    appName: string;
    ns: string;
    plural: K8sResourceKindReference;
  }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
  obj: any;
};

type PipelineRunFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
  formData: any;
};

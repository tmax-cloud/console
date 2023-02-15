import * as _ from 'lodash-es';
import classNames from 'classnames';
import * as React from 'react';
import i18next from 'i18next';
import { useState, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { match as RMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { defaultTemplateMap } from '@console/internal/components/hypercloud/form';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { ListView } from '../../utils/list-view';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { CreateDefault } from '../../crd/create-pinned-resource';
import { k8sGet, k8sList, K8sResourceKindReference } from '../../../../module/k8s';
import { ClusterTaskModel, TaskModel, PipelineResourceModel, ServiceAccountModel, TaskRunModel } from '../../../../models';
import { Button } from '@patternfly/react-core';
import store from '../../../../redux';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { getActiveNamespace } from '@console/internal/reducers/ui';
import { Workspace } from '../utils/workspaces';
import { convertToForm, onSubmitCallback } from './sync-form-data';
import { FieldLevelHelp } from 'public/components/utils';

let defaultArrayLength = 0;

const paramItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  methods.watch([`${name}[${index}].value`]);
  return (
    <div className="row" key={item.id}>
      <div className="col-xs-4 pairs-list__value-field">
        <input id={`${name}[${index}].value`} ref={methods.register()} className="pf-c-form-control" defaultValue={item.value} name={`${name}[${index}].value`} />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Button
          type="button"
          data-test-id="pairs-list__delete-btn"
          className="pairs-list__span-btns"
          onClick={() => {
            const values = _.get(ListActions.getValues(), name);
            if (!!values && values.length > defaultArrayLength) {
              ListActions.remove(index);
            }
          }}
          variant="plain"
        >
          {ListDefaultIcons.deleteIcon}
        </Button>
      </div>
    </div>
  );
};

const CreateTaskRunComponent: React.FC<TaskRunFormProps> = props => {
  const { formData } = props;
  const { t } = useTranslation();
  const methods = useFormContext();
  const [lists, setLists] = useState({
    inputList: [],
    outputList: [],
    paramList: [],
    workspaceList: [],
    paramValueListData: [],
  });

const Node_taskparam = ({ className, children, description, valid, validationErrorDesc }) => {
    const { t } = useTranslation();
    return (
      <div className={className}>
        <p className={classNames('help-block', { 'help-block-short-margin-top': !valid })}>{description}</p>
        <div>{children}</div>
        <div className="row" />
        {!valid && <p className="error-string">{i18next.exists(validationErrorDesc) ? t(validationErrorDesc) : validationErrorDesc}</p>}
      </div>
    );
  };
  
  const CombineNodes_taskParam = (id, description, children, valid, validationErrorDesc) => {
    // children node 개수에 따라 가로 분할 class 적용
    let isArray = Array.isArray(children);
    let className = isArray ? `col-md-${Math.floor(12 / children.length)}` : 'col-md-12';
    return isArray ? children.map((cur, idx) => <Node_taskparam className={className} key={`${id}-${idx}`} children={cur} description={description} valid={valid} validationErrorDesc={validationErrorDesc} />) : <Node_taskparam className={className} children={children} description={description} valid={valid} validationErrorDesc={validationErrorDesc} />;
  };
  
  const TaskParam: React.FC<TaskParamProps> = ({ id, label, description, children, isRequired = false, valid = true, validationErrorDesc = '', help = false, helpText, helpTitle }) => {
    let result = CombineNodes_taskParam(id, description, children, valid, validationErrorDesc);
    return (
      <div className="form-group">
        {label && (
          <label className={'control-label ' + (isRequired ? 'co-required' : '')} htmlFor={id}>
            {label}
          </label>
        )}
        {help && (
          <div style={{ display: 'inline-block', marginLeft: 5 }}>
            <FieldLevelHelp>
              <h2>{helpTitle}</h2>
              <p>{helpText}</p>
            </FieldLevelHelp>
          </div>
        )}
        <div className="row" key={id}>
          {result}
        </div>
      </div>
    );
  };
  
  type TaskParamProps = {
    id: string;
    children: Array<React.ReactNode> | React.ReactNode;
    label?: string;
    description?: string;
    isRequired?: boolean;
    valid?: boolean;
    validationErrorDesc?: string;
    help?: boolean;
    helpTitle?: string;
    helpText?: string;
  };

  const [pipelineList, setPipelineList] = useState([]);
  const [serviceAccountList, setServiceAccountList] = useState([]);

  const namespace = getActiveNamespace(store.getState());
  React.useEffect(() => {
    k8sList(PipelineResourceModel, { ns: namespace }).then(list => {
      setPipelineList(list);
    });

    k8sList(ServiceAccountModel, { ns: namespace }).then(list => {
      setServiceAccountList(list);
    });
  }, []);

  const selectedTask = useWatch({
    control: methods.control,
    name: 'taskRef.name',
    defaultValue: formData?.taskRef?.name || '',
  });

  const selectedTaskRef = useRef();

  const getTaskDetails = async (taskKind, taskName) => {
    let task;
    if (taskKind === 'Task') {
      task = await k8sGet(TaskModel, taskName, namespace);
    } else if (taskKind === 'ClusterTask') {
      task = await k8sGet(ClusterTaskModel, taskName, null);
    }
    if (!!task) {
      const inputsData = task.spec?.resources?.inputs?.map(input => {
        return {
          name: input.name,
          required: !input.optional,
          type: input.type,
          description: input.description,
        };
      });

      const outputsData = task.spec?.resources?.outputs?.map(output => {
        return {
          name: output.name,
          required: !output.optional,
          type: output.type,
          description: output.description,
        };
      });

      const useDefaultValue = _.isEmpty(formData?.params) ? true : !!(selectedTaskRef.current && selectedTask !== selectedTaskRef.current);
      selectedTaskRef.current = selectedTask;

      const paramValueListData = task.spec?.params?.map((param, index) => {
        if (param.type === 'array') {
          defaultArrayLength = param.default?.length;
          const valueList = param.default?.map(value => {
            return {
              value: value,
            };
          });
          return { value: useDefaultValue ? valueList : formData?.params[index]?.value };
        } else {
          return { value: useDefaultValue ? param.default : formData?.params[index]?.value };
        }
      });

      const paramsData = task.spec?.params?.map(param => {
        return {
          name: param.name,
          value: param.default,
          description: param.description,
          type: param.type,
          required: false,
        };
      });

      const workspacesData = task.spec?.workspaces?.map((workspace, index) => {
        return {
          name: workspace.name,
          description: workspace.description,
          type: useDefaultValue ? undefined : formData?.spec?.workspaces[index]?.[workspace.name],
        };
      });

      setLists({
        inputList: inputsData || [],
        outputList: outputsData || [],
        paramValueListData: paramValueListData || [],
        paramList: paramsData || [],
        workspaceList: workspacesData || [],
      });
    }
  };

  const inputs =
    lists.inputList.length > 0 ? (
      lists.inputList.map((item, index) => {
        return (
          <Section label={`${item.name} (${item.type})`} id={`input_${index}`} key={`input_${index}`} isRequired={item.required} description={item.description}>
            <>
              <ResourceListDropdown name={`spec.resources.inputs.${item.name}.resourceRef.name`} type="single" resourceList={pipelineList} methods={methods} defaultValue={formData?.spec?.resources?.inputs?.[item.name]?.resourceRef?.name} placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_8')} useHookForm />
            </>
          </Section>
        );
      })
    ) : (
      <div className="help-block">{t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_4')}</div>
    );

  const outputs =
    lists.outputList.length > 0 ? (
      lists.outputList.map((item, index) => {
        return (
          <Section label={`${item.name} (${item.type})`} id={`output_${index}`} key={`output_${index}`} isRequired={item.required} description={item.description}>
            <>
              <ResourceListDropdown name={`spec.resources.outputs.${item.name}.resourceRef.name`} type="single" resourceList={pipelineList} methods={methods} defaultValue={formData?.spec?.resources?.outputs?.[item.name]?.resourceRef?.name} placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_8')} useHookForm />
            </>
          </Section>
        );
      })
    ) : (
      <div className="help-block">{t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_7')}</div>
    );

  // MEMO : ListView는 name에 민감해서 ListView와 item renderer의 item들의 이름은 고정시키고 name부분은 hidden input으로 넣어둠.
  const params =
    lists.paramList.length > 0 ? (
      lists.paramList.map((item, index) => {
        if (item.type === 'array') {
          return (
            <TaskParam label={item.name} id={`${selectedTask}_param_${index}`} key={`${selectedTask}_param_${index}`} description={item.description} isRequired={false}>
              <>
                <input ref={methods.register} type="hidden" id={`params.${index}.name`} name={`params.${index}.name`} value={item.name} />
                <ListView name={`params.${index}.value`} methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={paramItemRenderer} defaultItem={{ value: '' }} defaultValues={lists.paramValueListData[index]?.value} />
              </>
            </TaskParam>
          );
        } else {
          return (
            <TaskParam label={item.name} id={`${selectedTask}_param_${index}`} key={`${selectedTask}_param_${index}`} description={item.description} isRequired={false}>
              <>
                <input ref={methods.register} type="hidden" id={`params[${index}].name`} name={`params[${index}].name`} value={item.name} />
                <input ref={methods.register} className="pf-c-form-control" id={`params[${index}].value`} name={`params[${index}].value`} defaultValue={item.value} required={false} />
              </>
            </TaskParam>
          );
        }
      })
    ) : (
      <div className="help-block">{t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_10')}</div>
    );

  const workspaces = lists.workspaceList.length > 0 ? lists.workspaceList.map((item, index) => <Workspace namespace={namespace} methods={methods} id={`spec.workspaces[${index}]`} {...item} />) : <div className="help-block">{t('SINGLE:MSG_TASKS_CREATFORM_DIV2_84')}</div>;

  React.useEffect(() => {
    setLists({
      inputList: [],
      outputList: [],
      paramValueListData: [],
      paramList: [],
      workspaceList: [],
    });
    const taskKind = selectedTask.split('~~')[0];
    const taskName = selectedTask.split('~~')[1];
    getTaskDetails(taskKind, taskName);
  }, [selectedTask]);

  return (
    <>
      <hr />
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_5')} id="task" isRequired={true}>
        <ResourceDropdown
          name="taskRef.name"
          type="single"
          resources={[
            {
              kind: TaskModel.kind,
              namespace: namespace,
              prop: 'task',
            },
            {
              kind: ClusterTaskModel.kind,
              prop: 'clustertask',
            },
          ]}
          methods={methods}
          defaultValue={formData?.taskRef?.name || ''}
          placeholder={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_5')}
          idFunc={resource => `${resource.kind}~~${resource.metadata.name}`}
          useHookForm
        />
      </Section>
      {selectedTask != '' ? (
        <>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_7')} id="inputresource">
            <div>{inputs}</div>
          </Section>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_9')} id="outputresource">
            <div>{outputs}</div>
          </Section>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_6')} id="taskparameter">
            <div>{params}</div>
          </Section>
          <Section label={t('SINGLE:MSG_TASKRUNS_CREATFORM_DIV2_1')} id="workspace">
            <div>{workspaces}</div>
          </Section>
        </>
      ) : null}
      <Section label={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_11')} id="timeout" description={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_13')}>
        <div>
          <input ref={methods.register} className="pf-c-form-control" id="time_input" name="spec.timeout" type="number" placeholder={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_14')} /> {t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_15')}
        </div>
      </Section>
      <Section label={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_17')} id="serviceaccount" description={t('SINGLE:MSG_TASKRUNS_CREATEFORM_DIV2_16')}>
        <ResourceListDropdown name="spec.serviceAccountName" type="single" kind={ServiceAccountModel.kind} resourceList={serviceAccountList} methods={methods} defaultValue={formData?.spec?.serviceAccountName || ''} placeholder={t('SINGLE:MSG_TASKRUN_CREATFORM_DIV2_18')} autocompletePlaceholder={t('COMMON:MSG_COMMON_FILTER_2')} useHookForm />
      </Section>
    </>
  );
};

const getCustomFormEditor = ({ match, kind, Form, isCreate }) => props => {
  const { formData, onChange } = props;
  const _formData = React.useMemo(() => convertToForm(formData), [formData]);
  const setFormData = React.useCallback(formData => onSubmitCallback(formData), [onSubmitCallback]);
  const watchFieldNames = ['metadata.labels', 'taskRef', 'params', 'spec.resources.inputs', 'spec.resources.outputs', 'spec.workspaces', 'spec.volumes', 'spec.steps', 'spec.timeout', 'spec.serviceAccountName'];
  return <Form {...props} fixed={{ apiVersion: `${TaskModel.apiGroup}/${TaskModel.apiVersion}`, kind, metadata: { namespace: match.params.ns } }} onSubmitCallback={onSubmitCallback} isCreate={isCreate} useDefaultForm formData={_formData} setFormData={setFormData} onChange={onChange} watchFieldNames={watchFieldNames} />;
};

export const CreateTaskRun: React.FC<CreateTaskRunProps> = props => {
  const { match, kind } = props;
  const Form = WithCommonForm(CreateTaskRunComponent, match.params, defaultTemplateMap.get(kind), null, true);
  return <CreateDefault initialEditorType={EditorType.Form} create={true} model={TaskRunModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form, isCreate: true })} />;
};

type CreateTaskRunProps = {
  match: RMatch<{ name: string; appName: string; ns: string; plural: K8sResourceKindReference }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
};

type TaskRunFormProps = {
  formData: any;
};

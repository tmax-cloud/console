import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { K8sResourceKindReference } from '@console/internal/module/k8s';
import { defaultTemplateMap } from '@console/internal/components/hypercloud/form';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { ModalLauncher, ModalList, useInitModal, handleModalData, removeModalData } from '../utils';
import { InputResourceModal } from './input-resource-modal';
import { OutputResourceModal } from './output-resource-modal';
import { TaskParameterModal } from './task-parameter-modal';
import { WorkSpaceModal } from './work-space-modal';
import { VolumeModal } from './volume-modal';
import { StepModal } from './step-modal';
import { ClusterTaskModel } from '../../../../models';
import { volumeValidCallback, stepValidCallback } from '../utils/validCallback';
import { useTranslation } from 'react-i18next';
import { EditDefault } from '../../crd/edit-resource';
import { CreateDefault } from '../../crd/create-pinned-resource';
import { convertToForm, onSubmitCallback } from './sync-form-data';

const CreateClusterTaskComponent: React.FC<TaskFormProps> = props => {
  const { formData } = props;
  const { t } = useTranslation();
  const methods = useFormContext();
  const {
    control,
    /* not used 
    control: {
      defaultValuesRef: { current: defaultValues },
    }, */
  } = methods;

  const [labels] = React.useState(formData?.metadata?.labels || []);
  const [inputResource, setInputResource] = React.useState(formData?.spec?.resources?.inputs || []);
  const [outputResource, setOutputResource] = React.useState(formData?.spec?.resources?.outputs || []);
  const [taskParameter, setTaskParameter] = React.useState(formData?.spec?.params || []);
  const [workSpace, setWorkSpace] = React.useState(formData?.spec?.workspaces || []);
  const [volume, setVolume] = React.useState(formData?.spec?.volumes || []);
  const [step, setStep] = React.useState(formData?.spec?.steps || []);

  // 각 필드 별 default value 세팅 (not used - convertToForm()으로 대체)
  // useSetTaskHook({ defaultValues, setLabels, setInputResource, setOutputResource, setTaskParameter, setWorkSpace, setVolume, setStep });

  // Modal Form 초기 세팅위한 Hook들 Custom Hook으로 정리
  useInitModal(methods, inputResource, 'spec.resources.inputs');
  useInitModal(methods, outputResource, 'spec.resources.outputs');
  useInitModal(methods, taskParameter, 'spec.params');
  useInitModal(methods, workSpace, 'spec.workspaces');
  useInitModal(methods, volume, 'spec.volumes');
  useInitModal(methods, step, 'spec.steps');

  // 각 모달에서 다루는 data들
  let inputResourceArr = ['name', 'targetPath', 'type', 'optional'];
  let outputResourceArr = ['name', 'targetPath', 'type', 'optional'];
  let taskParameterArr = ['name', 'description', 'type', 'defaultStr', 'defaultArr'];
  let workspaceArr = ['name', 'description', 'mountPath', 'accessMode', 'optional'];
  let volumeArr = ['name', 'type', 'configMap', 'secret'];
  let stepArr = ['name', 'imageToggle', 'commandTypeToggle', 'registryTypeToggle', 'registryRegistry', 'registryImage', 'registryTag', 'image', 'command', 'args', 'script', 'env', 'selectedVolume', 'mountPath', 'isFirstTimeEdit', 'mountArr'];

  return (
    <>
      <Section label={t('SINGLE:MSG_IMAGEREGISTRIES_CREATEFORM_DIV2_33')} id="label" description={t('SINGLE:MSG_CLUSTERTASK_CREATFORM_DIV2_21')}>
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={<SelectorInput tags={labels} />} control={control} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_11')} id="inputResource">
        <>
          <ModalList
            list={inputResource}
            id="input-resource"
            path="spec.resources.inputs"
            title={t('SINGLE:MSG_CLUSTERTASK_CREATFORM_DIV2_1')}
            methods={methods}
            requiredFields={['name', 'type']}
            children={<InputResourceModal methods={methods} inputResource={inputResource} />}
            onRemove={removeModalData.bind(null, inputResource, setInputResource)}
            handleMethod={handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_78')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span
            className="open-modal_text"
            onClick={() => ModalLauncher({ inProgress: false, path: 'spec.resources.inputs', methods: methods, requiredFields: ['name', 'type'], title: t('SINGLE:MSG_CLUSTERTASK_CREATFORM_DIV2_1'), id: 'input-resource', handleMethod: handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, true, methods), children: <InputResourceModal methods={methods} inputResource={inputResource} />, submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8') })}
          >
            {`+ ${t('SINGLE:MSG_TASKS_CREATFORM_DIV2_79')}`}
          </span>
        </>
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_17')} id="outputResource">
        <>
          <ModalList
            list={outputResource}
            id="output-resource"
            path="spec.resources.outputs"
            title={t('SINGLE:MSG_CLUSTERTASK_CREATFORM_DIV2_4')}
            methods={methods}
            requiredFields={['name', 'type']}
            children={<OutputResourceModal methods={methods} outputResource={outputResource} />}
            onRemove={removeModalData.bind(null, outputResource, setOutputResource)}
            handleMethod={handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_80')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span
            className="open-modal_text"
            onClick={() => ModalLauncher({ inProgress: false, path: 'spec.resources.outputs', methods: methods, requiredFields: ['name', 'type'], title: t('SINGLE:MSG_CLUSTERTASK_CREATFORM_DIV2_4'), id: 'output-resource', handleMethod: handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, true, methods), children: <OutputResourceModal methods={methods} outputResource={outputResource} />, submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8') })}
          >
            {`+ ${t('SINGLE:MSG_TASKS_CREATFORM_DIV2_81')}`}
          </span>
        </>
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_18')} id="taskParameter">
        <>
          <ModalList
            list={taskParameter}
            id="task-parameter"
            path="spec.params"
            title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_18')}
            methods={methods}
            requiredFields={['name', 'type']}
            children={<TaskParameterModal methods={methods} taskParameter={taskParameter} />}
            onRemove={removeModalData.bind(null, taskParameter, setTaskParameter)}
            handleMethod={handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_82')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span
            className="open-modal_text"
            onClick={() =>
              ModalLauncher({
                inProgress: false,
                path: 'spec.params',
                methods: methods,
                requiredFields: ['name', 'type'],
                // optionalRequiredField: ['defaultArr', 'defaultStr'],
                // optionalValidCallback: paramValidCallback,
                title: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_18'),
                id: 'task-parameter',
                handleMethod: handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, true, methods),
                children: <TaskParameterModal methods={methods} taskParameter={taskParameter} />,
                submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8'),
              })
            }
          >
            {`+ ${t('SINGLE:MSG_TASKS_CREATFORM_DIV2_83')}`}
          </span>
        </>
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_57')} id="work-space">
        <>
          <ModalList
            list={workSpace}
            id="work-space"
            path="spec.workspaces"
            title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_57')}
            methods={methods}
            requiredFields={['name']}
            children={<WorkSpaceModal methods={methods} workSpace={workSpace} />}
            onRemove={removeModalData.bind(null, workSpace, setWorkSpace)}
            handleMethod={handleModalData.bind(null, 'work-space', workspaceArr, workSpace, setWorkSpace, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_84')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.workspaces', methods: methods, requiredFields: ['name'], title: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_57'), id: 'work-space', handleMethod: handleModalData.bind(null, 'work-space', workspaceArr, workSpace, setWorkSpace, true, methods), children: <WorkSpaceModal methods={methods} workSpace={workSpace} />, submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8') })}>
            {`+ ${t('SINGLE:MSG_TASKS_CREATFORM_DIV2_85')}`}
          </span>
        </>
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_68')} id="volume">
        <>
          <ModalList
            list={volume}
            id="volume"
            path="spec.volumes"
            title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_68')}
            methods={methods}
            requiredFields={['name', 'type']}
            children={<VolumeModal methods={methods} volume={volume} />}
            onRemove={removeModalData.bind(null, volume, setVolume)}
            handleMethod={handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_86')}
            optionalRequiredField={['type', 'configMap', 'secret']}
            optionalValidCallback={volumeValidCallback}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span
            className="open-modal_text"
            onClick={() =>
              ModalLauncher({ inProgress: false, path: 'spec.volumes', methods: methods, requiredFields: ['name', 'type'], optionalRequiredField: ['type', 'configMap', 'secret'], optionalValidCallback: volumeValidCallback, title: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_68'), id: 'volume', handleMethod: handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, true, methods), children: <VolumeModal methods={methods} volume={volume} />, submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8') })
            }
          >
            {`+ ${t('SINGLE:MSG_TASKS_CREATFORM_DIV2_87')}`}
          </span>
        </>
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_26')} id="step" isRequired={true}>
        <>
          <ModalList
            list={step}
            id="step"
            path="spec.steps"
            title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_26')}
            methods={methods}
            requiredFields={['name']}
            optionalRequiredField={['registryTypeToggle', 'image', 'registryRegistry', 'registryImage', 'registryTag', 'mountArr']}
            optionalValidCallback={stepValidCallback}
            children={<StepModal methods={methods} step={step} />}
            onRemove={removeModalData.bind(null, step, setStep)}
            handleMethod={handleModalData.bind(null, 'step', stepArr, step, setStep, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_88')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span
            className="open-modal_text"
            onClick={() =>
              ModalLauncher({
                inProgress: false,
                path: 'spec.steps',
                methods: methods,
                requiredFields: ['name'],
                optionalRequiredField: ['registryTypeToggle', 'image', 'registryRegistry', 'registryImage', 'registryTag', 'mountArr'],
                optionalValidCallback: stepValidCallback,
                title: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_26'),
                id: 'step',
                handleMethod: handleModalData.bind(null, 'step', stepArr, step, setStep, true, methods),
                children: <StepModal methods={methods} step={step} />,
                submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8'),
              })
            }
          >
            {`+ ${t('SINGLE:MSG_TASKS_CREATFORM_DIV2_89')}`}
          </span>
        </>
      </Section>
    </>
  );
};

const getCustomFormEditor = ({ match, kind, Form, isCreate }) => props => {
  const { formData, onChange } = props;
  const _formData = React.useMemo(() => convertToForm(formData), [formData]);
  const setFormData = React.useCallback(formData => onSubmitCallback(formData), [onSubmitCallback]);
  const watchFieldNames = ['metadata.labels', 'spec.resources.inputs', 'spec.resources.outputs', 'spec.params', 'spec.workspaces', 'spec.volumes', 'spec.steps'];
  return <Form {...props} fixed={{ apiVersion: `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`, kind, metadata: { namespace: match.params.ns } }} onSubmitCallback={onSubmitCallback} isCreate={isCreate} formData={_formData} setFormData={setFormData} onChange={onChange} watchFieldNames={watchFieldNames} />;
};

export const CreateClusterTask: React.FC<CreateClusterTaskProps> = props => {
  const { match, obj, kind } = props;
  const Form = WithCommonForm(CreateClusterTaskComponent, match.params, obj || defaultTemplateMap.get(kind), null, true);
  if (obj) {
    // edit form
    return <EditDefault initialEditorType={EditorType.Form} create={false} model={ClusterTaskModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form, isCreate: false })} obj={obj} />;
  }
  // create form
  return <CreateDefault initialEditorType={EditorType.Form} create={true} model={ClusterTaskModel} match={match} loaded={false} customFormEditor={getCustomFormEditor({ match, kind, Form, isCreate: true })} />;
};

type CreateClusterTaskProps = {
  match: RMatch<{ name: string; appName: string; ns: string; plural: K8sResourceKindReference }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
  obj: any;
};

type TaskFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
  formData: any;
};

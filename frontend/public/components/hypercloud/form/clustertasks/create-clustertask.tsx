import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { useSetTaskHook } from '../utils/useInitData';
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

const defaultValuesTemplate = {
  metadata: {
    name: 'example-name',
  },
};

const clusterTaskFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;
  return WithCommonForm(CreateClusterTaskComponent, params, defaultValues);
};

const CreateClusterTaskComponent: React.FC<TaskFormProps> = props => {
  const { t } = useTranslation();
  const methods = useFormContext();
  const {
    control,
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;

  const [labels, setLabels] = React.useState([]);
  const [inputResource, setInputResource] = React.useState([]);
  const [outputResource, setOutputResource] = React.useState([]);
  const [taskParameter, setTaskParameter] = React.useState([]);
  const [workSpace, setWorkSpace] = React.useState([]);
  const [volume, setVolume] = React.useState([]);
  const [step, setStep] = React.useState([]);

  // 각 필드 별 default value 세팅
  useSetTaskHook({ defaultValues, setLabels, setInputResource, setOutputResource, setTaskParameter, setWorkSpace, setVolume, setStep });

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
            title="Input Resource"
            methods={methods}
            requiredFields={['name', 'type']}
            children={<InputResourceModal methods={methods} inputResource={inputResource} />}
            onRemove={removeModalData.bind(null, inputResource, setInputResource)}
            handleMethod={handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_78')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.resources.inputs', methods: methods, requiredFields: ['name', 'type'], title: 'Input Resource', id: 'input-resource', handleMethod: handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, true, methods), children: <InputResourceModal methods={methods} inputResource={inputResource} />, submitText: '추가' })}>
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
            title="Output Resource"
            methods={methods}
            requiredFields={['name', 'type']}
            children={<OutputResourceModal methods={methods} outputResource={outputResource} />}
            onRemove={removeModalData.bind(null, outputResource, setOutputResource)}
            handleMethod={handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, false, methods)}
            description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_80')}
            submitText={t('COMMON:MSG_DETAILS_TAB_18')}
          ></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.resources.outputs', methods: methods, requiredFields: ['name', 'type'], title: 'Out Resource', id: 'output-resource', handleMethod: handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, true, methods), children: <OutputResourceModal methods={methods} outputResource={outputResource} />, submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_8') })}>
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

export const CreateClusterTask: React.FC<CreateClusterTaskProps> = ({ match: { params }, obj, kind }) => {
  const formComponent = clusterTaskFormFactory(params, obj);
  const TaskFormComponent = formComponent;
  return <TaskFormComponent fixed={{ apiVersion: `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`, kind }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = {};
  if (_.isArray(data.metadata.labels)) {
    data.metadata.labels.forEach(cur => {
      labels = typeof cur === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
    });
  } else {
    labels = typeof data.metadata.labels === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
  }
  delete data.metadata.labels;
  data = _.defaultsDeep({ metadata: { labels: labels } }, data);
  // apiVersion, kind
  data.kind = ClusterTaskModel.kind;
  data.apiVersion = `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`;
  // resources
  if (data.spec.resources.inputs.length === 0 && data.spec.resources.outputs.length === 0) {
    delete data.spec.resources;
  }
  //parameter
  data.spec.params = data?.spec?.params?.map((cur, idx) => {
    const stringDefault = cur?.defaultStr;
    const arrayDefault = cur.defaultArr?.map(cur => cur.value)?.filter(cur => !!cur);
    if (cur.type === 'string' && !!stringDefault) {
      data.spec.params[idx].default = stringDefault;
    } else if (arrayDefault?.length > 0) {
      data.spec.params[idx].default = arrayDefault;
    }
    delete data.spec.params[idx].defaultStr;
    delete data.spec.params[idx].defaultArr;
    return cur;
  });
  // workspace
  data.spec.workspaces = data?.spec?.workspaces?.map((cur, idx) => {
    let isReadOnly = cur.accessMode === 'readOnly' ? true : false;
    delete data.spec.workspaces[idx].accessMode;
    if (cur.mountPath === '') {
      cur.mountPath = `/workspace/${cur.name}`;
    }
    if (isReadOnly) {
      return { ...cur, readOnly: true };
    } else {
      return { ...cur, readOnly: false };
    }
  });
  // volume
  data.spec.volumes = data?.spec?.volumes?.map(cur => {
    if (cur.type === 'emptyDir') {
      return {
        name: cur?.name,
        emptyDir: {},
      };
    } else if (cur.type === 'configMap') {
      return {
        name: cur?.name,
        configMap: {
          name: cur?.configMap,
        },
      };
    } else if (cur.type === 'secret') {
      return {
        name: cur?.name,
        secret: {
          secretName: cur?.secret,
        },
      };
    }
  });
  // step
  data.spec.steps = data?.spec?.steps?.map((cur, idx) => {
    // image
    if (cur.registryTypeToggle === 'internal' && cur.registryRegistry) {
      cur.image = `${cur.registryRegistry}/${cur.registryImage}:${cur.registryTag}`;
    }
    delete cur.registryRegistry;
    delete cur.registryImage;
    delete cur.registryTag;
    delete cur.registryTypeToggle;
    delete cur.isFirstTimeEdit;
    // command
    cur.command = cur?.command?.map(curCommand => curCommand?.value);
    //args
    cur.args = cur?.args?.map(curArg => curArg?.value);
    //env
    cur.env = cur?.env?.map(curEnv =>
      curEnv.envType === 'normal'
        ? { name: curEnv?.envKey, value: curEnv?.envValue }
        : {
            name: curEnv?.envKey,
            valueFrom: {
              [`${curEnv.envType}KeyRef`]: {
                key: curEnv.resourceKey,
                name: curEnv.envValue,
              },
            },
          },
    );
    if (cur.commandTypeToggle === 'command') {
      delete data.spec.steps[idx].script;
    } else {
      delete data.spec.steps[idx].command;
      delete data.spec.steps[idx].args;
    }
    delete data.spec.steps[idx].commandTypeToggle;

    if (cur.mountArr) {
      let volumeMounts = cur.mountArr?.map(cur => ({
        mountPath: cur.mountPath,
        name: cur.mountName.value,
      }));
      data.spec.steps[idx].volumeMounts = volumeMounts;
      delete data.spec.steps[idx].mountArr;
    }
    return cur;
  });

  return data;
};

type CreateClusterTaskProps = {
  match: RMatch<{
    type?: string;
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

type TaskFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

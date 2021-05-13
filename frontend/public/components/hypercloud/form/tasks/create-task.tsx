import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { WithCommonForm, isCreatePage } from '../create-form';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { ModalLauncher, ModalList, useInitModal, handleModalData, removeModalData } from '../utils';
import { InputResourceModal } from './input-resource-modal';
import { OutputResourceModal } from './output-resource-modal';
import { TaskParameterModal } from './task-parameter-modal';
import { WorkSpaceModal } from './work-space-modal';
import { VolumeModal } from './volume-modal';
import { StepModal } from './step-modal';
import { TaskModel } from '../../../../models';

const defaultValuesTemplate = {
  metadata: {
    name: 'example-name',
  },
};

const taskFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;
  return WithCommonForm(CreateTaskComponent, params, defaultValues);
};

const CreateTaskComponent: React.FC<TaskFormProps> = props => {
  const methods = useFormContext();
  const {
    control,
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;

  const [inputResource, setInputResource] = React.useState([]);
  const [outputResource, setOutputResource] = React.useState([]);
  const [taskParameter, setTaskParameter] = React.useState([]);
  const [workSpace, setWorkSpace] = React.useState([]);
  const [volume, setVolume] = React.useState([]);
  const [step, setStep] = React.useState([]);

  // 이 페이지가 처음 마운트 되었을 때 한번 되어야 함. (나중에 modal 별로 다 한거를 custom hook으로 묶어주면 좋을듯.)
  React.useEffect(() => {
    if (!isCreatePage(defaultValues)) {
      if (_.has(defaultValues, 'spec.resources.inputs')) {
        let inputResources = _.get(defaultValues, 'spec.resources.inputs');
        setInputResource(inputResources);
        console.log('inputResource: ', inputResources);
      }
      if (_.has(defaultValues, 'spec.resources.outputs')) {
        let outputResources = _.get(defaultValues, 'spec.resources.outputs');
        setOutputResource(outputResources);
        console.log('outputresource: ', outputResources);
      }
      if (_.has(defaultValues, 'spec.params')) {
        let paramDefaultValues = _.get(defaultValues, 'spec.params');
        paramDefaultValues = paramDefaultValues.map(item => {
          if (item.type === 'array') {
            return _.assign(item, {
              default: item.default?.map(cur => {
                return { value: cur };
              }),
            });
          } else {
            return _.assign(item, { default: item.default });
          }
        });
        setTaskParameter(paramDefaultValues);
        console.log('params: ', paramDefaultValues);
      }
      if (_.has(defaultValues, 'spec.workspaces')) {
        let workSpaceDefaultValues = _.get(defaultValues, 'spec.workspaces');
        workSpaceDefaultValues = workSpaceDefaultValues.map(item => {
          if (typeof workSpaceDefaultValues.readOnly != 'undefined') {
            // 여기서 부터 다시...
            if (item.readOnly) {
              item.accessMode = 'readOnly';
            } else {
              item.accessMode = 'readWrite';
            }
            delete item.readOnly;
          }
          return item;
        });
        setWorkSpace(workSpaceDefaultValues);
        console.log('workspace: ', workSpaceDefaultValues);
      }
      if (_.has(defaultValues, 'spec.volumes')) {
        let volumeDefaultValues = _.get(defaultValues, 'spec.volumes');
        volumeDefaultValues = volumeDefaultValues.map(item => {
          let obj = {};
          if (item.configMap) {
            obj['type'] = 'configMap';
            obj['name'] = item.configMap.name;
          } else if (item.secret) {
            obj['type'] = 'secret';
            obj['name'] = item.secret.name;
          } else if (item.emptyDir) {
            obj['type'] = 'emptyDir';
            obj['name'] = item.emptyDir.name;
          }
          return obj;
        });
        setVolume(volumeDefaultValues);
        console.log('volume: ', volumeDefaultValues);
      }
      if (_.has(defaultValues, 'spec.steps')) {
        let stepDefaultValues = _.get(defaultValues, 'spec.steps');
        stepDefaultValues = stepDefaultValues.map(item => {
          return _.assign(item, {
            command: item.command?.map(cur => {
              return {value: cur};
            }),
            env: item.env?.map(cur=> {
              return {
                envKey: [cur],
                envValue: cur
              }
            }),
            args: item.args?.map(cur => {
              return {value: cur}
            })
          })
        });
        setStep(stepDefaultValues);
      }
    }
  }, []);

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
  let taskParameterArr = ['name', 'description', 'type', 'default'];
  let workspaceArr = ['name', 'description', 'mountPath', 'accessMode', 'optional'];
  let volumeArr = ['name', 'type'];
  let stepArr = ['name', 'imageToggle', 'registryRegistry', 'registryImage', 'registryTag', 'image', 'command', 'args', 'env'];

  return (
    <>
      <Section label="라벨" id="label">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>
      <Section label="인풋 리소스" id="inputResource">
        <>
          <ModalList list={inputResource} id="input-resource" title="Input Resource" children={<InputResourceModal methods={methods} inputResource={inputResource} />} onRemove={removeModalData.bind(null, inputResource, setInputResource)} handleMethod={handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, false, methods)} methods={methods} description="이 태스크와 연결된 인풋 리소스가 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: 'Input Resource', id: 'input-resource', handleMethod: handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, true, methods), children: <InputResourceModal methods={methods} inputResource={inputResource} />, submitText: '추가' })}>
            + 인풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="아웃풋 리소스" id="outputResource">
        <>
          <ModalList list={outputResource} id="output-resource" title="Output Resource" children={<OutputResourceModal methods={methods} outputResource={outputResource} />} onRemove={removeModalData.bind(null, outputResource, setOutputResource)} handleMethod={handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, false, methods)} methods={methods} description="이 태스크와 연결된 아웃풋 리소스가 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: 'Out Resource', id: 'output-resource', handleMethod: handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, true, methods), children: <OutputResourceModal methods={methods} outputResource={outputResource} />, submitText: '추가' })}>
            + 아웃풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="태스크 파라미터 구성" id="taskParamter">
        <>
          <ModalList list={taskParameter} id="task-parameter" title="태스크 파라미터 구성" children={<TaskParameterModal methods={methods} taskParameter={taskParameter} />} onRemove={removeModalData.bind(null, taskParameter, setTaskParameter)} handleMethod={handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, false, methods)} methods={methods} description="이 태스크와 연결된 태스크 파라미터 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '태스크 파라미터', id: 'task-parameter', handleMethod: handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, true, methods), children: <TaskParameterModal methods={methods} taskParameter={taskParameter} />, submitText: '추가' })}>
            + 태스크 파라미터 추가
          </span>
        </>
      </Section>
      <Section label="워크스페이스 구성" id="workSpace">
        <>
          <ModalList list={workSpace} id="work-space" title="워크스페이스 구성" children={<WorkSpaceModal methods={methods} workSpace={workSpace} />} onRemove={removeModalData.bind(null, workSpace, setWorkSpace)} handleMethod={handleModalData.bind(null, 'workspace', workspaceArr, workSpace, setWorkSpace, false, methods)} methods={methods} description="이 태스크와 연결된 워크스페이스 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '워크스페이스', id: 'work-space', handleMethod: handleModalData.bind(null, 'workspace', workspaceArr, workSpace, setWorkSpace, true, methods), children: <WorkSpaceModal methods={methods} workSpace={workSpace} />, submitText: '추가' })}>
            + 워크스페이스 추가
          </span>
        </>
      </Section>
      <Section label="볼륨" id="volume">
        <>
          <ModalList list={volume} id="volume" title="볼륨 구성" children={<VolumeModal methods={methods} volume={volume} />} onRemove={removeModalData.bind(null, volume, setVolume)} handleMethod={handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, false, methods)} methods={methods} description="이 태스크와 연결된 볼륨이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '볼륨', id: 'volume', handleMethod: handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, true, methods), children: <VolumeModal methods={methods} volume={volume} />, submitText: '추가' })}>
            + 볼륨 추가
          </span>
        </>
      </Section>
      <Section label="스텝" id="step">
        <>
          <ModalList list={step} id="step" title="스텝 구성" children={<StepModal methods={methods} step={step} />} onRemove={removeModalData.bind(null, step, setStep)} handleMethod={handleModalData.bind(null, 'step', stepArr, step, setStep, false, methods)} methods={methods} description="이 태스크와 연결된 스텝이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '스텝', id: 'step', handleMethod: handleModalData.bind(null, 'step', stepArr, step, setStep, true, methods), children: <StepModal methods={methods} step={step} />, submitText: '추가' })}>
            + 스텝 추가
          </span>
        </>
      </Section>
    </>
  );
};

export const CreateTask: React.FC<CreateTaskProps> = ({ match: { params }, obj, kind }) => {
  const formComponent = taskFormFactory(params, obj);
  const TaskFormComponent = formComponent;
  return <TaskFormComponent fixed={{ apiVersion: `${TaskModel.apiGroup}/${TaskModel.apiVersion}`, kind, metadata: { namespace: params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);
  delete data.metadata.labels;
  data = _.defaultsDeep(data, { metadata: { labels: labels } });
  // apiVersion, kind
  data.kind = TaskModel.kind;
  data.apiVersion = `${TaskModel.apiGroup}/${TaskModel.apiVersion}`;
  // workspace
  data.spec.workspaces = data?.spec?.workspaces?.map((cur, idx) => {
    let isReadOnly = cur.accessMode === 'readOnly' ? true : false;
    delete data.spec.workspaces[idx].accessMode;
    if (isReadOnly) {
      return { ...cur, readOnly: true };
    } else {
      return { ...cur, readOnly: false };
    }
  });
  // volume
  data.spec.volumes = data?.spec?.volumes?.map(cur => {
    if (cur.type === 'emptyDir') {
      return { emptyDir: {} };
    } else if (cur.type === 'configMap') {
      return {
        configMap: {
          name: cur?.name,
        },
      };
    } else if (cur.type === 'secret') {
      return {
        secret: {
          secretName: cur?.name,
        },
      };
    }
  });
  // step
  data.spec.steps = data?.spec?.steps?.map((cur, idx) => {
    // command
    cur.command = cur?.command?.map(curCommand => curCommand?.value);
    //args
    cur.args = cur?.args?.map(curArg => curArg?.value);
    //env
    cur.env = cur?.env?.map(curEnv => ({ name: curEnv?.envKey, value: curEnv?.envValue }));

    if (cur.imageToggle === 'registry') {
      cur.image = `${cur.registryRegistry}-${cur.registryImage}-${cur.registryTag}`;

      delete data.spec.steps[idx].registryRegistry;
      delete data.spec.steps[idx].registryImage;
      delete data.spec.steps[idx].registryTag;
    } else {
      delete data.spec.steps[idx].registryRegistry;
      delete data.spec.steps[idx].registryImage;
      delete data.spec.steps[idx].registryTag;
    }

    delete data.spec.steps[idx].imageToggle;
    return cur;
  });

  return data;
};

type CreateTaskProps = {
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

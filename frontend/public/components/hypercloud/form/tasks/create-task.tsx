import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
// import { TextInput } from '../../utils/text-input';
import { SelectorInput } from '../../../utils';
import { ModalLauncher, ModalList } from '../utils';
import { InputResourceModal } from './input-resource-modal';
import { OutputResourceModal } from './output-resource-modal';
import { TaskParameterModal } from './task-parameter-modal';
import { WorkSpaceModal } from './work-space-modal';
import { VolumeModal } from './volume-modal';
import { StepModal } from './step-modal';
import { TaskModel } from '../../../../models';
const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};

const taskFormFactory = params => {
  return WithCommonForm(CreateTaskComponent, params, defaultValues);
};

const CreateTaskComponent: React.FC<TaskFormProps> = props => {
  const methods = useFormContext();
  const { control, register, setValue } = methods;
  const [inputResource, setInputResource] = React.useState([]);
  const [outputResource, setOutputResource] = React.useState([]);
  const [taskParameter, setTaskParameter] = React.useState([]);
  const [workSpace, setWorkSpace] = React.useState([]);
  const [volume, setVolume] = React.useState([]);
  const [step, setStep] = React.useState([]);

  React.useEffect(() => {
    register('spec.resources.inputs');
    register('spec.resources.outputs');
    register('spec.params');
    register('spec.workspaces');
    register('spec.volumes');
    register('spec.steps');
  }, [register]);

  React.useMemo(() => {
    setValue('spec.resources.inputs', inputResource);
  }, [inputResource]);

  React.useMemo(() => {
    setValue('spec.resources.outputs', outputResource);
  }, [outputResource]);

  React.useMemo(() => {
    setValue('spec.params', taskParameter);
  }, [taskParameter]);

  React.useMemo(() => {
    setValue('spec.workspaces', workSpace);
  }, [workSpace]);

  React.useMemo(() => {
    setValue('spec.volumes', volume);
  }, [volume]);

  React.useMemo(() => {
    setValue('spec.steps', step);
  }, [step]);

  // INPUT RESOURCE
  const onAddInputResource = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currInputResource = { name: data.name, targetPath: data.targetPath, type: data.type, optional: data.optional };
    setInputResource(() => {
      return [...inputResource, currInputResource];
    }); // state 최신화
    cancel();
    return false;
  };
  const onRemoveInputResource = e => {
    let currInputResource = inputResource.filter((cur, idx) => {
      let targetIndex = Number(e.target.id.split('item-remove')[1]);
      return targetIndex !== idx;
    });
    setInputResource([...currInputResource]);
  };
  const onModifyInputResource = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let list = document.getElementById('input-resource-list').childNodes;
    list.forEach(cur => {
      if (cur['dataset']['modify'] === 'true') {
        cur['dataset']['modify'] = false;
      }
    });

    let data = methods.getValues(); // modal에서 입력받은 data
    let currInputResource = inputResource.map((cur, idx) => {
      if (idx === index) {
        return { name: data.name, targetPath: data.targetPath, type: data.type, optional: data.optional };
      }
      return cur;
    });
    setInputResource([...currInputResource]);
    cancel();
  };

  // OUTPUT RESOURCE
  const onAddOutputResource = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currOutputResource = { name: data.name, targetPath: data.targetPath, type: data.type, optional: data.optional };
    setOutputResource(() => {
      return [...outputResource, currOutputResource];
    }); // state 최신화
    cancel();
    return false;
  };
  const onRemoveOutputResource = e => {
    let currOutputResource = outputResource.filter((cur, idx) => {
      let targetIndex = Number(e.target.id.split('item-remove')[1]);
      return targetIndex !== idx;
    });
    setOutputResource([...currOutputResource]);
  };
  const onModifyOutputResource = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();

    let list = document.getElementById('output-resource-list').childNodes;
    list.forEach(cur => {
      if (cur['dataset']['modify'] === 'true') {
        cur['dataset']['modify'] = false;
      }
    });

    let data = methods.getValues(); // modal에서 입력받은 data
    let currOutputResource = outputResource.map((cur, idx) => {
      if (idx === index) {
        return { name: data.name, targetPath: data.targetPath, type: data.type, optional: data.optional };
      }
      return cur;
    });
    setOutputResource([...currOutputResource]);
    cancel();
  };

  // TASK PARAMETER
  const onAddTaskParameter = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currTaskParameter = { name: data.name, description: data.description, type: data.type, default: data.default };
    setTaskParameter(() => {
      return [...taskParameter, currTaskParameter];
    }); // state 최신화
    cancel();
    return false;
  };
  const onRemoveTaskParameter = e => {
    let currTaskParameter = taskParameter.filter((cur, idx) => {
      let targetIndex = Number(e.target.id.split('item-remove')[1]);
      return targetIndex !== idx;
    });
    setTaskParameter([...currTaskParameter]);
  };
  const onModifyTaskParameter = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();

    let list = document.getElementById('task-parameter-list').childNodes;
    list.forEach(cur => {
      if (cur['dataset']['modify'] === 'true') {
        cur['dataset']['modify'] = false;
      }
    });

    let data = methods.getValues(); // modal에서 입력받은 data
    let currTaskParameter = taskParameter.map((cur, idx) => {
      if (idx === index) {
        return { name: data.name, description: data.description, type: data.type, default: data.default };
      }
      return cur;
    });
    setTaskParameter([...currTaskParameter]);
    cancel();
  };

  // WORKSPACE
  const onAddWorkSpace = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currWorkSpace = { name: data.name, description: data.description, mountPath: data.mountPath, accessMode: data.accessMode, optional: data.optional };
    setWorkSpace(() => {
      return [...workSpace, currWorkSpace];
    }); // state 최신화
    cancel();
    return false;
  };
  const onRemoveWorkSpace = e => {
    let currWorkSpace = workSpace.filter((cur, idx) => {
      let targetIndex = Number(e.target.id.split('item-remove')[1]);
      return targetIndex !== idx;
    });
    setWorkSpace([...currWorkSpace]);
  };
  const onModifyWorkSpace = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();

    let list = document.getElementById('work-space-list').childNodes;
    list.forEach(cur => {
      if (cur['dataset']['modify'] === 'true') {
        cur['dataset']['modify'] = false;
      }
    });

    let data = methods.getValues(); // modal에서 입력받은 data
    let currWorkSpace = workSpace.map((cur, idx) => {
      if (idx === index) {
        return { name: data.name, description: data.description, mountPath: data.mountPath, accessMode: data.accessMode, optional: data.optional };
      }
      return cur;
    });
    setWorkSpace([...currWorkSpace]);
    cancel();
  };

  // VOLUME
  const onAddVolume = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currVolume = { name: data.name, type: data.type };
    if (currVolume.type === 'secret') {
      currVolume['secret'] = data['secret'];
      delete currVolume['configMap'];
    } else if (currVolume.type === 'configMap') {
      currVolume['configMap'] = data['configMap'];
      delete currVolume['secret'];
    }
    setVolume(() => {
      return [...volume, currVolume];
    }); // state 최신화
    cancel();
    return false;
  };
  const onRemoveVolume = e => {
    let currVolume = volume.filter((cur, idx) => {
      let targetIndex = Number(e.target.id.split('item-remove')[1]);
      return targetIndex !== idx;
    });
    setVolume([...currVolume]);
  };
  const onModifyVolume = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();

    let list = document.getElementById('volume-list').childNodes;
    list.forEach(cur => {
      if (cur['dataset']['modify'] === 'true') {
        cur['dataset']['modify'] = false;
      }
    });

    let data = methods.getValues(); // modal에서 입력받은 data
    let currVolume = volume.map((cur, idx) => {
      if (idx === index) {
        let volume = { name: data.name, type: data.type };
        if (volume.type === 'secret') {
          volume['secret'] = data.secret;
          delete volume['configMap'];
        } else if (volume.type === 'configMap') {
          volume['configMap'] = data['configMap'];
          delete volume['secret'];
        }
        return volume;
      }
      return cur;
    });
    setVolume([...currVolume]);
    cancel();
  };

  // STEP
  const onAddStep = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currStep = { name: data.name, imageToggle: data.imageToggle, registryRegistry: data.registryRegistry, registryImage: data.registryImage, registryTag: data.registryTag, image: data.image, command: data.command, args: data.args, env: data.env };
    setStep(() => {
      return [...step, currStep];
    }); // state 최신화
    cancel();
    return false;
  };
  const onRemoveStep = e => {
    let currStep = step.filter((cur, idx) => {
      let targetIndex = Number(e.target.id.split('item-remove')[1]);
      return targetIndex !== idx;
    });
    setStep([...currStep]);
  };
  const onModifyStep = (cancel, index, e: React.SyntheticEvent) => {
    e.preventDefault();
    let data = methods.getValues(); // modal에서 입력받은 data
    let currStep = step.map((cur, idx) => {
      if (idx === index) {
        return { name: data.name, imageToggle: data.imageToggle, registryRegistry: data.registryRegistry, registryImage: data.registryImage, registryTag: data.registryTag, image: data.image, command: data.command, args: data.args, env: data.env };
      }
      return cur;
    });
    setStep([...currStep]);
    cancel();
  };

  return (
    <>
      <Section label="Labels" id="label" description="이것은 Label입니다.">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>
      <Section label="Input Resource" id="inputResource">
        <>
          <ModalList list={inputResource} id="input-resource" title="Input Resource" children={<InputResourceModal methods={methods} inputResource={inputResource} />} onRemove={onRemoveInputResource} onModify={onModifyInputResource} methods={methods} description="이 태스크와 연결된 인풋 리소스가 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: 'Input Resource', id: 'input-resource', handleMethod: onAddInputResource, children: <InputResourceModal methods={methods} inputResource={inputResource} />, submitText: '추가' })}>
            + 인풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="Output Resource" id="outputResource">
        <>
          <ModalList list={outputResource} id="output-resource" title="Output Resource" children={<OutputResourceModal methods={methods} outputResource={outputResource} />} onRemove={onRemoveOutputResource} onModify={onModifyOutputResource} methods={methods} description="이 태스크와 연결된 아웃풋 리소스가 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: 'Out Resource', id: 'output-resource', handleMethod: onAddOutputResource, children: <OutputResourceModal methods={methods} outputResource={outputResource} />, submitText: '추가' })}>
            + 아웃풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="태스크 파라미터 구성" id="taskParamter">
        <>
          <ModalList list={taskParameter} id="task-parameter" title="태스크 파라미터 구성" children={<TaskParameterModal methods={methods} taskParameter={taskParameter} />} onRemove={onRemoveTaskParameter} onModify={onModifyTaskParameter} methods={methods} description="이 태스크와 연결된 태스크 파라미터 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '태스크 파라미터', id: 'task-parameter', handleMethod: onAddTaskParameter, children: <TaskParameterModal methods={methods} taskParameter={taskParameter} />, submitText: '추가' })}>
            + 태스크 파라미터 추가
          </span>
        </>
      </Section>
      <Section label="워크스페이스 구성" id="workSpace">
        <>
          <ModalList list={workSpace} id="work-space" title="워크스페이스 구성" children={<WorkSpaceModal methods={methods} workSpace={workSpace} />} onRemove={onRemoveWorkSpace} onModify={onModifyWorkSpace} methods={methods} description="이 태스크와 연결된 워크스페이스 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '워크스페이스', id: 'work-space', handleMethod: onAddWorkSpace, children: <WorkSpaceModal methods={methods} workSpace={workSpace} />, submitText: '추가' })}>
            + 워크스페이스 추가
          </span>
        </>
      </Section>
      <Section label="볼륨" id="volume">
        <>
          <ModalList list={volume} id="volume" title="볼륨 구성" children={<VolumeModal methods={methods} volume={volume} />} onRemove={onRemoveVolume} onModify={onModifyVolume} methods={methods} description="이 태스크와 연결된 볼륨이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '볼륨', id: 'volume', handleMethod: onAddVolume, children: <VolumeModal methods={methods} volume={volume} />, submitText: '추가' })}>
            + 볼륨 추가
          </span>
        </>
      </Section>
      <Section label="스텝" id="step">
        <>
          <ModalList list={step} id="step" title="스텝 구성" children={<StepModal methods={methods} step={step} />} onRemove={onRemoveStep} onModify={onModifyStep} methods={methods} description="이 태스크와 연결된 스텝이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '스텝', id: 'step', handleMethod: onAddStep, children: <StepModal methods={methods} step={step} />, submitText: '추가' })}>
            + 스텝 추가
          </span>
        </>
      </Section>
    </>
  );
};

export const CreateTask: React.FC<CreateTaskProps> = ({ match: { params }, kind }) => {
  const formComponent = taskFormFactory(params);
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

    delete data.spec.steps[idx].imageToggle;
    return cur;
  });

  console.log(data);
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
};

type TaskFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

import * as _ from 'lodash-es';
import * as React from 'react';
import { useWatch } from 'react-hook-form';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { ResourceDropdown } from '../../utils/resource-dropdown';

const workspaceType = {
  VolumeClaimTemplate: 'Volume Claim Template',
  PVC: 'PVC',
  EmptyDirectory: 'Empty Directory',
  ConfigMap: 'Config Map',
  Secret: 'Secret',
}

const accessItems = [
  {
    title: 'ReadWriteOnce',
    value: 'ReadWriteOnce',
  },
  {
    title: 'ReadWriteMany',
    value: 'ReadWriteMany',
  },
  {
    title: 'ReadOnly',
    value: 'ReadOnly',
  },
];

export const Workspace = props => {
  const workspace = useWatch<string>({
    control: props.methods.control,
    name: `${props.id}.name.${props.name}`,
  });

  const workspaceDetail = {
    VolumeClaimTemplate: (
      <>
        <Section label='접근 모드' id='accessMode'>
          <RadioGroup name={`${props.id}.volumeClaimTemplate.spec.accessModes`} items={accessItems} methods={props.methods} />
        </Section>
        <Section label='스토리지 크기' id='storage'>
          <TextInput className='pf-c-form-control' id={`${props.id}.volumeClaimTemplate.spec.resources.requests.storage`} methods={props.methods} />
        </Section>
        <Section label='스토리지 클래스 이름' id='storageClass'>
          <TextInput className='pf-c-form-control' id={`${props.id}.volumeClaimTemplate.spec.storageClassName`} methods={props.methods} />
        </Section>
      </>),
    PVC: (
      <>
        <Section label='영구 볼륨 클레임' id='pvc'>
          <ResourceDropdown
            name={`${props.id}.persistentVolumeClaim.claimName`}
            resources={[
              {
                kind: 'PersistentVolumeClaim',
                namespace: props.namespace,
                prop: 'persistentvolumeclaim',
              },
            ]}
            type="single"
            methods={props.methods}
            useHookForm
          />
        </Section>
      </>
    ),
    ConfigMap: (
      <>
        <Section label='컨피그 맵' id='configmap'>
          <ResourceDropdown
            name={`${props.id}.configmap.name`}
            resources={[
              {
                kind: 'ConfigMap',
                namespace: props.namespace,
                prop: 'configmap',
              },
            ]}
            type="single"
            methods={props.methods}
            useHookForm
          />
        </Section>
      </>
    ),
    Secret: (
      <>
        <Section label='시크릿' id='secret'>
          <ResourceDropdown
            name={`${props.id}.secret.secretName`}
            resources={[
              {
                kind: 'Secret',
                namespace: props.namespace,
                prop: 'secret',
              },
            ]}
            type="single"
            methods={props.methods}
            useHookForm
          />
        </Section>
      </>
    ),
    EmptyDirectory: null
  }[workspace];

  return (<ul>
    <Section label={props.name} id={props.name}>
      <Dropdown
        name={`${props.id}.name.${props.name}`}
        title='워크스페이스 타입 선택'
        items={workspaceType}
      />
    </Section>
    {workspaceDetail}
  </ul>);
}
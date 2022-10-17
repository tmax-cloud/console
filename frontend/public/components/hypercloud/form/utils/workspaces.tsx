import * as _ from 'lodash-es';
import * as React from 'react';
import { useWatch } from 'react-hook-form';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { useTranslation } from 'react-i18next';

const workspaceType = {
  VolumeClaimTemplate: 'Volume Claim Template',
  PVC: 'PVC',
  EmptyDirectory: 'Empty Directory',
  ConfigMap: 'Config Map',
  Secret: 'Secret',
};

export const workspaceTypeKeys = {
  volumeClaimTemplate: 'VolumeClaimTemplate',
  persistentVolumeClaim: 'PVC',
  emptyDir: 'EmptyDirectory',
  configmap: 'ConfigMap',
  secret: 'Secret',
};

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
  const { t } = useTranslation();
  const workspace = useWatch<string>({
    control: props.methods.control,
    name: `${props.id}.name.${props.name}`,
  });

  const workspaceDetail = {
    VolumeClaimTemplate: (
      <>
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_14')} id="accessMode">
          <RadioGroup name={`${props.id}.volumeClaimTemplate.spec.accessModes`} items={accessItems} methods={props.methods} />
        </Section>
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_12')} id="storage">
          <TextInput className="pf-c-form-control" id={`${props.id}.volumeClaimTemplate.spec.resources.requests.storage`} methods={props.methods} />
        </Section>
        <Section label={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_13')} id="storageClass">
          <TextInput className="pf-c-form-control" id={`${props.id}.volumeClaimTemplate.spec.storageClassName`} methods={props.methods} />
        </Section>
      </>
    ),
    PVC: (
      <>
        <Section label={t('COMMON:MSG_LNB_MENU_141')} id="pvc">
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
        <Section label={t('COMMON:MSG_LNB_MENU_120')} id="configmap">
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
        <Section label={t('COMMON:MSG_LNB_MENU_119')} id="secret">
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
    EmptyDirectory: null,
  }[workspace];

  return (
    <ul>
      <Section label={props.name} id={props.name}>
        <Dropdown name={`${props.id}.name.${props.name}`} title={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_10')} items={workspaceType} defaultValue={props.type} />
      </Section>
      {workspaceDetail}
    </ul>
  );
};

//import { useTranslation } from 'react-i18next';

export enum StartedByLabel {
  user = 'pipeline.openshift.io/started-by',
  triggers = 'triggers.tekton.dev/eventlistener',
}

export enum PipelineResourceType {
  git = 'git',
  image = 'image',
  cluster = 'cluster',
  storage = 'storage',
}

export const pipelineResourceTypeSelections = t => {
  return {
    [PipelineResourceType.git]: t('SINGLE:MSG_PIPELINES_CREATEFORM_16'),
    [PipelineResourceType.image]: t('SINGLE:MSG_PIPELINES_CREATEFORM_17'),
  };
};

export enum VolumeTypes {
  EmptyDirectory = 'Empty Directory',
  ConfigMap = 'Config Map',
  Secret = 'Secret',
  PVC = 'PVC',
}

export enum SecretAnnotationId {
  Git = 'git',
  Image = 'docker',
}

export const SecretAnnotationType = {
  [SecretAnnotationId.Git]: 'Git Server',
  [SecretAnnotationId.Image]: 'Docker Registry',
};

export const PIPELINE_SERVICE_ACCOUNT = 'pipeline';

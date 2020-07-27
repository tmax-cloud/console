/* eslint-disable no-undef */

export * from './job';
export * from './k8s';
export * from './node';
export * from './pods';
export * from './resource';
export * from './autocomplete';
export * from './get-resources';
export * from './k8s-models';

export type OwnerReference = {
  name: string;
  kind: string;
  uid: string;
  apiVersion: string;
};

export type ObjectMetadata = {
  annotations?: { [key: string]: string };
  name: string;
  namespace?: string;
  labels?: { [key: string]: string };
  ownerReferences?: OwnerReference[];
  [key: string]: any;
};

export type K8sResourceKind = {
  apiVersion: string;
  kind: string;
  metadata: ObjectMetadata;
  spec?: {
    selector?: {
      matchLabels?: { [key: string]: any };
    };
    [key: string]: any;
  };
  status?: { [key: string]: any };
  type?: { [key: string]: any };
};

export type ConfigMapKind = {
  apiVersion: string;
  kind: string;
  metadata: {
    annotations?: { [key: string]: string };
    name: string;
    namespace?: string;
    labels?: { [key: string]: string };
    ownerReferences?: OwnerReference[];
    [key: string]: any;
  };
  data: { [key: string]: string };
};

export type CustomResourceDefinitionKind = {
  spec: {
    version: string;
    group: string;
    names: {
      kind: string;
      singular: string;
      plural: string;
      listKind: string;
      shortNames?: string[];
    };
    scope?: 'Namespaced';
  };
} & K8sResourceKind;

export type K8sKind = {
  abbr: string;
  kind: string;
  label: string;
  labelPlural: string;
  path: string;
  plural: string;
  propagationPolicy?: 'Foreground' | 'Background';

  id?: string;
  crd?: boolean;
  apiVersion: string;
  apiGroup?: string;
  namespaced?: boolean;
  selector?: { matchLabels?: { [key: string]: string } };
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  verbs?: string[];
};

/**
 * GroupVersionKind unambiguously identifies a kind.
 * https://godoc.org/k8s.io/apimachinery/pkg/runtime/schema#GroupVersionKind
 * TODO: Change this to a regex-type if it ever becomes a thing (https://github.com/Microsoft/TypeScript/issues/6579)
 */
export type GroupVersionKind = string;

/**
 * The canonical, unique identifier for a Kubernetes resource type.
 * Maintains backwards-compatibility with references using the `kind` string field.
 */
export type K8sResourceKindReference = GroupVersionKind | string;

type ContainerStateValue = {
  reason?: string;
  [key: string]: any;
};

export type ContainerState = {
  waiting?: ContainerStateValue;
  running?: ContainerStateValue;
  terminated?: ContainerStateValue;
};

export type ContainerStatus = {
  name: string;
  state?: ContainerState;
  lastState?: ContainerState;
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID?: string;
};

export type K8sResourceCommon = {
  apiVersion?: string;
  kind?: string;
  metadata?: ObjectMetadata;
};

export type SecretKind = {
  data: { [key: string]: string };
  stringData?: { [key: string]: string };
  type: string;
} & K8sResourceCommon;

export type K8sVerb = 'create' | 'get' | 'list' | 'update' | 'patch' | 'delete' | 'deletecollection' | 'watch';

export type AccessReviewResourceAttributes = {
  group?: string;
  resource?: string;
  subresource?: string;
  verb?: K8sVerb;
  name?: string;
  namespace?: string;
};

export type SelfSubjectAccessReviewKind = {
  apiVersion: string;
  kind: string;
  metadata?: ObjectMetadata;
  spec: {
    resourceAttributes?: AccessReviewResourceAttributes;
  };
  status?: {
    allowed: boolean;
    denied?: boolean;
    reason?: string;
    evaluationError?: string;
  };
};

export enum K8sResourceConditionStatus {
  True = 'True',
  False = 'False',
  Unknown = 'Unknown',
}

export type K8sResourceCondition = {
  type: string;
  status: keyof typeof K8sResourceConditionStatus;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
};

export type NodeCondition = {
  lastHeartbeatTime?: string;
} & K8sResourceCondition;

export type TaintEffect = '' | 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';

export type Taint = {
  key: string;
  value: string;
  effect: TaintEffect;
};

export type NodeKind = {
  spec: {
    taints?: Taint[];
    unschedulable?: boolean;
  };
  status?: {
    capacity?: {
      [key: string]: string;
    };
    conditions?: NodeCondition[];
    images?: {
      names: string[];
      sizeBytes?: number;
    }[];
    phase?: string;
  };
} & K8sResourceCommon;

export type TolerationOperator = 'Exists' | 'Equal';

export type Toleration = {
  effect: TaintEffect;
  key?: string;
  operator: TolerationOperator;
  tolerationSeconds?: number;
  value?: string;
};

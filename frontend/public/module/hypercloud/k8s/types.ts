import { K8sResourceCommon, K8sResourceKind } from '../../k8s';
import { MenuInfo } from '../../../hypercloud/menu/menu-types';
import { I18nInfo } from '../../../models/hypercloud/resource-plural';
import { BadgeType } from '@console/shared';

export type ApprovalKind = K8sResourceCommon & {
  namespace?: string;
  apiGroup?: string;
};

export type ClusterTemplateClaimKind = K8sResourceKind & {
  resourceName?: string;
};

export type K8sClaimResourceKind = K8sResourceKind & {
  resourceName?: string;
  roleRef?: any;
};

export type HyperCloudExtension = {
  menuInfo?: MenuInfo;
  i18nInfo?: I18nInfo;
};

export type NonK8sKind = {
  abbr: string;
  kind: string;
  label: string;
  labelPlural: string;
  plural: string;  
  namespaced?: boolean;  
  badge?: BadgeType;
  color?: string;
  menuInfo?: MenuInfo;
  i18nInfo?: I18nInfo;
  nonK8SResource?: boolean;
};

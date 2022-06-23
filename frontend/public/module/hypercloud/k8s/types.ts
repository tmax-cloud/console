import { K8sResourceCommon, K8sResourceKind } from '../../k8s';
import { MenuInfo } from '../../../hypercloud/menu/menu-types';
import { I18nInfo } from '../../../models/hypercloud/resource-plural';

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

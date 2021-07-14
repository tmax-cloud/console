import * as _ from 'lodash';
import * as React from 'react';
import { TFApplyClaimModel, ResourceQuotaClaimModel, NamespaceClaimModel, ClusterClaimModel, ClusterTemplateClaimModel, RoleBindingClaimModel } from '@console/internal/models';

export const saveButtonDisabledString = () => {
  return (
    <div>
      <span>수정할 수 없는 상태의 리소스입니다.</span>
    </div>
  );
};

const isNotAllowedStatus = (statusList, currentStatus) => {
  return _.indexOf(statusList, currentStatus) >= 0;
};

export const isSaveButtonDisabled = obj => {
  let kind = obj.kind;
  let status = ''; // 리소스마다 status 위치 다름
  switch (kind) {
    case TFApplyClaimModel.kind:
      status = obj.status.phase;
      return isNotAllowedStatus(['Approved', 'Planned', 'Applied', 'Destroyed'], status);
    case ResourceQuotaClaimModel.kind:
      status = obj.status.status;
      return isNotAllowedStatus(['Approved', 'Resource Quota Deleted'], status);
    case NamespaceClaimModel.kind:
      status = obj?.status?.status;
      return isNotAllowedStatus(['Approved', 'Namespace Deleted'], status);
    case ClusterClaimModel.kind:
      status = obj?.status?.phase;
      return isNotAllowedStatus(['Approved', 'ClusterClaim Deleted'], status);
    case ClusterTemplateClaimModel.kind:
      status = obj?.status?.status;
      return isNotAllowedStatus(['Approved', 'Cluster Template Deleted'], status);
    case RoleBindingClaimModel.kind:
      status = obj?.status?.status;
      return isNotAllowedStatus(['Approved', 'Role Binding Deleted'], status);
    default:
      return false;
  }
};

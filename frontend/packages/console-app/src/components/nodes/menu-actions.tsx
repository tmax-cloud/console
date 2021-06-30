import * as React from 'react';
import { K8sKind, NodeKind } from '@console/internal/module/k8s';
import { Kebab, KebabAction, asAccessReview } from '@console/internal/components/utils';
import { isNodeUnschedulable } from '@console/shared';
import { makeNodeSchedulable } from '../../k8s/requests/nodes';
import { createConfigureUnschedulableModal } from './modals';
import { NodeModel } from '@console/internal/models';
import { deleteModal } from '@console/internal/components/modals/delete-modal';
import { useTranslation } from 'react-i18next';

export const MarkAsUnschedulable: KebabAction = (kind: K8sKind, obj: NodeKind) => {
  const { t } = useTranslation();
  return {
    label: t('COMMON:MSG_COMMON_ACTIONBUTTON_49'),
    hidden: isNodeUnschedulable(obj),
    callback: () => createConfigureUnschedulableModal({ resource: obj }),
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      verb: 'patch',
    },
  };
};

export const MarkAsSchedulable: KebabAction = (
  kind: K8sKind,
  obj: NodeKind,
  resources: {},
  { nodeMaintenance } = { nodeMaintenance: false }, // NOTE: used by node actions in metal3-plugin
) => {
  const { t } = useTranslation();
  return {
    label: t('COMMON:MSG_COMMON_ACTIONBUTTON_70'),
    hidden: !isNodeUnschedulable(obj) || nodeMaintenance,
    callback: () => makeNodeSchedulable(obj),
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      verb: 'patch',
    },
  };
};

export const Delete: KebabAction = (kindObj: K8sKind, node: NodeKind) => {
  const { t } = useTranslation();
  const message = <p>{t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_4', { 0: node.metadata.name })}</p>;

  return {
    label: t('COMMON:MSG_COMMON_ACTIONBUTTON_51'),
    callback: () =>
      deleteModal({
        kind: kindObj,
        resource: node,
        message,
      }),
    accessReview: asAccessReview(NodeModel, node, 'delete'),
  };
};

const { ModifyLabels, ModifyAnnotations, Edit } = Kebab.factory;
export const menuActions = [MarkAsSchedulable, MarkAsUnschedulable, ModifyLabels, ModifyAnnotations, Edit, Delete];

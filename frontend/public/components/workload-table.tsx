import * as React from 'react';
import { K8sResourceKind } from '../module/k8s';
import { TableProps } from './hypercloud/utils/default-list-component';
import { PodStatus } from './hypercloud/utils/pod-status';
import { Kebab, KebabAction, LabelList, ResourceKebab, ResourceLink, Selector } from './utils';

export const WorkloadTableProps = (customData: WorkloadTableCustomData): TableProps => {
  return {
    header: [
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
        sortField: 'metadata.name',
      },
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
        sortField: 'metadata.namespace',
      },
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
        sortFunc: 'numReplicas',
      },
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
        sortField: 'metadata.labels',
      },
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_16',
        sortField: 'spec.selector',
      },
      {
        title: '',
        transforms: null,
        props: { className: Kebab.columnClass },
      },
    ],
    row: (obj: K8sResourceKind) => {
      const { kind, menuActions } = customData;
      return [
        {
          children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
        },
        {
          className: 'co-break-word',
          children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
        },
        {
          children: <PodStatus resource={obj} kind={kind} desired={obj.spec.replicas} ready={obj.status.replicas} />,
        },
        {
          children: <LabelList kind={kind} labels={obj.metadata.labels} />,
        },
        {
          children: <Selector selector={obj.spec.selector} namespace={obj.metadata.namespace} />,
        },
        {
          className: Kebab.columnClass,
          children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
        },
      ];
    },
  };
};

type WorkloadTableCustomData = {
  kind: string;
  menuActions: KebabAction[];
};

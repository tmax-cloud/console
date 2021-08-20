import * as React from 'react';
import { Link } from 'react-router-dom';
import { K8sResourceKind } from '../module/k8s';
import { Kebab, KebabAction, LabelList, ResourceKebab, ResourceLink, resourcePath, Selector, TableProps } from './utils';

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
          children: (
            <Link to={`${resourcePath(kind, obj.metadata.name, obj.metadata.namespace)}/pods`} title="pods">
              {obj.status.replicas || 0} of {obj.spec.replicas} pods
            </Link>
          ),
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

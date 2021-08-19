import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Table, TableRow, TableData, RowFunctionArgs } from '../factory';
import { sortable } from '@patternfly/react-table';
import { K8sResourceKind } from '../../module/k8s';
import { TFunction } from 'i18next';

const generateTableClassName = (index: number): string => {
  switch (index) {
    case 0:
    case 1:
      return '';
    case 2:
      return classNames('pf-m-hidden', 'pf-m-visible-on-sm');
    case 3:
      return classNames('pf-m-hidden', 'pf-m-visible-on-lg');
    default:
      return classNames('pf-m-hidden', 'pf-m-visible-on-xl');
  }
};

const makeTableHeader = (header: Header[], t: TFunction) => {
  const _header: Header[] = header.map((value, index) => ({
    ...value,
    title: t(value.title),
    transforms: _.isUndefined(value.transforms) ? [sortable] : value.transforms,
    props: value.props || { className: generateTableClassName(index) },
  }));
  return () => {
    return _header;
  };
};

const makeTableRow = (row: Rows) => {
  const Component = (props: RowFunctionArgs) => {
    const { obj, index, key, style } = props;
    const _row = row(obj);
    return (
      <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
        {_row.map((value, index) => {
          const className = value.className || generateTableClassName(index);
          return (
            <TableData key={`${obj.metadata.uid}-${index}`} className={className}>
              {value.children}
            </TableData>
          );
        })}
      </TableRow>
    );
  };
  return Component;
};

export const DefaultListComponent: React.FC<DefaultListComponentProps> = props => {
  const { header, row } = props.tableProps;
  const { t } = useTranslation();
  const headerFunc = makeTableHeader(header, t);
  const rowFunc = makeTableRow(row);
  return <Table {...props} aria-label="Resource List" Header={headerFunc} Row={rowFunc} virtualize />;
};

type Header = {
  title: string;
  sortField?: string;
  sortFunc?: string;
  transforms?: any;
  props?: { className: string };
};

type Row = {
  className?: string;
  children: React.ReactNode;
};

type Rows = (resource: K8sResourceKind) => Row[];

export type TableProps = {
  header: Header[];
  row: Rows;
};

export type DefaultListComponentProps = {
  tableProps: TableProps;
};

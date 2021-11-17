import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { Conditions } from './conditions';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import { referenceFor, kindForReference, modelFor } from '../module/k8s';
import { Kebab, kindObj, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from './utils';
import { ResourceLabel } from '../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';

const { common } = Kebab.factory;

const tableColumnClasses = [classNames('col-xs-6', 'col-sm-4'), classNames('col-xs-6', 'col-sm-4'), classNames('col-sm-4', 'hidden-xs'), Kebab.columnClass];

const TableHeader = t => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};

TableHeader.displayName = 'TableHeader';

const TableRowForKind = ({ obj, index, key, style, customData }) => {
  const kind = referenceFor(obj) || customData.kind;
  const menuActions = [...Kebab.getExtensionsActionsForKind(kindObj(kind)), ...common];

  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={customData.kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</TableData>
      <TableData className={tableColumnClasses[2]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

export const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    const ko = kindObj(kind);
    const label = ResourceLabel(ko, t);
    return (
      <>
        <div className="co-m-pane__body">
          {/* <SectionHeading text={`${kindForReference(kind)} Details`} /> */}
          <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: label })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
        {_.isArray(obj?.status?.conditions) && (
          <div className="co-m-pane__body">
            <SectionHeading text="Conditions" />
            <Conditions conditions={obj.status.conditions} />
          </div>
        )}
      </>
    );
  };

export const DefaultList = props => {
  const { kinds } = props;
  const { t } = useTranslation();
  return <Table {...props} aria-label="Default Resource" kinds={[kinds[0]]} customData={{ kind: kinds[0] }} Header={TableHeader.bind(null, t)} Row={TableRowForKind} virtualize />;
};
DefaultList.displayName = 'DefaultList';

export const DefaultPage = props => {
  const exceptionKindList = ['ClusterRole'];  
  const canCreate = exceptionKindList.includes(props.kind) ? false : props.canCreate || _.get(modelFor(props.kind), 'crd') !== 'false';
  return <ListPage {...props} ListComponent={DefaultList} canCreate={canCreate} />;
};
DefaultPage.displayName = 'DefaultPage';

export const DefaultDetailsPage = props => {
  const pages = [navFactory.details(DetailsForKind(props.kind)), navFactory.editResource()];
  const menuActions = [...Kebab.getExtensionsActionsForKind(kindObj(props.kind)), ...common];

  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};
DefaultDetailsPage.displayName = 'DefaultDetailsPage';

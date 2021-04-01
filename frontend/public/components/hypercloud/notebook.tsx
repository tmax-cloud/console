import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { NotebookModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(NotebookModel), ...Kebab.factory.common, Kebab.factory.Connect];

const kind = NotebookModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), Kebab.columnClass];

const NotebookTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_38'),
      sortField: 'spec.template.spec.containers[0].image',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};
NotebookTableHeader.displayName = 'NotebookTableHeader';

const NotebookTableRow: RowFunction<K8sResourceKind> = ({ obj: notebook, index, key, style }) => {
  return (
    <TableRow id={notebook.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={notebook.metadata.name} namespace={notebook.metadata.namespace} title={notebook.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={notebook.metadata.namespace} title={notebook.metadata.namespace} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>
        {notebook.spec.template.spec.containers[0].image}
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={notebook} />
      </TableData>
    </TableRow>
  );
};

export const NotebookDetailsList: React.FC<NotebookDetailsListProps> = ({ notebook }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')} obj={notebook} path="status.status" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_5')} obj={notebook} path="spec.template.spec.containers[0].image" />
    </dl>
  );
}

const NotebookDetails: React.FC<NotebookDetailsProps> = ({ obj: notebook }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(notebook, t) })}/>
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={notebook} />
          </div>
          <div className="col-lg-6">
            <NotebookDetailsList notebook={notebook} />
          </div>
        </div>
      </div>
    </>
  );
}

const { details, editYaml } = navFactory;
export const Notebooks: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Notebooks" Header={NotebookTableHeader.bind(null, t)} Row={NotebookTableRow} virtualize />;
}

export const NotebooksPage: React.FC<NotebooksPageProps> = props => <ListPage canCreate={true} ListComponent={Notebooks} kind={kind} {...props} />;

export const NotebooksDetailsPage: React.FC<NotebooksDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(NotebookDetails)), editYaml()]} />;

type NotebookDetailsListProps = {
  notebook: K8sResourceKind;
};

type NotebookDetailsProps = {
  obj: K8sResourceKind;
};

type NotebooksPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type NotebooksDetailsPageProps = {
  match: any;
};

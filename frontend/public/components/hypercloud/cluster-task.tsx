import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { ClusterTaskModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ClusterTaskModel), ...Kebab.factory.common];

const kind = ClusterTaskModel.kind;

const tableColumnClasses = [classNames('col-xs-6', 'col-sm-6'), classNames('col-xs-6', 'col-sm-6'), Kebab.columnClass];

const ClusterTaskTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[2] },
    },
  ];
};

ClusterTaskTableHeader.displayName = 'ClusterTaskTableHeader';

const ClusterTaskTableRow: RowFunction<K8sResourceKind> = ({ obj: clusterTask, index, key, style }) => {
  return (
    <TableRow id={clusterTask.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={clusterTask.metadata.name} namespace={clusterTask.metadata.namespace} title={clusterTask.metadata.uid} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>
        <Timestamp timestamp={clusterTask.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={clusterTask} />
      </TableData>
    </TableRow>
  );
};

const ClusterTaskDetails: React.FC<ClusterTaskDetailsProps> = ({ obj: clusterTask }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clusterTask, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={clusterTask} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const ClusterTasks: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="ClusterTasks" Header={ClusterTaskTableHeader.bind(null, t)} Row={ClusterTaskTableRow} virtualize />;
};

export const ClusterTasksPage: React.FC<ClusterTasksPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage title={t('COMMON:MSG_LNB_MENU_94')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_94') })} canCreate={true} ListComponent={ClusterTasks} kind={kind} {...props} />;
};

export const ClusterTasksDetailsPage: React.FC<ClusterTasksDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(ClusterTaskDetails)), editResource()]} />;

type ClusterTasksPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ClusterTaskDetailsProps = {
  obj: K8sResourceKind;
};

type ClusterTasksDetailsPageProps = {
  match: any;
};

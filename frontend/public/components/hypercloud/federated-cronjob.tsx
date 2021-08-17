import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceIcon, ResourceSummary, SectionHeading } from '../utils';
import { Status } from '@console/shared';
import { FederatedCronJobModel } from '../../models';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(FederatedCronJobModel), ...Kebab.factory.common];

const kind = FederatedCronJobModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const FederatedCronJobTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'cronjobPhase',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_15'),
      sortField: 'metadata.labels',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Annotations',
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};
FederatedCronJobTableHeader.displayName = 'FederatedCronJobTableHeader';

const FederatedCronJobTableRow: RowFunction<K8sResourceKind> = ({ obj: cronjob, index, key, style }) => {
  return (
    <TableRow id={cronjob.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={cronjob.metadata.name} namespace={cronjob.metadata.namespace} title={cronjob.metadata.uid} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Status status={cronjob.status?.phase} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <LabelList kind={kind} labels={cronjob.metadata.labels} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>{_.size(cronjob.metadata.annotations)} comments</TableData>
      <TableData className={tableColumnClasses[4]}>
        <Timestamp timestamp={cronjob.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={cronjob} />
      </TableData>
    </TableRow>
  );
};

export const ClusterRow: React.FC<ClusterRowProps> = ({ cronjob }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ResourceIcon kind={kind} />
        {cronjob.metadata.name}
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">
        <ResourceLink kind="Cluster" name={cronjob.spec.placement.clusters[0].name} />
      </div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">
        <Status status={cronjob.status.phase} />
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Timestamp timestamp={cronjob.metadata.creationTimestamp} />
      </div>
    </div>
  );
};

export const CronJobDistributionTable: React.FC<CronJobDistributionTableProps> = ({ heading, cronjob }) => {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeading text={heading} />
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">{t('COMMON:MSG_DETAILS_TABOVERVIEW_TABLEHEADER_1')}</div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{t('COMMON:MSG_DETAILS_TABOVERVIEW_TABLEHEADER_2')}</div>
          <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">Result</div>
          <div className="col-lg-1 col-md-2 hidden-sm hidden-xs">{t('COMMON:MSG_DETAILS_TABOVERVIEW_TABLEHEADER_3')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {/*containers.map((c: any, i: number) => (
          <ClusterRow key={i} cronjob={cronjob} container={c} />
        ))*/}
          <ClusterRow cronjob={cronjob} />
        </div>
      </div>
    </>
  );
};

const FederatedCronJobDetails: React.FC<FederatedCronJobDetailsProps> = ({ obj: cronjob }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={`${t('COMMON:MSG_MAIN_DIV1_3', { 0: t('COMMON:MSG_LNB_MENU_28') })} ${t('COMMON:MSG_DETAILS_TABOVERVIEW_1')}`} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={cronjob} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <CronJobDistributionTable key="distributionTable" heading="Distribution" cronjob={cronjob} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const FederatedCronJobs: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Federated Cron Jobs" Header={FederatedCronJobTableHeader.bind(null, t)} Row={FederatedCronJobTableRow} virtualize />;
};
export const FederatedCronJobsPage: React.FC<FederatedCronJobsPageProps> = props => <ListPage canCreate={true} ListComponent={FederatedCronJobs} kind={kind} {...props} />;

export const FederatedCronJobsDetailsPage: React.FC<FederatedCronJobsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedCronJobDetails)), editResource()]} />;

type ClusterRowProps = {
  cronjob: K8sResourceKind;
};

type CronJobDistributionTableProps = {
  cronjob: K8sResourceKind;
  heading: string;
};

type FederatedCronJobDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedCronJobsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedCronJobsDetailsPageProps = {
  match: any;
};

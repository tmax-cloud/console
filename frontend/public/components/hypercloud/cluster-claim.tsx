import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceIcon, ResourceSummary, SectionHeading, DetailsItem } from '../utils';
import { Status } from '@console/shared';
import { ClusterClaimModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ClusterClaimStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';

export const clusterClaimCommonActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ClusterClaimModel), ...Kebab.factory.common];

const kind = ClusterClaimModel.kind;

const tableColumnClasses = ['', '', '', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const unmodifiableStatus = new Set(['Approved', 'ClusterClaim Deleted', 'ClusterDeleted', 'Cluster Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);

const ClusterClaimTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_LNB_MENU_84'),
      sortFunc: 'spec.clusterName',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_59'),
      sortFunc: 'spec.provider',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_62'),
      sortFunc: 'spec.version',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_11'),
      sortField: 'metadata.annotations.creator',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[6] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[7] },
    },
  ];
};
ClusterClaimTableHeader.displayName = 'ClusterClaimTableHeader';

const ClusterClaimTableRow: RowFunction<K8sResourceKind> = ({ obj: clusterClaim, index, key, style }) => {
  const menuActions = isUnmodifiable(clusterClaim.status?.phase) ? clusterClaimCommonActions : [...clusterClaimCommonActions, Kebab.factory.ModifyClaim];
  return (
    <TableRow id={clusterClaim.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={clusterClaim.metadata.name} namespace={clusterClaim.metadata.namespace} title={clusterClaim.metadata.uid} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>{clusterClaim.spec.clusterName}</TableData>
      <TableData className={tableColumnClasses[2]}>{clusterClaim.spec.provider}</TableData>
      <TableData className={tableColumnClasses[3]}>{clusterClaim.spec.version}</TableData>
      <TableData className={classNames(tableColumnClasses[4], 'co-break-word')}>
        <Status status={ClusterClaimStatusReducer(clusterClaim)} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>{clusterClaim.metadata.annotations.creator}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <Timestamp timestamp={clusterClaim.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[7]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={clusterClaim} />
      </TableData>
    </TableRow>
  );
};

export const ClusterRow: React.FC<ClusterRowProps> = ({ pod }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ResourceIcon kind={kind} />
        {pod.metadata.name}
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">
        <ResourceLink kind="Cluster" name={pod.spec.placement.clusters[0].name} />
      </div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">
        <Status status={pod.status.phase} />
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Timestamp timestamp={pod.metadata.creationTimestamp} />
      </div>
    </div>
  );
};

export const ClusterClaimDetailsList: React.FC<ClusterClaimDetailsListProps> = ({ clcl, t }) => {
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_1')} obj={clcl} path="spec.provider" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_64')} obj={clcl} path="spec.clusterName" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_55')} obj={clcl} path="spec.version" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_56')} obj={clcl} path="spec.region" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_62')} obj={clcl} path="spec.masterNum" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_59')} obj={clcl} path="spec.masterType" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_63')} obj={clcl} path="spec.workerNum" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_60')} obj={clcl} path="spec.workerType" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_61')} obj={clcl} path="spec.sshKey" />
    </dl>
  );
};

const ClusterClaimDetails: React.FC<ClusterClaimDetailsProps> = ({ obj: clusterClaim }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clusterClaim, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={clusterClaim} showOwner={false} />
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')} obj={clusterClaim} path="metadata.annotations.creator" />
          </div>
          <div className="col-lg-6">
            <ClusterClaimDetailsList clcl={clusterClaim} t={t} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const ClusterClaims: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Cluster Claims" Header={ClusterClaimTableHeader.bind(null, t)} Row={ClusterClaimTableRow} virtualize />;
};

const filters = [
  {
    filterGroupName: 'Status',
    type: 'registry-status',
    reducer: ClusterClaimStatusReducer,
    items: [
      { id: 'Created', title: 'Created' },
      { id: 'Waiting', title: 'Waiting' },
      { id: 'Admitted', title: 'Admitted' },
      { id: 'Success', title: 'Success' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Error', title: 'Error' },
      { id: 'Deleted', title: 'Deleted' },
    ],
  },
];

export const ClusterClaimsPage: React.FC<ClusterClaimsPageProps> = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: 'clustermanagers',
      name: t('COMMON:MSG_LNB_MENU_84'),
    },
    {
      href: 'clusterclaims',
      name: t('COMMON:MSG_LNB_MENU_105'),
    },
    {
      href: 'clusterregistrations',
      name: t('COMMON:MSG_MAIN_TAB_3'),
    },
  ];
  return <ListPage canCreate={true} multiNavPages={pages} ListComponent={ClusterClaims} kind={kind} rowFilters={filters} {...props} />;
};
export const ClusterClaimsDetailsPage: React.FC<ClusterClaimsDetailsPageProps> = props => {
  const [status, setStatus] = React.useState();
  const menuActions = isUnmodifiable(status) ? clusterClaimCommonActions : [...clusterClaimCommonActions, Kebab.factory.ModifyClaim];
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} setCustomState={setStatus} customStatePath="status.phase" pages={[details(detailsPage(ClusterClaimDetails)), editResource()]} />;
};

type ClusterRowProps = {
  pod: K8sResourceKind;
};

type ClusterClaimDetailsListProps = {
  clcl: K8sResourceKind;
  t: TFunction;
};

type ClusterClaimDetailsProps = {
  obj: K8sResourceKind;
};

type ClusterClaimsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ClusterClaimsDetailsPageProps = {
  match: any;
};

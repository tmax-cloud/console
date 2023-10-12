import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, DetailsItem } from '../utils';
import { ClusterManagerModel, ClusterUpdateClaimModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ClusterUpdateClaimStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { TableProps } from './utils/default-list-component';
import { ErrorPopoverStatus } from './utils/error-popover-status';

export const clusterUpdateClaimCommonActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ClusterUpdateClaimModel), ...Kebab.factory.common];

const kind = ClusterUpdateClaimModel.kind;

const unmodifiableStatus = new Set(['Approved', 'ClusterUpdateClaim Deleted', 'ClusterDeleted', 'Cluster Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);

const nodeStatus = (master: number, worker: number) => {
  const sum = master + worker;
  return <div>{`${sum} (M: ${master}  W: ${worker})`}</div>;
};

const tableProps: TableProps = {
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
      sortField: 'status.phase',
    },
    {
      title: 'COMMON:MSG_LNB_MENU_84',
      sortFunc: 'spec.clusterName',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_160',
      sortFunc: 'spec.updateWorkerNum',
    },
    {
      title: 'MSG_MAIN_TABLEHEADER_161',
      sortFunc: 'spec.updateWorkerNum',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (clusterUpdateClaim: K8sResourceKind) => {
    const menuActions = isUnmodifiable(clusterUpdateClaim.status?.phase) ? clusterUpdateClaimCommonActions : [...clusterUpdateClaimCommonActions, Kebab.factory.ModifyClaim];
    return [
      {
        children: <ResourceLink kind={kind} name={clusterUpdateClaim.metadata.name} namespace={clusterUpdateClaim.metadata.namespace} title={clusterUpdateClaim.metadata.uid} />,
      },
      {
        className: 'co-break-word',
        children: <ResourceLink kind="Namespace" name={clusterUpdateClaim.metadata.namespace} title={clusterUpdateClaim.metadata.namespace} />,
      },
      {
        className: classNames('pf-m-hidden', 'pf-m-visible-on-xl', 'co-break-word'),
        children: <ErrorPopoverStatus error={clusterUpdateClaim?.status?.phase === 'Error'} status={ClusterUpdateClaimStatusReducer(clusterUpdateClaim)} reason={clusterUpdateClaim.status?.reason} />,
      },
      {
        children: <ResourceLink kind={ClusterManagerModel.kind} name={clusterUpdateClaim.spec.clusterName} namespace={clusterUpdateClaim.metadata.namespace} />,
      },
      {
        children: nodeStatus(clusterUpdateClaim.status.currentMasterNum, clusterUpdateClaim.status.currentWorkerNum),
      },
      {
        children: nodeStatus(clusterUpdateClaim.spec.updatedMasterNum, clusterUpdateClaim.spec.updatedWorkerNum),
      },
      {
        children: <Timestamp timestamp={clusterUpdateClaim.metadata.creationTimestamp} />,
      },
      {
        className: Kebab.columnClass,
        children: <ResourceKebab actions={menuActions} kind={kind} resource={clusterUpdateClaim} />,
      },
    ];
  },
};

const ClusterUpdateClaimDetailsList: React.FC<ClusterUpdateClaimDetailsListProps> = ({ cuc, t }) => {
  return (
    <div className="col-lg-6">
      <dl className="co-m-pane__details">
        <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_61')} obj={cuc}>
          <ErrorPopoverStatus error={cuc?.status?.phase === 'Error'} status={ClusterUpdateClaimStatusReducer(cuc)} reason={cuc.status?.reason} />
        </DetailsItem>
        <DetailsItem label={t('COMMON:MSG_LNB_MENU_84')} obj={cuc}>
          <ResourceLink kind={ClusterManagerModel.kind} name={cuc.spec.clusterName} namespace={cuc.metadata.namespace} />
        </DetailsItem>
        <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_160')} obj={cuc}>
          {nodeStatus(cuc.status.currentMasterNum, cuc.status.currentWorkerNum)}
        </DetailsItem>
        <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_161')} obj={cuc}>
          {nodeStatus(cuc.spec.updatedMasterNum, cuc.spec.updatedWorkerNum)}
        </DetailsItem>
        {cuc?.status?.phase === 'Rejected' && <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_20')} obj={cuc} path="status.reason" />}
      </dl>
    </div>
  );
};

const ClusterUpdateClaimDetails: React.FC<ClusterUpdateClaimDetailsProps> = ({ obj: clusterUpdateClaim }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clusterUpdateClaim, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={clusterUpdateClaim} showOwner={false} />
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')} obj={clusterUpdateClaim} path="metadata.annotations.creator" />
          </div>
          <div className="col-lg-6">
            <ClusterUpdateClaimDetailsList cuc={clusterUpdateClaim} t={t} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

const filters = [
  {
    filterGroupName: 'Status',
    type: 'registry-status',
    reducer: ClusterUpdateClaimStatusReducer,
    items: [
      { id: 'Approved', title: 'Approved' },
      { id: 'Awaiting', title: 'Awaiting' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Error', title: 'Error' },
    ],
  },
];

export const ClusterUpdateClaimsPage: React.FC = props => {
  const pages = [
    {
      href: 'clustermanagers',
      name: 'COMMON:MSG_LNB_MENU_84',
    },
    {
      href: 'clusterclaims',
      name: 'COMMON:MSG_LNB_MENU_105',
    },
    {
      href: 'clusterregistrations',
      name: 'COMMON:MSG_MAIN_TAB_3',
    },

  ];
  return <ListPage canCreate={true} multiNavPages={pages} tableProps={tableProps} kind={kind} rowFilters={filters} {...props} />;
};
export const ClusterUpdateClaimsDetailsPage: React.FC<ClusterUpdateClaimsDetailsPageProps> = props => {
  const [status, setStatus] = React.useState();
  const menuActions = isUnmodifiable(status) ? clusterUpdateClaimCommonActions : [...clusterUpdateClaimCommonActions, Kebab.factory.ModifyClaim];
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} setCustomState={setStatus} customStatePath="status.phase" pages={[details(detailsPage(ClusterUpdateClaimDetails)), editResource()]} />;
};

type ClusterUpdateClaimDetailsListProps = {
  cuc: K8sResourceKind;
  t: TFunction;
};

type ClusterUpdateClaimDetailsProps = {
  obj: K8sResourceKind;
};

type ClusterUpdateClaimsDetailsPageProps = {
  match: any;
};

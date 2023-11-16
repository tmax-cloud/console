import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceIcon, ResourceSummary, SectionHeading, DetailsItem } from '../utils';
import { Status } from '@console/shared';
import { ClusterClaimModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ClusterClaimStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { TableProps } from './utils/default-list-component';
import { ErrorPopoverStatus } from './utils/error-popover-status';

export const clusterClaimCommonActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ClusterClaimModel), ...Kebab.factory.common];

const kind = ClusterClaimModel.kind;

const unmodifiableStatus = new Set(['Approved', 'ClusterClaim Deleted', 'ClusterDeleted', 'Cluster Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);

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
      title: 'COMMON:MSG_LNB_MENU_84',
      sortFunc: 'spec.clusterName',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_59',
      sortFunc: 'spec.provider',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortField: 'status.phase',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_62',
      sortFunc: 'spec.version',
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
  row: (clusterClaim: K8sResourceKind) => {
    const menuActions = isUnmodifiable(clusterClaim.status?.phase) ? clusterClaimCommonActions : [...clusterClaimCommonActions, Kebab.factory.ModifyClaim];
    return [
      {
        children: <ResourceLink kind={kind} name={clusterClaim.metadata.name} namespace={clusterClaim.metadata.namespace} title={clusterClaim.metadata.uid} />,
      },
      {
        className: 'co-break-word',
        children: <ResourceLink kind="Namespace" name={clusterClaim.metadata.namespace} title={clusterClaim.metadata.namespace} />,
      },
      {
        children: clusterClaim.spec.clusterName,
      },
      {
        children: clusterClaim.spec.provider,
      },
      {
        className: classNames('pf-m-hidden', 'pf-m-visible-on-xl', 'co-break-word'),
        children: <ErrorPopoverStatus error={clusterClaim?.status?.phase === 'Error'} status={ClusterClaimStatusReducer(clusterClaim)} reason={clusterClaim.status?.reason} />,
      },
      {
        children: clusterClaim.spec.version,
      },
      {
        children: <Timestamp timestamp={clusterClaim.metadata.creationTimestamp} />,
      },
      {
        className: Kebab.columnClass,
        children: <ResourceKebab actions={menuActions} kind={kind} resource={clusterClaim} />,
      },
    ];
  },
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

const Provider = {
  AWS: 'AWS',
  VSPHERE: 'vSphere',
};

// 프로바이더가 AWS인 경우
const AwsClusterClaimDetailsList: React.FC<ClusterClaimDetailsListProps> = ({ clcl, t }) => {
  return (
    <div className="col-lg-6">
      <dl className="co-m-pane__details">
        <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_61')} obj={clcl}>
          <ErrorPopoverStatus error={clcl?.status?.phase === 'Error'} status={ClusterClaimStatusReducer(clcl)} reason={clcl.status?.reason} />
        </DetailsItem>
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_1')} obj={clcl} path="spec.provider" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_64')} obj={clcl} path="spec.clusterName" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_55')} obj={clcl} path="spec.version" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_56')} obj={clcl} path="spec.providerAwsSpec.region" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_62')} obj={clcl} path="spec.masterNum" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_59')} obj={clcl} path="spec.providerAwsSpec.masterType" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_63')} obj={clcl} path="spec.workerNum" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_60')} obj={clcl} path="spec.providerAwsSpec.workerType" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_61')} obj={clcl} path="spec.providerAwsSpec.sshKey" />
      </dl>
    </div>
  );
};

// 프로바이더가 vphere인 경우
const VSphereClusterClaimDetailsList: React.FC<ClusterClaimDetailsListProps> = ({ clcl, t }) => {
  return (
    <>
      <div className="col-lg-4">
        <dl className="co-m-pane__details">
          <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_61')} obj={clcl}>
            <ErrorPopoverStatus error={clcl?.status?.phase === 'Error'} status={ClusterClaimStatusReducer(clcl)} reason={clcl.status?.reason} />
          </DetailsItem>
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_1')} obj={clcl} path="spec.provider" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_2')} obj={clcl} path="spec.clusterName" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_15')} obj={clcl} path="spec.masterNum" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_16')} obj={clcl} path="spec.workerNum" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_3')} obj={clcl} path="spec.providerVsphereSpec.vcenterKcpIp" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_4')} obj={clcl} path="spec.providerVsphereSpec.podCidr" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_5')} obj={clcl} path="spec.providerVsphereSpec.vcenterIp" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_6')} obj={clcl} path="spec.providerVsphereSpec.vcenterDataCenter" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_7')} obj={clcl} path="spec.providerVsphereSpec.vcenterDataStore" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_8')} obj={clcl} path="spec.providerVsphereSpec.vcenterResourcePool" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_9')} obj={clcl} path="spec.providerVsphereSpec.vcenterNetwork" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_10')} obj={clcl} path="spec.providerVsphereSpec.vcenterFolder" />
        </dl>
      </div>
      <div className="col-lg-4">
        <dl className="co-m-pane__details">
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_11')} obj={clcl} path="spec.providerVsphereSpec.vcenterCpuNum" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_12')} obj={clcl} path="spec.providerVsphereSpec.vcenterMemSize" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_13')} obj={clcl} path="spec.providerVsphereSpec.vcenterDiskSize" />
          <DetailsItem label={t('MULTI:MSG_MULTI_CLUSTERS_CLUSTERCLAIMDETAILS_TABDETAILS_14')} obj={clcl} path="spec.providerVsphereSpec.vcenterTemplate" />
        </dl>
      </div>
    </>
  );
};

const ClusterClaimDetails: React.FC<ClusterClaimDetailsProps> = ({ obj: clusterClaim }) => {
  const { t } = useTranslation();
  const provider = _.get(clusterClaim, 'spec.provider', '-');

  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clusterClaim, t) })} />
        <div className="row">
          <div className={provider === Provider.VSPHERE ? 'col-lg-4' : 'col-lg-6'}>
            <ResourceSummary resource={clusterClaim} showOwner={false} />
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')} obj={clusterClaim} path="metadata.annotations.creator" />
          </div>
          {provider === Provider.VSPHERE ? <VSphereClusterClaimDetailsList clcl={clusterClaim} t={t} /> : <AwsClusterClaimDetailsList clcl={clusterClaim} t={t} />}
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
    reducer: ClusterClaimStatusReducer,
    items: [
      { id: 'Approved', title: 'Approved' },
      { id: 'Awaiting', title: 'Awaiting' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Error', title: 'Error' },
      { id: 'Cluster Deleted', title: 'Cluster Deleted' },
    ],
  },
];

export const ClusterClaimsPage: React.FC = props => {
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

type ClusterClaimsDetailsPageProps = {
  match: any;
};

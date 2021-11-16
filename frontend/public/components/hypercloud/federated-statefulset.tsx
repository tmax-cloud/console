import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceIcon, ResourceSummary, SectionHeading } from '../utils';
import { Status } from '@console/shared';
import { FederatedStatefulSetModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(FederatedStatefulSetModel), ...Kebab.factory.common];

const kind = FederatedStatefulSetModel.kind;
const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
      sortField: 'metadata.labels',
    },
    {
      title: 'COMMON:MSG_DETAILS_TABDETAILS_DETAILS_12',
      sortField: '',
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
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    {
      children: `${_.size(obj.metadata.annotations)} comments`,
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const ClusterRow: React.FC<ClusterRowProps> = ({ statefulset }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ResourceIcon kind={kind} />
        {statefulset.metadata.name}
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">
        <ResourceLink kind="Cluster" name={statefulset.spec?.placement?.clusters?.[0]?.name} />
      </div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">
        <Status status={statefulset.status.phase} />
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Timestamp timestamp={statefulset.metadata.creationTimestamp} />
      </div>
    </div>
  );
};

export const StatefulSetDistributionTable: React.FC<StatefulSetDistributionTableProps> = ({ heading, statefulset }) => {
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
          <ClusterRow statefulset={statefulset} />
        </div>
      </div>
    </>
  );
};

const FederatedStatefulSetDetails: React.FC<FederatedStatefulSetDetailsProps> = ({ obj: statefulset }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(statefulset, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={statefulset} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <StatefulSetDistributionTable key="distributionTable" heading="Distribution" statefulset={statefulset} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const FederatedStatefulSetsPage: React.FC<FederatedStatefulSetsPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedStatefulSetsDetailsPage: React.FC<FederatedStatefulSetsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedStatefulSetDetails)), editResource()]} />;

type ClusterRowProps = {
  statefulset: K8sResourceKind;
};

type StatefulSetDistributionTableProps = {
  statefulset: K8sResourceKind;
  heading: string;
};

type FederatedStatefulSetDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedStatefulSetsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedStatefulSetsDetailsPageProps = {
  match: any;
};

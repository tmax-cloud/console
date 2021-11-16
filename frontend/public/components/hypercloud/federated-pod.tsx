import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { K8sResourceKind, PodKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceIcon, ResourceSummary, SectionHeading } from '../utils';
import { Status } from '@console/shared';
import { FederatedPodModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { podPhase } from '@console/internal/module/k8s/pods';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(FederatedPodModel), ...Kebab.factory.common];

const kind = FederatedPodModel.kind;

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortFunc: 'podPhase',
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
      children: <Status status={podPhase(obj as PodKind)} />,
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

export const ClusterRow: React.FC<ClusterRowProps> = ({ pod }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ResourceIcon kind={kind} />
        {pod.metadata.name}
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">
        <ResourceLink kind="Cluster" name={pod.spec?.placement?.clusters?.[0]?.name} />
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

export const PodDistributionTable: React.FC<PodDistributionTableProps> = ({ heading, pod }) => {
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
          <ClusterRow pod={pod} />
        </div>
      </div>
    </>
  );
};

const FederatedPodDetails: React.FC<FederatedPodDetailsProps> = ({ obj: pod }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(pod, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={pod} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <PodDistributionTable key="distributionTable" heading="Distribution" pod={pod} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const FederatedPodsPage: React.FC<FederatedPodsPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedPodsDetailsPage: React.FC<FederatedPodsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedPodDetails)), editResource()]} />;

type ClusterRowProps = {
  pod: K8sResourceKind;
};

type PodDistributionTableProps = {
  pod: K8sResourceKind;
  heading: string;
};

type FederatedPodDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedPodsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedPodsDetailsPageProps = {
  match: any;
};

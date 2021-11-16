import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceIcon, ResourceSummary, SectionHeading, Selector } from '../utils';
import { Status } from '@console/shared';
import { FederatedHPAModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(FederatedHPAModel), ...Kebab.factory.common];

const kind = FederatedHPAModel.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
      sortField: 'metadata.labels',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_16',
      sortField: 'spec.selector',
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
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    {
      children: <Selector selector={obj.spec.selector} namespace={obj.metadata.namespace} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const ClusterRow: React.FC<ClusterRowProps> = ({ horizontalpodautoscaler }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ResourceIcon kind={kind} />
        {horizontalpodautoscaler.metadata.name}
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">
        <ResourceLink kind="Cluster" name={horizontalpodautoscaler.spec?.placement?.clusters?.[0]?.name} />
      </div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">
        <Status status={horizontalpodautoscaler.status.phase} />
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Timestamp timestamp={horizontalpodautoscaler.metadata.creationTimestamp} />
      </div>
    </div>
  );
};

export const HPADistributionTable: React.FC<HPADistributionTableProps> = ({ heading, horizontalpodautoscaler }) => {
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
          <ClusterRow horizontalpodautoscaler={horizontalpodautoscaler} />
        </div>
      </div>
    </>
  );
};

const FederatedHPADetails: React.FC<FederatedHPADetailsProps> = ({ obj: horizontalpodautoscaler }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(horizontalpodautoscaler, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={horizontalpodautoscaler} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <HPADistributionTable key="distributionTable" heading="Distribution" horizontalpodautoscaler={horizontalpodautoscaler} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const FederatedHPAsPage: React.FC<FederatedHPAsPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedHPAsDetailsPage: React.FC<FederatedHPAsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedHPADetails)), editResource()]} />;

type ClusterRowProps = {
  horizontalpodautoscaler: K8sResourceKind;
};

type HPADistributionTableProps = {
  horizontalpodautoscaler: K8sResourceKind;
  heading: string;
};

type FederatedHPADetailsProps = {
  obj: K8sResourceKind;
};

type FederatedHPAsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedHPAsDetailsPageProps = {
  match: any;
};

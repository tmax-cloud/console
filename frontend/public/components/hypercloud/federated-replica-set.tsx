import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { AddHealthChecks, EditHealthChecks } from '@console/app/src/actions/modify-health-checks';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, LabelList, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Selector } from '../utils';
import { ResourceEventStream } from '../events';
import { FederatedReplicaSetModel } from '../../models';
import { TableProps } from './utils/default-list-component';

export const menuActions: KebabAction[] = [AddHealthChecks, Kebab.factory.AddStorage, ...Kebab.getExtensionsActionsForKind(FederatedReplicaSetModel), EditHealthChecks, ...Kebab.factory.common];

const kind = FederatedReplicaSetModel.kind;

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

export const FederatedReplicaSetDetailsList: React.FC<FederatedReplicaSetDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_38')} obj={ds} path="status.currentNumberScheduled" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_39')} obj={ds} path="status.desiredNumberScheduled" />
    </dl>
  );
};

const FederatedReplicaSetDetails: React.FC<FederatedReplicaSetDetailsProps> = ({ obj: replicaset }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={`${t('COMMON:MSG_MAIN_DIV1_3', { 0: t('COMMON:MSG_LNB_MENU_31') })} ${t('COMMON:MSG_DETAILS_TABOVERVIEW_1')}`} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={replicaset} showPodSelector showNodeSelector showTolerations />
          </div>
          <div className="col-lg-6">
            <FederatedReplicaSetDetailsList ds={replicaset} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
      </div>
    </>
  );
};

const { details, editResource, events } = navFactory;

export const FederatedReplicaSetsPage: React.FC<FederatedReplicaSetsPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedReplicaSetsDetailsPage: React.FC<FederatedReplicaSetsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedReplicaSetDetails)), editResource(), events(ResourceEventStream)]} />;

type FederatedReplicaSetDetailsListProps = {
  ds: K8sResourceKind;
};

type FederatedReplicaSetDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedReplicaSetsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedReplicaSetsDetailsPageProps = {
  match: any;
};

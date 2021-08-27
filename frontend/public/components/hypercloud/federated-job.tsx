import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AddHealthChecks, EditHealthChecks } from '@console/app/src/actions/modify-health-checks';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Selector } from '../utils';
import { ResourceEventStream } from '../events';
import { FederatedJobModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [AddHealthChecks, Kebab.factory.AddStorage, ...Kebab.getExtensionsActionsForKind(FederatedJobModel), EditHealthChecks, ...Kebab.factory.common];

const kind = FederatedJobModel.kind;

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

const FederatedJobDetails: React.FC<FederatedJobDetailsProps> = ({ obj: job }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(job, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={job} showPodSelector showNodeSelector />
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

export const FederatedJobsPage: React.FC<FederatedJobsPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedJobsDetailsPage: React.FC<FederatedJobsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedJobDetails)), editResource(), events(ResourceEventStream)]} />;

type FederatedJobDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedJobsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedJobsDetailsPageProps = {
  match: any;
};

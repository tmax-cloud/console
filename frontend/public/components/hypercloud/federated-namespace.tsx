import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { ResourceEventStream } from '../events';
import { FederatedNamespaceModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(FederatedNamespaceModel), ...Kebab.factory.common];

const kind = FederatedNamespaceModel.kind;
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
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const FederatedNamespaceDetails: React.FC<FederatedNamespaceDetailsProps> = ({ obj: namespace }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(namespace, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={namespace} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource, events } = navFactory;
export const FederatedNamespacesPage: React.FC<FederatedNamespacesPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedNamespacesDetailsPage: React.FC<FederatedNamespacesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedNamespaceDetails)), editResource(), events(ResourceEventStream)]} />;

type FederatedNamespaceDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedNamespacesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedNamespacesDetailsPageProps = {
  match: any;
};

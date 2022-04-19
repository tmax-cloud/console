import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaBridgeModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';

const kind = KafkaBridgeModel.kind;

const menuActions: KebabAction[] = [...Kebab.factory.common];

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
        title: 'COMMON:MSG_MAIN_TABLEHEADER_138',
        sortField: 'spec.bootstrapServers',
    },
    {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_139',
        sortField: 'spec.replicas',
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
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
        children: obj.spec.bootstrapServers,
    },
    {
        children: obj.spec.replicas,
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

export const KafkaBridgeDetailsList: React.FC<KafkaBridgeDetailsListProps> = ({ obj: kb }) => {
  const { t } = useTranslation();

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_138')} obj={kb}>
        {kb.spec?.bootstrapServers}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_139')} obj={kb}>
        {kb.spec?.replicas}
      </DetailsItem>
    </dl>
  );
};

const KafkaBridgeDetails: React.FC<KafkaBridgeDetailsProps> = ({ obj: kb }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(kb, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={kb} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <KafkaBridgeDetailsList obj={kb} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const KafkaBridgesPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const KafkaBridgesDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(KafkaBridgeDetails)), editResource()]} />;
};

type KafkaBridgeDetailsListProps = {
  obj: K8sResourceKind;
};

type KafkaBridgeDetailsProps = {
  obj: K8sResourceKind;
};

import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaClusterModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';

const kind = KafkaClusterModel.kind;

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
        title: 'COMMON:MSG_MAIN_TABLEHEADER_134',
        sortField: 'spec.kafka.replicas',
    },
    {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_135',
        sortField: 'spec.kafka.version',
    },
    {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_136',
        sortField: 'spec.zookeeper.replicas',
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
        children: obj.spec.kafka.replicas,
    },
    {
        children: obj.spec.kafka.version,
    },
    {
        children: obj.spec.zookeeper.replicas,
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

export const KafkaClusterDetailsList: React.FC<KafkaClusterDetailsListProps> = ({ obj: kb }) => {
  const { t } = useTranslation();

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_1')} obj={kb}>
        {kb.spec?.kafka?.config && Object.keys(kb.spec?.kafka?.config).map(key => {return <p>{`${key} : ${kb.spec?.kafka?.config[key]}`}</p>})}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_2')} obj={kb}>
        {kb.spec?.kafka?.replicas}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_3')} obj={kb}>
        {kb.spec?.kafka?.storage?.type}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_4')} obj={kb}>
        {kb.spec?.kafka?.storage?.size}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_5')} obj={kb}>
        {kb.spec?.kafka?.version}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_6')} obj={kb}>
        {kb.spec?.zookeeper?.config && Object.keys(kb.spec?.zookeeper?.config).map(key => {return <p>{`${key} : ${kb.spec?.zookeeper?.config[key]}`}</p>})}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_7')} obj={kb}>
        {kb.spec?.zookeeper?.replicas}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_8')} obj={kb}>
        {kb.spec?.zookeeper?.storage?.type}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_9')} obj={kb}>
        {kb.spec?.zookeeper?.storage?.size}
      </DetailsItem>
    </dl>
  );
};

const KafkaClusterDetails: React.FC<KafkaClusterDetailsProps> = ({ obj: kb }) => {
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
            <KafkaClusterDetailsList obj={kb} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const KafkaClustersPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const KafkaClustersDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(KafkaClusterDetails)), editResource()]} />;
};

type KafkaClusterDetailsListProps = {
  obj: K8sResourceKind;
};

type KafkaClusterDetailsProps = {
  obj: K8sResourceKind;
};

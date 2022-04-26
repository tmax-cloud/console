import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaClusterModel } from '../../models';
import { PersistentVolumeClaimModel } from '@console/internal/models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';
import { CodeContainer } from '../utils/hypercloud/code-container';
import { k8sList } from '@console/internal/module/k8s';

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

export const KafkaClusterDetailsList: React.FC<KafkaClusterDetailsListProps> = ({ obj: kc }) => {
  const { t } = useTranslation();
  const [kafkaPVCList, setKafkaPVCList] = React.useState([]);
  const [kafkaPVCListLoading, setKafkaPVCListLoading] = React.useState(false);
  const [zookeeperPVCList, setZookeeper] = React.useState([]);
  const [zookeeperPVCListLoading, setZookeeperPVCListLoading] = React.useState(false);
  const name = kc.metadata?.name;
  const namespace = kc.metadata?.namespace;

  React.useEffect(() => {
    const fetchKafkaPVCList = async () => {
      await k8sList(PersistentVolumeClaimModel, {
        ns: namespace,
        labelSelector: {
          matchLabels: {
            'strimzi.io/name': `${name}-kafka`,
          },
        },
      }).then((res) => {
        setKafkaPVCList(res);
        setKafkaPVCListLoading(true);
      });
    }
    fetchKafkaPVCList();

    const fetchZookeeperPVCList = async () => {
      await k8sList(PersistentVolumeClaimModel, {
        ns: namespace,
        labelSelector: {
          matchLabels: {
            'strimzi.io/name': `${name}-zookeeper`,
          },
        },
      }).then((res) => {
        setZookeeper(res);
        setZookeeperPVCListLoading(true);
      });
    }
    fetchZookeeperPVCList();
  }, []);

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_2')} obj={kc}>
        {kc.spec?.kafka?.replicas}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_3')} obj={kc}>
        {kc.spec?.kafka?.storage?.type === 'ephemeral' ? t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_11') :
          (kafkaPVCListLoading && kafkaPVCList &&
            kafkaPVCList.map((pvc) => { return (<ResourceLink kind={'PersistentVolumeClaim'} name={pvc.metadata.name} namespace={kc.metadata.namespace} />) })
          )
        }
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_5')} obj={kc}>
        {kc.spec?.kafka?.version}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_7')} obj={kc}>
        {kc.spec?.zookeeper?.replicas}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_8')} obj={kc}>
        {kc.spec?.zookeeper?.storage?.type === 'ephemeral' ? t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_11') :
          (zookeeperPVCListLoading && zookeeperPVCList &&
            zookeeperPVCList.map((pvc) => { return (<ResourceLink kind={'PersistentVolumeClaim'} name={pvc.metadata.name} namespace={kc.metadata.namespace} />) })
          )
        }
      </DetailsItem>
    </dl>
  );
};

const KafkaClusterDetails: React.FC<KafkaClusterDetailsProps> = ({ obj: kc }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(kc, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={kc} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <KafkaClusterDetailsList obj={kc} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_10')} />
        <dl>
          <dt>{t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_1')}</dt>
          <dd>
            <CodeContainer label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_1')} value={kc.spec?.kafka?.config} />
          </dd>
          <dt>{t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_6')}</dt>
          <dd>
            <CodeContainer label={t('MULTI:MSG_DEVELOPER_KAFKACLUSTERS_KAFKACLUSTERDETAILS_TABDETAILS_6')} value={kc.spec?.zookeeper?.config} />
          </dd>
        </dl>
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

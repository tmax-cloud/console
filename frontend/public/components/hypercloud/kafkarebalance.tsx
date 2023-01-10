import * as React from 'react';
import { K8sResourceKind, resourceURL } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaClusterModel, KafkaRebalanceModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';
import { k8sList } from '@console/internal/module/k8s';
import { Status } from '@console/shared';
import { CodeContainer } from '../utils/hypercloud/code-container';
import { coFetchJSON } from '@console/internal/co-fetch';
const kind = KafkaRebalanceModel.kind;

//status
const menuActions: KebabAction[] = [...Kebab.factory.common];
const KafkaRebalanceReducer = (kr: any): string => {
  let status = 'No Status';
  if (kr.status) {
    status = kr.status.conditions[0].type;
    if (status === 'Ready') {
      status = 'Succeeded';
    } else if (status === 'NotReady') {
      status = 'Error';
    }
  }
  return status;
};
const KafkaRebalanceStatus = ({ kr }) => <Status status={KafkaRebalanceReducer(kr)} />;

// rebalancing button
export const Rebalancing = (kindObj, kr) => {
  const { t } = useTranslation();
  const { name, namespace } = kr.metadata;
  if (kr.status.conditions[0].type === 'ProposalReady') {
    // annotation에 strimzi.io/rebalance=approve 추가
    return {
      callback: () => {
        const url = `${resourceURL(KafkaRebalanceModel, { ns: namespace })}/${name}`;
        const data = [{ path: '/metadata/annotations', op: 'add', value: { 'strimzi.io/rebalance': 'approve' } }];
        coFetchJSON.patch(url, data);
      },
      label: t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_9'),
    };
  } else if (kr.status.conditions[0].type === 'Rebalancing') {
    // 버튼 비활성화
    return {
      isDisabled: true,
      callback: () => {},
      label: t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_9'),
    };
  }
  //버튼 노출하지 않음: succeeded나 error상태
  return null;
};
const actionButtons = [Rebalancing];

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_137',
      sortField: `metadata.labels['strimzi.io/cluster']`,
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortField: 'status.conditions[0].type',
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
      children: obj.metadata.labels && obj.metadata.labels['strimzi.io/cluster'] ? <ResourceLink kind={KafkaClusterModel.kind} name={obj.metadata.labels['strimzi.io/cluster']} namespace={obj.metadata.namespace} /> : <></>,
    },
    {
      children: <KafkaRebalanceStatus kr={obj} />,
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

export const KafkaRebalanceDetailsList: React.FC<KafkaRebalanceDetailsListProps> = ({ obj: kr }) => {
  const { t } = useTranslation();
  const [config, setConfig] = React.useState(new Map());
  const [loading, setLoading] = React.useState(false);
  const kafkaName = kr.metadata.labels && kr.metadata.labels['strimzi.io/cluster'] ? kr.metadata.labels['strimzi.io/cluster'] : '';
  const namespace = kr.metadata?.namespace;

  React.useEffect(() => {
    const fetchKafkaConfig = async () => {
      await k8sList(KafkaClusterModel, {
        ns: namespace,
        labelSelector: {
          matchLabels: {
            'strimzi.io/cluster': kafkaName,
          },
        },
      }).then(res => {
        const kafka = res[0];
        setConfig(kafka.spec?.cruiseControl?.config);
        setLoading(true);
      });
    };
    fetchKafkaConfig();
  }, [kafkaName, namespace]);

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')} obj={kr}>
        <KafkaRebalanceStatus kr={kr} />
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_1')} obj={kr}>
        {kafkaName !== '' ? <ResourceLink kind={KafkaClusterModel.kind} name={kafkaName} namespace={kr.metadata.namespace} /> : <></>}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_2')} obj={kr}>
        {kr.spec?.concurrentIntraBrokerPartitionMovements}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_3')} obj={kr}>
        {kr.spec?.concurrentLeaderMovements}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_4')} obj={kr}>
        {kr.spec?.concurrentPartitionMovementsPerBroker}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_5')} obj={kr}>
        {kr.spec?.goals?.map(goal => {
          return <p key={`key-${goal}`}>{goal}</p>;
        })}
      </DetailsItem>
      {loading && config && config.get('hard.goals') && (
        <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_6')} obj={kr}>
          {kr.spec?.skipHardGoalCheck ? t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_7') : t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_8')}
        </DetailsItem>
      )}
    </dl>
  );
};

const KafkaRebalanceDetails: React.FC<KafkaRebalanceDetailsProps> = ({ obj: kr }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(kr, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={kr} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <KafkaRebalanceDetailsList obj={kr} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_10')} />
        <CodeContainer label={t('MULTI:MSG_DEVELOPER_KAFKAREBALANCES_KAFKAREBALANCEDETAILS_TABDETAILS_10')} value={kr.status.optimizationResult} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const KafkaRebalancesPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const KafkaRebalancesDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} buttonActions={actionButtons} menuActions={menuActions} pages={[details(detailsPage(KafkaRebalanceDetails)), editResource()]} />;
};

type KafkaRebalanceDetailsListProps = {
  obj: K8sResourceKind;
};

type KafkaRebalanceDetailsProps = {
  obj: K8sResourceKind;
};

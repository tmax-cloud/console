import * as React from 'react';
import { RedisModel } from '../../models';
import { DetailsItem, detailsPage, ExternalLink, Kebab, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { TableProps } from './utils/default-list-component';
import { K8sResourceKind } from 'public/module/k8s';
import { useTranslation } from 'react-i18next';
import { DetailsPage, DetailsPageProps, ListPage } from '../factory';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';


const kind = RedisModel.kind;

export const redisMenuActions = [...Kebab.getExtensionsActionsForKind(RedisModel), ...Kebab.factory.common];

// table
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
    // 컨피그 맵
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_145',
      sortField: 'obj.spec.redisConfig.additionalRedisConfig',
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
      children: obj.spec.redisConfig &&
        <ResourceLink kind="ConfigMap" name={obj.spec.redisConfig.additionalRedisConfig} namespace={obj.metadata.namespace} title={obj.spec.redisConfig.additionalRedisConfig} />
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={redisMenuActions} kind={kind} resource={obj} />,
    },
  ]
}

export const RedisPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const RedisDetailsList: React.FC<RedisDetailsListProps> = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_1')} obj={obj}>
        {(obj.spec.redisConfig) &&
          <ResourceLink kind={'ConfigMap'} name={obj.spec.redisConfig?.additionalRedisConfig} namespace={obj.metadata.namespace} title={obj.spec.redisConfig?.additionalRedisConfig}/>}
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_3')} obj={obj}>
        <ResourceLink kind={'PersistentVolumeClaim'} name={`${obj.metadata.name}-${obj.metadata.name}-0`} namespace={obj.metadata.namespace} title={`${obj.metadata.name}-${obj.metadata.name}-0`} />
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_4')} obj={obj}>
        {obj.spec.kubernetesConfig.image}
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_2')} obj={obj}>
        {(obj.spec.redisExporter?.enabled) ?
          t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_5'):t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_6')}
      </DetailsItem>
      {(obj.spec.redisExporter?.enabled) &&
        <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_7')} obj={obj}>
          <ExternalLink href={'https://Grafana.tmaxcloud.org'} text={'Grafana.tmaxcloud.org'} />
        </DetailsItem>}
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_8')} obj={obj}>
        {(obj.spec.TLS?.secret.secretName) ?
          t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_9') : t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_10')}
      </DetailsItem>
      {(obj.spec.TLS?.secret.secretName) &&
        <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_11')} obj={obj}>
          <ResourceLink kind="Secret" name={obj.spec.TLS.secret.secretName} namespace={obj.metadata.namespace} title={obj.spec.TLS.secret.secretName} />
        </DetailsItem>}
    </dl>
  );
};

const RedisDetails: React.FC<RedisDetailsProps> = ({ obj: sb }) => {
  const { t } = useTranslation();
  return (
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(sb, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={sb} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <RedisDetailsList obj={sb} />
          </div>
        </div>
      </div>
  );
};

const { details, editResource } = navFactory;

export const RedisDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={redisMenuActions} pages={[details(detailsPage(RedisDetails)), editResource()]} />;
};

type RedisDetailsListProps = {
  obj: K8sResourceKind;
};

type RedisDetailsProps = {
  obj: K8sResourceKind;
};

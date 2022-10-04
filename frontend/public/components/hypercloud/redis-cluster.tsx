import * as React from 'react';
import { RedisClusterModel } from '../../models';
import { DetailsItem, detailsPage, ExternalLink, Kebab, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { TableProps } from './utils/default-list-component';
import { K8sResourceKind } from 'public/module/k8s';
import { DetailsPage, DetailsPageProps, ListPage } from '../factory';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Button, Tooltip } from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';

const kind = RedisClusterModel.kind;

export const redisClusterMenuActions = [...Kebab.getExtensionsActionsForKind(RedisClusterModel), ...Kebab.factory.common];

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
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_146',
      sortField: 'spec.clusterSize',
      tooltip: 'COMMON:MSG_MAIN_TABLEHEADER_149',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_147',
      sortField: 'spec.redisLeader.redisConfig.additionalRedisConfig',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_148',
      sortField: 'spec.redisFollower.redisConfig.additionalRedisConfig',
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
      children: obj.spec.clusterSize,
    },
    {
      children: obj.spec.redisLeader.redisConfig?.additionalRedisConfig,
    },
    {
      children: obj.spec.redisFollower.redisConfig?.additionalRedisConfig,
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={redisClusterMenuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const RedisClusterPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const RedisClusterDetailsList: React.FC<RedisClusterDetailsListProps> = ({ obj }) => {
  const { t } = useTranslation();
  const cluster_array = Array.from(Array(obj.spec.clusterSize).keys());
  const leadr_pvc_name = `${obj.metadata.name}-leader-${obj.metadata.name}-leader`;
  const follower_pvc_name = `${obj.metadata.name}-follower-${obj.metadata.name}-follower`;
  return (
    <dl className="co-m-pane__details">
      <table>
        <tr>
          <td style={{ verticalAlign: 'top' }}>
            <DetailsItem label={t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_1')} obj={obj}>
              {obj.spec.clusterSize}
            </DetailsItem>
          </td>
          <td style={{ verticalAlign: 'top' }}>
            <Tooltip aria-label="Help" content={t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_10')} enableFlip>
              <Button variant="link" isInline className="co-field-level-help">
                <QuestionCircleIcon className="co-field-level-help__icon" />
              </Button>
            </Tooltip>
          </td>
        </tr>
      </table>
      <DetailsItem label={t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_5')} obj={obj}>
        <table>
          <tr>
            <td style={{ verticalAlign: 'top' }}>{`${t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_7')} :`}&nbsp;</td>
            <td>{obj.spec.redisLeader.redisConfig && <ResourceLink kind={'ConfigMap'} name={obj.spec.redisLeader.redisConfig?.additionalRedisConfig} namespace={obj.metadata.namespace} title={obj.spec.redisLeader.redisConfig?.additionalRedisConfig} />}</td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'top' }}>{`${t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_8')} :`}&nbsp;</td>
            <td>
              {cluster_array.map((x, key) => (
                <ResourceLink key={key} kind={'PersistentVolumeClaim'} name={`${leadr_pvc_name}-${x}`} namespace={obj.metadata.namespace} title={`${leadr_pvc_name}-${x}`} />
              ))}
            </td>
          </tr>
        </table>
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_6')} obj={obj}>
        <table>
          <tr>
            <td style={{ verticalAlign: 'top' }}>{`${t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_7')} :`}&nbsp;</td>
            <td>{obj.spec.redisFollower.redisConfig && <ResourceLink kind={'ConfigMap'} name={obj.spec.redisFollower.redisConfig?.additionalRedisConfig} namespace={obj.metadata.namespace} title={obj.spec.redisFollower.redisConfig?.additionalRedisConfig} />}</td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'top' }}>{`${t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_8')} :`}&nbsp;</td>
            <td>
              {cluster_array.map((x, key) => (
                <ResourceLink key={key} kind={'PersistentVolumeClaim'} name={`${follower_pvc_name}-${x}`} namespace={obj.metadata.namespace} title={`${follower_pvc_name}-${x}`} />
              ))}
            </td>
          </tr>
        </table>
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_REDISCLUSTERS_REDISCLUSTERDETAILS_TABDETAILS_9')} obj={obj}>
        {obj.spec.kubernetesConfig.image}
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_2')} obj={obj}>
        {obj.spec.redisExporter?.enabled ? t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_5') : t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_6')}
      </DetailsItem>
      {obj.spec.redisExporter?.enabled && (
        <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_7')} obj={obj}>
          <ExternalLink href={`https://grafana.tmaxcloud.org/api/grafana/login/generic_oauth`} text={'Grafana.tmaxcloud.org'} />
        </DetailsItem>
      )}
      <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_8')} obj={obj}>
        {obj.spec.TLS?.secret.secretName ? t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_9') : t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_10')}
      </DetailsItem>
      {obj.spec.TLS?.secret.secretName && (
        <DetailsItem label={t('SINGLE:MSG_REDIS_REDISDETAILS_TABDETAILS_11')} obj={obj}>
          <ResourceLink kind="Secret" name={obj.spec.TLS.secret.secretName} namespace={obj.metadata.namespace} title={obj.spec.TLS.secret.secretName} />
        </DetailsItem>
      )}
    </dl>
  );
};

const RedisClusterDetails: React.FC<RedisClusterDetailsProps> = ({ obj: sb }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(sb, t) })} />
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={sb} showOwner={false} />
        </div>
        <div className="col-sm-6">
          <RedisClusterDetailsList obj={sb} />
        </div>
      </div>
    </div>
  );
};

const { details, editResource } = navFactory;

export const RedisClusterDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={redisClusterMenuActions} pages={[details(detailsPage(RedisClusterDetails)), editResource()]} />;
};

type RedisClusterDetailsListProps = {
  obj: K8sResourceKind;
};

type RedisClusterDetailsProps = {
  obj: K8sResourceKind;
};

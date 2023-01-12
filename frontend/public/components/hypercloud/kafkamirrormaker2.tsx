import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaMirrorMaker2Model } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';
import { Status } from '@console/shared';
const kind = KafkaMirrorMaker2Model.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_151',
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
export const MirrorRow = ({ mirror, km2 }) => {
  const connectors = km2.status.connectors;
  const connector = connectors.find(obj => {
    return obj.name.indexOf(mirror.sourceCluster) !== -1 && obj.name.indexOf(mirror.targetCluster) !== -1;
  });

  const clusters = km2.spec.clusters;
  const sourceClusterBootstrapServerObj = clusters.find(obj => {
    return obj.alias.indexOf(mirror.sourceCluster) !== -1;
  });
  const targetClusterBootstrapServerObj = clusters.find(obj => {
    return obj.alias.indexOf(mirror.targetCluster) !== -1;
  });
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5 ">{sourceClusterBootstrapServerObj.bootstrapServers}</div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{mirror.sourceCluster || '-'}</div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs ">{targetClusterBootstrapServerObj.bootstrapServers}</div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{mirror.targetCluster || '-'}</div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs ">{connector.name}</div>
      <div className="col-lg-1 hidden-md hidden-sm hid den-xs ">
        <Status status={connector.connector.state} />
      </div>
    </div>
  );
};
export const MirrorTable = ({ heading, mirrors, km2 }) => {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeading text={heading} />
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_5')}</div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_6')}</div>
          <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_7')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_8')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_9')}</div>
          <div className="col-lg-1 hidden-md hidden-sm hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_10')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {mirrors.map((m: any, i: number) => (
            <MirrorRow key={i} mirror={m} km2={km2} />
          ))}
        </div>
      </div>
    </>
  );
};
const KafkaMirrorMaker2Details: React.FC<KafkaMirrorMaker2DetailsProps> = ({ obj: km2 }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(km2, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={km2} showOwner={false} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <MirrorTable key="MirrorTable" heading={t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_4')} mirrors={km2.spec.mirrors} km2={km2} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const KafkaMirrorMaker2sPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const KafkaMirrorMaker2sDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(KafkaMirrorMaker2Details)), editResource()]} />;
};

type KafkaMirrorMaker2DetailsProps = {
  obj: K8sResourceKind;
};

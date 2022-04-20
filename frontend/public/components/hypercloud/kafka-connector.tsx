import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaConnectorModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';
import { CodeContainer } from '../utils/hypercloud/code-container';

const kind = KafkaConnectorModel.kind;

const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(KafkaConnectorModel), ...Kebab.factory.common];

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_140',
      sortField: 'spec.class',
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
      children: obj.spec.class,
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

const KafkaConnectorsDetails: React.FC<KafkaConnectorsDetailsProps> = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(obj, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={obj} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <DetailsItem label={t('MULTI:MSG_DEVELOPER_KAFKACONNECTORS_KAFKACONNECTORDETAILS_TABDETAILS_1')} obj={obj}>
                {obj.spec.class}
              </DetailsItem>
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('MULTI:MSG_DEVELOPER_KAFKACONNECTORS_KAFKACONNECTORDETAILS_TABDETAILS_2')} />
        <CodeContainer label={t('MULTI:MSG_DEVELOPER_KAFKACONNECTORS_KAFKACONNECTORDETAILS_TABDETAILS_2')} value={obj.spec?.config} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const KafkaConnectorsPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const KafkaConnectorsDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(KafkaConnectorsDetails)), editResource()]} />;
};

type KafkaConnectorsDetailsProps = {
  obj: K8sResourceKind;
};

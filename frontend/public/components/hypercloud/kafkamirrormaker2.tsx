import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaMirrorMaker2Model } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';

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

type KafkaMirrorMaker2DetailsListProps = {
  obj: K8sResourceKind;
};

type KafkaMirrorMaker2DetailsProps = {
  obj: K8sResourceKind;
};

import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, TableProps } from '../utils';
import { Status } from '@console/shared';
import { VirtualServiceModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(VirtualServiceModel), ...Kebab.factory.common];

const kind = VirtualServiceModel.kind;

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortFunc: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_28',
      sortField: 'spec.hosts',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_124',
      sortField: 'spec.gateways',
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
      children: <Status status={obj.metadata.namespace} />,
    },
    {
      children: obj.spec.hosts ? obj.spec.hosts.map(host => host + ' ') : '',
    },
    {
      children: obj.spec.gateways ? obj.spec.gateways.map(gateway => gateway + ' ') : '',
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

const VirtualServiceDetails: React.FC<VirtualServiceDetailsProps> = ({ obj: virtualservice }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(virtualservice, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={virtualservice} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body"></div>
    </>
  );
};

const { details, editYaml } = navFactory;

export const VirtualServicesPage: React.FC = props => {
  return <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;
};

export const VirtualServicesDetailsPage: React.FC<VirtualServicesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(VirtualServiceDetails)), editYaml()]} />;

type VirtualServiceDetailsProps = {
  obj: K8sResourceKind;
};

type VirtualServicesDetailsPageProps = {
  match: any;
};

import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { AddHealthChecks, EditHealthChecks } from '@console/app/src/actions/modify-health-checks';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, LabelList, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Selector } from '../utils';
import { FederatedSecretModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [AddHealthChecks, Kebab.factory.AddStorage, ...Kebab.getExtensionsActionsForKind(FederatedSecretModel), EditHealthChecks, ...Kebab.factory.common];

const kind = FederatedSecretModel.kind;
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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
      sortField: 'metadata.labels',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_16',
      sortField: 'spec.selector',
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
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    {
      children: <Selector selector={obj.spec.selector} namespace={obj.metadata.namespace} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const FederatedSecretDetails: React.FC<FederatedSecretDetailsProps> = ({ obj: secret }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(secret, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={secret} showPodSelector showNodeSelector showTolerations />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const FederatedSecretsPage: React.FC<FederatedSecretsPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedSecretsDetailsPage: React.FC<FederatedSecretsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedSecretDetails)), editResource()]} />;

type FederatedSecretDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedSecretsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedSecretsDetailsPageProps = {
  match: any;
};

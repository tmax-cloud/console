import * as _ from 'lodash-es';
import * as React from 'react';
import { ClusterRegistrationStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, DetailsItem } from '../utils';
import { ClusterRegistrationModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { TableProps } from './utils/default-list-component';
import { ErrorPopoverStatus } from './utils/error-popover-status';

const { details, editResource } = navFactory;
export const menuActions: KebabAction[] = [...Kebab.factory.common];
const kind = ClusterRegistrationModel.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortFunc: 'ClusterRegistrationStatusReducer',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_69',
      sortFunc: 'spec.clusterName',
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
      children: <ErrorPopoverStatus error={obj.status.phase === 'Error'} status={obj.status.phase} reason={obj.status?.reason} />,
    },
    {
      children: obj.spec.clusterName,
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

export const ClusterRegistrationsPage: React.FC = props => {
  const pages = [
    {
      href: 'clustermanagers',
      name: 'COMMON:MSG_LNB_MENU_84',
    },
    {
      href: 'clusterclaims',
      name: 'COMMON:MSG_LNB_MENU_105',
    },
    {
      href: 'clusterregistrations',
      name: 'COMMON:MSG_MAIN_TAB_3',
    },
  ];
  return <ListPage canCreate={true} multiNavPages={pages} tableProps={tableProps} kind={kind} {...props} />;
};

const ClusterRegistrationDetails: React.FC<ClusterRegistrationDetailsProps> = ({ obj: clr }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clr, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={clr} showOwner={false} />
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')} obj={clr} path="metadata.annotations.creator" />
          </div>
          <div className="col-md-6">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
            <dd>
              <ErrorPopoverStatus error={ClusterRegistrationStatusReducer(clr) === 'Failed'} status={ClusterRegistrationStatusReducer(clr)} reason={clr.status?.reason} />
            </dd>
            {ClusterRegistrationStatusReducer(clr) === 'Failed' && (
              <>
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_20')}</dt>
                <dd>{clr.status?.reason}</dd>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const ClusterRegistrationsDetailsPage: React.FC<ClusterRegistrationsDetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} getResourceStatus={ClusterRegistrationStatusReducer} pages={[details(ClusterRegistrationDetails), editResource()]} />;
};

type ClusterRegistrationDetailsProps = {
  obj: K8sResourceKind;
};

type ClusterRegistrationsDetailsPageProps = {
  match: any;
};

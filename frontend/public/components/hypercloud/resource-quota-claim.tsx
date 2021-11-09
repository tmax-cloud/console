import * as React from 'react';
import * as classNames from 'classnames';

import { Status } from '@console/shared';
import { K8sResourceKind, K8sClaimResourceKind, modelFor } from '../../module/k8s';
import { fromNow } from '@console/internal/components/utils/datetime';
import { sortable } from '@patternfly/react-table';
import { Popover } from '@patternfly/react-core';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, navFactory, ResourceSummary, SectionHeading, ResourceLink, ResourceKebab } from '../utils';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const { common } = Kebab.factory;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

// export const menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('ResourceQuotaClaim')), ...common, Kebab.factory.ModifyStatus];

const kind = 'ResourceQuotaClaim';

const ResourceQuotaClaimTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.status',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};
ResourceQuotaClaimTableHeader.displayName = 'ResourceQuotaClaimTableHeader';

const unmodifiableStatus = new Set(['Approved', 'Resource Quota Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);
const ResourceQuotaClaimTableRow: RowFunction<K8sClaimResourceKind> = ({ obj: resourcequotaclaims, index, key, style }) => {
  let menuActions: any[];
  if (isUnmodifiable(resourcequotaclaims?.status?.status)) {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('ResourceQuotaClaim')), ...common];
  } else {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('ResourceQuotaClaim')), ...common, Kebab.factory.ModifyStatus];
  }

  return (
    <TableRow id={resourcequotaclaims.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={resourcequotaclaims.metadata.name} namespace={resourcequotaclaims.metadata.namespace} title={resourcequotaclaims.metadata.uid} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {resourcequotaclaims?.status?.status === 'Error' ? (
          <Popover headerContent={<div>에러 상세</div>} bodyContent={<div>{resourcequotaclaims.status?.reason}</div>} maxWidth="30rem" position="right">
            <Status status={resourcequotaclaims?.status?.status} />
          </Popover>
        ) : (
          <Status status={resourcequotaclaims?.status?.status} />
        )}
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={resourcequotaclaims.metadata.namespace} title={resourcequotaclaims.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>{fromNow(resourcequotaclaims?.metadata?.creationTimestamp)}</TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={resourcequotaclaims} />
      </TableData>
    </TableRow>
  );
};
export const ResourceQuotaClaimsList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="ResourceQuotaClaims" Header={ResourceQuotaClaimTableHeader.bind(null, t)} Row={ResourceQuotaClaimTableRow} virtualize />;
};
ResourceQuotaClaimsList.displayName = 'ResourceQuotaClaimsList';

const resourceQuotaClaimStatusReducer = (rqc: any): string => {
  return rqc?.status?.status;
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'resource-quota-claim-status',
    reducer: resourceQuotaClaimStatusReducer,
    items: [
      { id: 'Awaiting', title: 'Awaiting' },
      { id: 'Approved', title: 'Approved' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Resource Quota Deleted', title: 'Resource Quota Deleted' },
      { id: 'Error', title: 'Error' },
    ],
  },
];

export const ResourceQuotaClaimsPage: React.FC<ResourceQuotaClaimsPageProps> = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: 'resourcequotas',
      name: t('COMMON:MSG_LNB_MENU_80'),
    },
    {
      // href: 'resourcequotaclaims?rowFilter-resource-quota-claim-status=Awaiting',
      href: 'resourcequotaclaims',
      path: 'resourcequotaclaims',
      name: t('COMMON:MSG_LNB_MENU_102'),
    },
  ];
  return <ListPage kind={'ResourceQuotaClaim'} canCreate={true} ListComponent={ResourceQuotaClaimsList} {...props} multiNavPages={pages} rowFilters={filters.bind(null, t)()} defaultSelectedRows={['Awaiting']} />;
};
ResourceQuotaClaimsPage.displayName = 'ResourceQuotaClaimsPage';
const ResourceQuotaClaimsDetails: React.FC<ResourceQuotaClaimDetailsProps> = ({ obj: resourcequotaclaims }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_102') })} />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={resourcequotaclaims} showOwner={false}></ResourceSummary>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')}</dt>
              <dd>{resourcequotaclaims?.metadata?.annotations?.creator}</dd>
            </div>
            <div className="col-md-6">
              <dl className="co-m-pane__details">
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
                <dd>
                  <Status status={resourcequotaclaims.status?.status} />
                </dd>
                {resourcequotaclaims.status?.status === 'Rejected' && (
                  <>
                    <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_20')}</dt>
                    <dd>{resourcequotaclaims.status?.reason}</dd>
                  </>
                )}
                {/* <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
                <dd>{resourcequotaclaims.status?.status}</dd>
                <dt>{t('SINGLE:MSG_RESOURCEQUOTACLAIMS_RESOURCEQUOTACLAIMDETAILS_TABDETAILS_2')}</dt>
                <dd>{resourcequotaclaims.status?.reason}</dd> */}
                {/* <dt>{t('SINGLE:MSG_RESOURCEQUOTACLAIMS_RESOURCEQUOTACLAIMDETAILS_TABDETAILS_3')}</dt>
                <dd>{resourcequotaclaims.spec?.hard?.['limits.cpu']}</dd>
                <dt>{t('SINGLE:MSG_RESOURCEQUOTACLAIMS_RESOURCEQUOTACLAIMDETAILS_TABDETAILS_4')}</dt>
                <dd>{resourcequotaclaims.spec?.hard?.['limits.memory']}</dd> */}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
ResourceQuotaClaimsDetails.displayName = 'ResourceQuotaClaimsDetails';

const { details, editResource } = navFactory;
export const ResourceQuotaClaimsDetailsPage: React.FC<ResourceQuotaClaimsDetailsPageProps> = props => {
  let menuActions: any[];
  const [status, setStatus] = React.useState();

  if (isUnmodifiable(status)) {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common];
  } else {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common, Kebab.factory.ModifyStatus];
  }
  return <DetailsPage {...props} kind={'ResourceQuotaClaim'} menuActions={menuActions} setCustomState={setStatus} customStatePath="status.status" pages={[details(ResourceQuotaClaimsDetails), editResource()]} />;
};
ResourceQuotaClaimsDetailsPage.displayName = 'ResourceQuotaClaimsDetailsPage';

type ResourceQuotaClaimDetailsProps = {
  obj: K8sResourceKind;
};

type ResourceQuotaClaimsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ResourceQuotaClaimsDetailsPageProps = {
  match: any;
};

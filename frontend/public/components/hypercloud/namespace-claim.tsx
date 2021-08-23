import * as React from 'react';
import * as classNames from 'classnames';

import { sortable } from '@patternfly/react-table';
import { fromNow } from '@console/internal/components/utils/datetime';
import { Status } from '@console/shared';
import { K8sResourceKind, K8sClaimResourceKind, modelFor } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Popover } from '@patternfly/react-core';
import { Kebab, navFactory, ResourceSummary, SectionHeading, ResourceLink, ResourceKebab } from '../utils';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const { common } = Kebab.factory;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const kind = 'NamespaceClaim';

const NamespaceClaimTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_98'),
      sortField: 'resourceName',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.status',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_97'),
      sortField: 'metadata.annotations.owner',
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
NamespaceClaimTableHeader.displayName = 'NamespaceClaimTableHeader';

const unmodifiableStatus = new Set(['Approved', 'Namespace Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);
const NamespaceClaimTableRow: RowFunction<K8sClaimResourceKind> = ({ obj: namespaceclaims, index, key, style }) => {
  let menuActions: any[];

  if (isUnmodifiable(namespaceclaims?.status?.status)) {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common];
  } else {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common, Kebab.factory.ModifyStatus];
  }

  return (
    <TableRow id={namespaceclaims.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={namespaceclaims.metadata.name} namespace={namespaceclaims.metadata.namespace} title={namespaceclaims.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={namespaceclaims?.resourceName} title={namespaceclaims?.resourceName} linkTo={namespaceclaims.status?.status === 'Approved'} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {namespaceclaims?.status?.status === 'Error' ? (
          <Popover headerContent={<div>에러 상세</div>} bodyContent={<div>{namespaceclaims.status?.reason}</div>} maxWidth="30rem" position="right">
            <div style={{ width: 'fit-content', cursor: 'pointer', color: '#0066CC' }}>
              <Status status={namespaceclaims?.status?.status} />
            </div>
          </Popover>
        ) : (
          <Status status={namespaceclaims?.status?.status} />
        )}
      </TableData>
      <TableData className={tableColumnClasses[3]}>{namespaceclaims.metadata?.annotations?.owner}</TableData>
      <TableData className={tableColumnClasses[4]}>{fromNow(namespaceclaims?.metadata?.creationTimestamp)}</TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={namespaceclaims} />
      </TableData>
    </TableRow>
  );
};

export const NamespaceClaimsList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="NamespaceClaims" Header={NamespaceClaimTableHeader.bind(null, t)} Row={NamespaceClaimTableRow} virtualize />;
};
NamespaceClaimsList.displayName = 'NamespaceClaimsList';

const namespaceClaimStatusReducer = (nsc: any): string => {
  return nsc?.status?.status;
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'namespace-claim-status',
    reducer: namespaceClaimStatusReducer,
    items: [
      { id: 'Awaiting', title: 'Awaiting' },
      { id: 'Approved', title: 'Approved' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Namespace Deleted', title: 'Namespace Deleted' },
      { id: 'Error', title: 'Error' },
    ],
  },
];

export const NamespaceClaimsPage: React.FC<NamespaceClaimsPageProps> = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: 'namespaces',
      name: t('SINGLE:MSG_NAMESPACES_MAIN_TABNAMESPACES_1'),
    },
    {
      href: 'namespaceclaims',
      // path: 'namespaceclaims',
      name: t('SINGLE:MSG_NAMESPACES_MAIN_TABNAMESPACECLAIMS_1'),
    },
  ];
  return <ListPage kind={'NamespaceClaim'} canCreate={true} ListComponent={NamespaceClaimsList} {...props} title={t('COMMON:MSG_LNB_MENU_3')} mock={false} multiNavPages={pages} rowFilters={filters.bind(null, t)()} defaultSelectedRows={['Awaiting']} />;
};
NamespaceClaimsPage.displayName = 'NamespaceClaimsPage';
const NamespaceClaimsDetails: React.FC<NamespaceClaimDetailsProps> = ({ obj: namespaceclaims }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_103') })} />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={namespaceclaims} />
            </div>
            <div className="col-md-6">
              <dl className="co-m-pane__details">
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_118')}</dt>
                <dd>{namespaceclaims.resourceName}</dd>
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
                {/* <dd>{namespaceclaims.status?.status}</dd> */}
                <dd>
                  <Status status={namespaceclaims.status?.status} />
                </dd>
                {namespaceclaims.status?.status === 'Rejected' && (
                  <>
                    <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_20')}</dt>
                    <dd>{namespaceclaims.status?.reason}</dd>
                  </>
                )}

                {/* <dt>{t('SINGLE:MSG_NAMESPACECLAIMS_NAMESPACEDETAILS_TABDETAILS_2')}</dt>
                <dd>{namespaceclaims.spec?.hard?.['limits.cpu']}</dd>
                <dt>{t('SINGLE:MSG_NAMESPACECLAIMS_NAMESPACEDETAILS_TABDETAILS_3')}</dt>
                <dd>{namespaceclaims.spec?.hard?.['limits.memory']}</dd> */}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
NamespaceClaimsDetails.displayName = 'NamespaceClaimsDetails';

const { details, editResource } = navFactory;
export const NamespaceClaimsDetailsPage: React.FC<NamespaceClaimsDetailsPageProps> = props => {
  let menuActions: any[];
  const [status, setStatus] = React.useState();

  if (isUnmodifiable(status)) {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common];
  } else {
    menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common, Kebab.factory.ModifyStatus];
  }
  return <DetailsPage {...props} kind={'NamespaceClaim'} menuActions={menuActions} setCustomState={setStatus} customStatePath="status.status" pages={[details(NamespaceClaimsDetails), editResource()]} />;
};
NamespaceClaimsDetailsPage.displayName = 'NamespaceClaimsDetailsPage';

type NamespaceClaimDetailsProps = {
  obj: K8sResourceKind;
};

type NamespaceClaimsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type NamespaceClaimsDetailsPageProps = {
  match: any;
};

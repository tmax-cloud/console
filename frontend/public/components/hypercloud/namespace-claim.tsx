import * as React from 'react';

import { fromNow } from '@console/internal/components/utils/datetime';
import { Status } from '@console/shared';
import { K8sResourceKind, modelFor } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Popover } from '@patternfly/react-core';
import { Kebab, navFactory, ResourceSummary, SectionHeading, ResourceLink, ResourceKebab } from '../utils';
import { useTranslation } from 'react-i18next';
import { NamespaceClaimModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { NamespaceClaimReducer } from '@console/dev-console/src/utils/hc-status-reducers';

const { common } = Kebab.factory;

const kind = NamespaceClaimModel.kind;

const unmodifiableStatus = new Set(['Approved', 'Namespace Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_98',
      sortField: 'resourceName',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortFunc: 'status.status',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_97',
      sortField: 'metadata.annotations.owner',
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
  row: (obj: K8sResourceKind) => {
    let menuActions: any[];

    if (isUnmodifiable(obj?.status?.status)) {
      menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common];
    } else {
      menuActions = [...Kebab.getExtensionsActionsForKind(modelFor('NamespaceClaim')), ...common, Kebab.factory.ModifyStatus];
    }

    return [
      {
        children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
      },
      {
        className: 'co-break-word',
        children: <ResourceLink kind="Namespace" name={obj?.resourceName} title={obj?.resourceName} linkTo={obj.status?.status === 'Approved'} />,
      },
      {
        children:
          obj?.status?.status === 'Error' ? (
            <Popover headerContent={<div>에러 상세</div>} bodyContent={<div>{obj.status?.reason}</div>} maxWidth="30rem" position="right">
              <div style={{ width: 'fit-content', cursor: 'pointer', color: '#0066CC' }}>
                <Status status={NamespaceClaimReducer(obj)} />
              </div>
            </Popover>
          ) : (
            <Status status={NamespaceClaimReducer(obj)} />
          ),
      },
      {
        children: obj.metadata?.annotations?.owner,
      },
      {
        children: fromNow(obj?.metadata?.creationTimestamp),
      },
      {
        className: Kebab.columnClass,
        children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
      },
    ];
  },
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'namespace-claim-status',
    reducer: NamespaceClaimReducer,
    items: [
      { id: 'Awaiting', title: 'Awaiting' },
      { id: 'Approved', title: 'Approved' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Namespace Deleted', title: 'Namespace Deleted' },
      { id: 'Error', title: 'Error' },
    ],
  },
];

export const NamespaceClaimsPage: React.FC = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: 'namespaces',
      name: 'SINGLE:MSG_NAMESPACES_MAIN_TABNAMESPACES_1',
    },
    {
      href: 'namespaceclaims',
      // path: 'namespaceclaims',
      name: 'SINGLE:MSG_NAMESPACES_MAIN_TABNAMESPACECLAIMS_1',
    },
  ];
  return <ListPage kind={kind} canCreate={true} tableProps={tableProps} {...props} mock={false} multiNavPages={pages} rowFilters={filters.bind(null, t)()} defaultSelectedRows={['Awaiting']} />;
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
                <dd>
                  <Status status={NamespaceClaimReducer(namespaceclaims)} />
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

type NamespaceClaimsDetailsPageProps = {
  match: any;
};

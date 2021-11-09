import * as React from 'react';
import * as classNames from 'classnames';

import { K8sResourceCommon, K8sClaimResourceKind, modelFor, k8sGet } from '../../module/k8s';

import { sortable } from '@patternfly/react-table';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, navFactory, ResourceSummary, SectionHeading, ResourceLink, ResourceKebab, Timestamp, DetailsItem } from '../utils';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { RoleBindingClaimModel } from '../../models';
import { Popover } from '@patternfly/react-core';
import { K8sResourceKind } from '../../module/k8s';
import { Status } from '@console/shared';

import { RoleBindingClaimReducer } from '@console/dev-console/src/utils/hc-status-reducers';

export const RoleBindingClaimStatus: React.FC<RoleBindingClaimStatusProps> = ({ result }) => <Status status={RoleBindingClaimReducer(result)} />;

const { common } = Kebab.factory;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

export const getMenuActions = (status?) => {
  return [...Kebab.getExtensionsActionsForKind(modelFor('RoleBindingClaim')), ...common, ...(((status !== 'Approved') && (status !== 'Role Binding Deleted')) ? [Kebab.factory.ModifyStatus] : [])];
}

const kind = 'RoleBindingClaim';

const RoleBindingClaimTableHeader = (t?: TFunction) => {
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
RoleBindingClaimTableHeader.displayName = 'RoleBindingClaimTableHeader';

const RoleBindingClaimTableRow: RowFunction<K8sClaimResourceKind> = ({ obj: rolebindingclaims, index, key, style }) => {
  const menuActions = getMenuActions(rolebindingclaims?.status?.status)
  return (
    <TableRow id={rolebindingclaims.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={rolebindingclaims.metadata.name} namespace={rolebindingclaims.metadata.namespace} title={rolebindingclaims.metadata.uid} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {rolebindingclaims.status?.status === 'Error' ? (
          <Popover headerContent={<div>에러 상세</div>} bodyContent={<div>{rolebindingclaims.status?.reason}</div>} maxWidth="30rem" position="right">
            <div style={{ width: 'fit-content', cursor: 'pointer', color: '#0066CC' }}>
              <RoleBindingClaimStatus result={rolebindingclaims} />
            </div>
          </Popover>
        ) : (
          <RoleBindingClaimStatus result={rolebindingclaims} />
        )}
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceLink kind="Namespace" name={rolebindingclaims.metadata.namespace} title={rolebindingclaims.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <Timestamp timestamp={rolebindingclaims.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={rolebindingclaims} />
      </TableData>
    </TableRow>
  );
};
export const RoleBindingClaimsList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="RoleBindingClaims" Header={RoleBindingClaimTableHeader.bind(null, t)} Row={RoleBindingClaimTableRow} virtualize />;
};
RoleBindingClaimsList.displayName = 'RoleBindingClaimsList';


const roleBindingClaimStatusReducer = (rolebindingclaims: any): string => {
  return rolebindingclaims.status.status;
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'roleBindingClaim-status',
    reducer: roleBindingClaimStatusReducer,
    items: [
      { id: 'Awaiting', title: 'Awaiting' },
      { id: 'Rejected', title: 'Rejected' },
      { id: 'Approved', title: 'Approved' },
      { id: 'Error', title: 'Error' },
      { id: 'Role Binding Deleted', title: 'Role Binding Deleted' },
    ],
  },
];


export const RoleBindingClaimsPage: React.FC<RoleBindingClaimsPageProps> = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: 'rolebindings',
      name: t('COMMON:MSG_LNB_MENU_76'),

    },
    {
      href: 'rolebindingclaims',
      name: t('COMMON:MSG_LNB_MENU_101'),
    },
  ];
  if (props.single) {
    return <ListPage
      kind={'RoleBindingClaim'}
      canCreate={true}
      ListComponent={RoleBindingClaimsList}
      {...props}
      rowFilters={filters.bind(null, t)()}      
      title={t('COMMON:MSG_LNB_MENU_101')}
      defaultSelectedRows={['Awaiting']}
    />;
  }
  return <ListPage
    kind={'RoleBindingClaim'}
    canCreate={true}
    ListComponent={RoleBindingClaimsList}
    {...props}
    rowFilters={filters.bind(null, t)()}
    multiNavPages={pages}
    title={t('COMMON:MSG_LNB_MENU_76')}
    defaultSelectedRows={['Awaiting']} 
  />;
};

RoleBindingClaimsPage.displayName = 'RoleBindingClaimsPage';
const RoleBindingClaimsDetails: React.FC<RoleBindingClaimDetailsProps> = ({ obj: rolebindingclaims }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_101') })} />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={rolebindingclaims}></ResourceSummary>
            </div>
            <div className="col-sm-6">
              <RoleBindingClaimDetailsList resource={rolebindingclaims}></RoleBindingClaimDetailsList>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
RoleBindingClaimsDetails.displayName = 'RoleBindingClaimsDetails';

const { details, editResource } = navFactory;
export const RoleBindingClaimsDetailsPage: React.FC<RoleBindingClaimsDetailsPageProps> = props => {
  const [menuActions, setMenuActions] = React.useState(getMenuActions());
  React.useEffect(() => {
    k8sGet(RoleBindingClaimModel, props.name, props.namespace)
      .then(res => {
        setMenuActions(getMenuActions(res?.status?.status));
      });
  }, [props.name, props.namespace]);
  return <DetailsPage {...props} kind={'RoleBindingClaim'} menuActions={menuActions} pages={[details(RoleBindingClaimsDetails), editResource()]} />
};
RoleBindingClaimsDetailsPage.displayName = 'RoleBindingClaimsDetailsPage';

type RoleBindingClaimDetailsProps = {
  obj: K8sResourceCommon;
};

type RoleBindingClaimsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
  single? : boolean;
};

type RoleBindingClaimsDetailsPageProps = {
  match: any;
  name: string;
  namespace: string;
};


export const RoleBindingClaimDetailsList: React.FC<RoleBindingClaimDetailsListProps> = ({ resource }) => {
  const { t } = useTranslation();

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={`${t('COMMON:MSG_COMMON_TABLEHEADER_2')}`} obj={resource} path="status.status">
        <RoleBindingClaimStatus result={resource} />
      </DetailsItem>
      {resource.status?.status === 'Rejected' &&
        <DetailsItem label={`${t('COMMON:MSG_DETAILS_TABDETAILS_20')}`} obj={resource} path="spec.reason">
          {resource.status?.reason}
        </DetailsItem>
      }
    </dl>
  );
}

type RoleBindingClaimDetailsListProps = {
  resource: K8sResourceKind;
};

type RoleBindingClaimStatusProps = {
  result: any;
};
import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import { ClusterTemplateClaimModel } from '../../models';
import { ClusterTemplateClaimKind } from '../../module/k8s';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { Kebab, navFactory, SectionHeading, ResourceSummary, ResourceLink, ResourceKebab, Timestamp } from '../utils';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ClusterTemplateClaimReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { ErrorPopoverStatus } from './utils/error-popover-status';

const clusterTemplateClaimCommonActions = [Kebab.factory.Edit, Kebab.factory.Delete];

const kind = ClusterTemplateClaimModel.kind;

const ClusterTemplateClaimDetails: React.FC<ClusterTemplateClaimDetailsProps> = ({ obj: clusterTemplateClaim }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clusterTemplateClaim, t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={clusterTemplateClaim}></ResourceSummary>
          </div>
          <div className="col-md-6">
            <dl className="co-m-pane__details">
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_118')}</dt>
              <dd>{clusterTemplateClaim.spec?.resourceName}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_13')}</dt>
              <dd>
                <Status status={ClusterTemplateClaimReducer(clusterTemplateClaim)} />
              </dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_18')}</dt>
              <dd>
                <Timestamp timestamp={clusterTemplateClaim.status?.lastTransitionTime} />
              </dd>
              {ClusterTemplateClaimReducer(clusterTemplateClaim) === 'Rejected' && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_20')}</dt>
                  <dd>{clusterTemplateClaim.status.reason}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

type ClusterTemplateClaimDetailsProps = {
  obj: ClusterTemplateClaimKind;
};

const unmodifiableStatus = new Set(['Approved', 'Cluster Template Deleted']);
const isUnmodifiable = (status: string) => unmodifiableStatus.has(status);

const { details, editResource } = navFactory;
const ClusterTemplateClaimsDetailsPage: React.FC<ClusterTemplateClaimsDetailsPageProps> = props => {
  const [status, setStatus] = React.useState();
  const menuActions = isUnmodifiable(status) ? clusterTemplateClaimCommonActions : [...clusterTemplateClaimCommonActions, Kebab.factory.ModifyStatus];
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} setCustomState={setStatus} customStatePath="status.status" pages={[details(ClusterTemplateClaimDetails), editResource()]} />;
};
ClusterTemplateClaimsDetailsPage.displayName = 'ClusterTemplateClaimsDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', // NAMESPACE
  '', // STATUS
  '', // CREATED
  Kebab.columnClass, // MENU ACTIONS
];

const ClusterTemplateClaimTableRow = ({ obj, index, key, style }) => {
  const menuActions = isUnmodifiable(obj.status?.status) ? clusterTemplateClaimCommonActions : [...clusterTemplateClaimCommonActions, Kebab.factory.ModifyStatus];
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <ErrorPopoverStatus error={ClusterTemplateClaimReducer(obj) === 'Error'} status={ClusterTemplateClaimReducer(obj)} reason={obj.status?.reason} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

const ClusterTemplateClaimTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'ClusterTemplateClaimReducer',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[4] },
    },
  ];
};

ClusterTemplateClaimTableHeader.displayName = 'ClusterTemplateClaimTableHeader';

const ClusterTemplateClaimsList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Cluster Template Claim" Header={ClusterTemplateClaimTableHeader.bind(null, t)} Row={ClusterTemplateClaimTableRow} customSorts={{ ClusterTemplateClaimReducer }} />;
};
ClusterTemplateClaimsList.displayName = 'ClusterTemplateClaimsList';

const ClusterTemplateClaimsPage: React.FC<ClusterTemplateClaimsPageProps> = props => {
  const { t } = useTranslation();
  const filters = [
    {
      filterGroupName: t('COMMON:MSG_COMMON_BUTTON_FILTER_3'),
      type: 'cluster-template-claim-status',
      reducer: ClusterTemplateClaimReducer,
      items: [
        { id: 'Approved', title: t('COMMON:MSG_COMMON_STATUS_10') },
        { id: 'Rejected', title: t('COMMON:MSG_COMMON_STATUS_11') },
        { id: 'Awaiting', title: t('COMMON:MSG_COMMON_STATUS_9') },
        { id: 'Error', title: t('COMMON:MSG_COMMON_STATUS_15') },
        { id: 'Cluster Template Deleted', title: 'Cluster Template Deleted' },
      ],
    },
  ];
  return <ListPage title={t('COMMON:MSG_LNB_MENU_19')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_19') })} canCreate={true} kind={kind} ListComponent={ClusterTemplateClaimsList} rowFilters={filters} {...props} />;
};
ClusterTemplateClaimsPage.displayName = 'ClusterTemplateClaimsPage';

export { ClusterTemplateClaimsList, ClusterTemplateClaimsPage, ClusterTemplateClaimsDetailsPage };

type ClusterTemplateClaimsPageProps = {};

type ClusterTemplateClaimsDetailsPageProps = {
  match: any;
};

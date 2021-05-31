import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import { ClusterTemplateClaimModel } from '../../models';
import { ClusterTemplateClaimKind } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { Kebab, navFactory, SectionHeading, ResourceSummary, ResourceLink, ResourceKebab, Timestamp } from '../utils';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

const { common } = Kebab.factory;

const kind = ClusterTemplateClaimModel.kind;

export const clusterTemplateClaimMenuActions = [...Kebab.getExtensionsActionsForKind(ClusterTemplateClaimModel), ...common, Kebab.factory.ModifyStatus];

const ClusterTemplateClaimDetails: React.FC<ClusterTemplateClaimDetailsProps> = ({ obj: clusterTemplateClaim }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clusterTemplateClaim, t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={clusterTemplateClaim} showOwner={false}></ResourceSummary>
          </div>
          <div className="col-md-6">
            <dl className="co-m-pane__details">
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_118')}</dt>
              <dd>{clusterTemplateClaim.spec?.resourceName}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_13')}</dt>
              <dd>{clusterTemplateClaim.status?.status}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_18')}</dt>
              <dd>
                <Timestamp timestamp={clusterTemplateClaim.status?.lastTransitionTime} />
              </dd>
              {clusterTemplateClaim.status?.reason && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_CONDITIONS_TABLEHEADER_5')}</dt>
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

const { details, editResource } = navFactory;
const ClusterTemplateClaimsDetailsPage: React.FC<ClusterTemplateClaimsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={clusterTemplateClaimMenuActions} pages={[details(ClusterTemplateClaimDetails), editResource()]} />;
ClusterTemplateClaimsDetailsPage.displayName = 'ClusterTemplateClaimsDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', // STATUS
  '', // CREATED
  Kebab.columnClass, // MENU ACTIONS
];

const ClusterTemplateClaimTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>{obj.status && obj.status.status}</TableData>
      <TableData className={tableColumnClasses[2]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={clusterTemplateClaimMenuActions} kind={kind} resource={obj} />
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'clusterTemplateClaimStatusReducer',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};

ClusterTemplateClaimTableHeader.displayName = 'ClusterTemplateClaimTableHeader';

const ClusterTemplateClaimsList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Cluster Template Claim" Header={ClusterTemplateClaimTableHeader.bind(null, t)} Row={ClusterTemplateClaimTableRow} customSorts={{ clusterTemplateClaimStatusReducer }} />;
};
ClusterTemplateClaimsList.displayName = 'ClusterTemplateClaimsList';

const clusterTemplateClaimStatusReducer = (csc: any): string => {
  return csc?.status?.status;
};

const ClusterTemplateClaimsPage: React.FC<ClusterTemplateClaimsPageProps> = props => {
  const { t } = useTranslation();
  const filters = [
    {
      filterGroupName: t('COMMON:MSG_COMMON_BUTTON_FILTER_3'),
      type: 'cluster-template-claim-status',
      reducer: clusterTemplateClaimStatusReducer,
      items: [
        { id: 'Approved', title: t('COMMON:MSG_COMMON_STATUS_10') },
        { id: 'Rejected', title: t('COMMON:MSG_COMMON_STATUS_11') },
        { id: 'Awaiting', title: t('COMMON:MSG_COMMON_STATUS_9') },
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

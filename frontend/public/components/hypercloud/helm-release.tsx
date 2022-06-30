// 헬름 릴리즈 crd 를 보여주는 화면에 관련된 파일입니다. 개발자 - 헬름 -헬름 릴리즈 메뉴 통해서 보이는 화면은 helmrelease.tsx 참고 바랍니다.
import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { Status } from '@console/shared';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
// import { HelmReleaseModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Popover } from '@patternfly/react-core';
import { K8sKind } from '../../module/k8s';
import { MenuLinkType } from '@console/internal/hypercloud/menu/menu-types';

export const HelmReleaseModel: K8sKind = {
  kind: 'HelmRelease',
  label: 'Helm Release',
  labelPlural: 'Helm Release',
  apiGroup: 'helm.fluxcd.io',
  apiVersion: 'v1',
  abbr: 'HR',
  namespaced: true,
  id: 'helmrelease',
  plural: 'helmreleases',
  menuInfo: {
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    isMultiOnly: false,
  },
  i18nInfo: {
    label: 'COMMON:MSG_LNB_MENU_204',
    labelPlural: 'COMMON:MSG_LNB_MENU_203',
  },
};

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(HelmReleaseModel), ...Kebab.factory.common];

const kind = HelmReleaseModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const HelmReleaseTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_112'),
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_110'),
      sortField: 'status.releaseName',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },        
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_111'),
      sortFunc: 'status.conditions[status.conditions.length - 1].message',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};
HelmReleaseTableHeader.displayName = 'HelmReleaseTableHeader';

const HelmReleaseTableRow: RowFunction<K8sResourceKind> = ({ obj: tm, index, key, style }) => {
  //const { t } = useTranslation();
  //const statusTest = t('COMMON:MSG_DETAILS_TABDETAILS_74');
  const statusTest2 = 'status';
  return (
    <TableRow id={tm.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={tm.metadata.name} namespace={tm.metadata.namespace} title={tm.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={tm.metadata.namespace} title={tm.metadata.namespace} />
      </TableData>      
      <TableData className={tableColumnClasses[2]}><Status status={tm.status?.phase} /></TableData>      
      <TableData className={tableColumnClasses[3]}>
        <Popover headerContent={<div>{statusTest2}</div>} bodyContent={<Status status={tm.status?.releaseStatus} />} maxWidth="30rem" position="right">
          <div style={{ width: 'fit-content', cursor: 'pointer', color: '#0066CC' }}>
            {tm.status?.releaseName}
          </div>
        </Popover>        
      </TableData>      
      <TableData className={tableColumnClasses[4]}>{tm.status?.conditions[tm.status?.conditions.length - 1].message}</TableData>
      <TableData className={tableColumnClasses[5]}>
        <Timestamp timestamp={tm.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={tm} />
      </TableData>
    </TableRow>
  );
};

export const HelmReleaseDetailsList: React.FC<HelmReleaseDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={`${t('COMMON:MSG_MAIN_TABLEHEADER_112')}`} obj={ds} path="status.phase">
        <Status status={ds.status?.phase} />
      </DetailsItem>
      <DetailsItem label={`${t('COMMON:MSG_DETAILS_TABDETAILS_73')}`} obj={ds} path="">
        {`${t('COMMON:MSG_DETAILS_TABDETAILS_74')}`}{ds.status?.releaseName}
        <br />
        {`${t('COMMON:MSG_DETAILS_TABDETAILS_75')}`}<Status status={ds.status?.releaseStatus} />
      </DetailsItem>
      <DetailsItem label={`${t('COMMON:MSG_MAIN_TABLEHEADER_111')}`} obj={ds} path="message">
        {ds.status?.conditions[ds.status?.conditions.length - 1].message}
      </DetailsItem>
        { ds.spec?.chart?.repository ? (
          <DetailsItem label={`${t('COMMON:MSG_DETAILS_TABDETAILS_76')}`} obj={ds} path="spec.chart">        
            {`${t('COMMON:MSG_DETAILS_TABDETAILS_77')}`}{ds.spec?.chart?.repository}
            <br />
            {`${t('COMMON:MSG_DETAILS_TABDETAILS_78')}`}{ds.spec?.chart?.name}
            <br />
            {`${t('COMMON:MSG_DETAILS_TABDETAILS_79')}`}{ds.spec?.chart?.version}
        </DetailsItem>
        ) : (
          ds.spec?.chart?.git ? (            
            <DetailsItem label={`${t('COMMON:MSG_DETAILS_TABDETAILS_76')}`} obj={ds} path="spec.chart">
            {`${t('COMMON:MSG_DETAILS_TABDETAILS_80')}`}{ds.spec?.chart?.git}
            <br />
            {`${t('COMMON:MSG_DETAILS_TABDETAILS_81')}`}{ds.spec?.chart?.ref}
            <br />
            {`${t('COMMON:MSG_DETAILS_TABDETAILS_82')}`}{ds.spec?.chart?.path}
            </DetailsItem>
          ) : (
            <></>
          )  
        )}      
    </dl>
  );
}

const HelmReleaseDetails: React.FC<HelmReleaseDetailsProps> = ({ obj: hr }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(hr, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={hr} />
          </div>
          <div className="col-lg-6">
            <HelmReleaseDetailsList ds={hr} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const HelmReleases: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="HelmReleases" Header={HelmReleaseTableHeader.bind(null, t)} Row={HelmReleaseTableRow} virtualize />;
};

const helmReleaseStatusReducer = (helmreleases: any): string => {
  return helmreleases.status?.phase;
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'helmReleases-status',
    reducer: helmReleaseStatusReducer,
    items: [
      { id: 'ChartFetched', title: 'ChartFetched' },
      { id: 'ChartFetchFailed', title: 'ChartFetchFailed' },
      { id: 'Installing', title: 'Installing' },
      { id: 'Upgrading', title: 'Upgrading' },
      { id: 'Deployed', title: 'Deployed' },
      { id: 'DeployFailed', title: 'DeployFailed' },
      { id: 'Testing', title: 'Testing' },
      { id: 'TestFailed', title: 'TestFailed' },
      { id: 'Tested', title: 'Tested' },
      { id: 'Succeeded', title: 'Succeeded' },
      { id: 'RollingBack', title: 'RollingBack' },
      { id: 'RolledBack', title: 'RolledBack' },
      { id: 'RollBackFailed', title: 'RollBackFailed' },
    ],
  },
];

export const HelmReleasePage: React.FC<HelmReleasePageProps> = props => {
  const { t } = useTranslation();
  return (
    <ListPage
      title={t('COMMON:MSG_LNB_MENU_203')}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_203') })}
      canCreate={true}
      ListComponent={HelmReleases}
      kind={kind} {...props}
      rowFilters={filters.bind(null, t)()}
    />
  );
};

export const HelmReleaseDetailsPage: React.FC<HelmReleaseDetailsPageProps> = props => {
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      pages={[details(detailsPage(HelmReleaseDetails)), editResource()]}
    />
  );
};

type HelmReleaseDetailsListProps = {
  ds: K8sResourceKind;
};

type HelmReleaseDetailsProps = {
  obj: K8sResourceKind;
};

type HelmReleasePageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type HelmReleaseDetailsPageProps = {
  match: any;
};

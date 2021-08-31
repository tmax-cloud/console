import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { Status } from '@console/shared';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { IntegrationConfigModel } from '../../models/hypercloud';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

import { IntegrationConfigReducer } from '@console/dev-console/src/utils/hc-status-reducers';

export const IntegrationConfigStatus: React.FC<IntegrationConfigStatusProps> = ({ result }) => <Status status={IntegrationConfigReducer(result)} />;

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(IntegrationConfigModel), ...Kebab.factory.common];

const kind = IntegrationConfigModel.kind;

const tableColumnClasses = [
  //classNames('col-xs-2', 'col-sm-2'),
  classNames('pf-m-hidden', 'pf-m-visible-on-sm'), // NAME
  //classNames('col-xs-2', 'col-sm-2'),
  classNames('pf-m-hidden', 'pf-m-visible-on-sm'), // NAMESPACE
  //classNames('col-sm-2', 'hidden-xs'),
  //classNames('col-xs-2', 'col-sm-2'),
  classNames('pf-m-hidden', 'pf-m-visible-on-sm'), // STATUS
  //classNames('col-lg-2', 'hidden-xs'),
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // CREATED
  Kebab.columnClass,
];

const IntegrationConfigPhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions?.forEach(cur => {
      if (cur.type === 'ready') {
        if (cur.status === 'True') {
          phase = 'Ready';
        } else {
          phase = 'UnReady';
        }
      }
    });
    return phase;
  }
};

const IntegrationConfigTableHeader = (t?: TFunction) => {

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
      sortFunc: 'IntegrationConfigPhase',
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

IntegrationConfigTableHeader.displayName = 'IntegrationConfigTableHeader';


const IntegrationConfigTableRow: RowFunction<K8sResourceKind> = ({ obj: integrationConfig, index, key, style }) => {
  return (
    <TableRow id={integrationConfig.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={integrationConfig.metadata.name} namespace={integrationConfig.metadata.namespace} title={integrationConfig.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={integrationConfig.metadata.namespace} title={integrationConfig.metadata.namespace} />
      </TableData>      
      <TableData className={tableColumnClasses[2]}>
        <IntegrationConfigStatus result={integrationConfig} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <Timestamp timestamp={integrationConfig.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={integrationConfig} />
      </TableData>
    </TableRow>
  );
};

export const IntegrationConfigDetailsList: React.FC<IntegrationConfigDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();

  const readyCondition = ds.status.conditions.find(obj => _.lowerCase(obj.type) === 'ready');
  const time = readyCondition?.lastTransitionTime?.replace('T', ' ').replaceAll('-', '.').replace('Z', '');

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={`${t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_109')}`} obj={ds} path="status.transitionTime">
        {time}
      </DetailsItem>
      <DetailsItem label={`${t('COMMON:MSG_COMMON_TABLEHEADER_2')}`} obj={ds} path="status.result">
        <IntegrationConfigStatus result={ds} />
      </DetailsItem>
    </dl>
  );
}

const IntegrationConfigDetails: React.FC<IntegrationConfigDetailsProps> = ({ obj: integrationConfig }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(integrationConfig, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={integrationConfig} />
          </div>
          <div className="col-lg-6">
            <IntegrationConfigDetailsList ds={integrationConfig} />
          </div>
        </div>
      </div>
    </>
  );
}


const { details, editResource } = navFactory;

export const IntegrationConfigs: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="IntegrationConfigs" Header={IntegrationConfigTableHeader.bind(null, t)} Row={IntegrationConfigTableRow} virtualize />;
}

const integrationConfigStatusReducer = (integrationConfig: any): string => {
  const phase = IntegrationConfigPhase(integrationConfig);
  return phase;
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'integrationConfig-status',
    reducer: integrationConfigStatusReducer,
    items: [
      { id: 'Ready', title: 'Ready' },
      { id: 'UnReady', title: 'UnReady' },      
    ],
  },
];

export const IntegrationConfigsPage: React.FC<IntegrationConfigsPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage
    // title={t('COMMON:CD_MAILFORM_REQUEST_7')}
    // createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:CD_MAILFORM_REQUEST_7') })}
    rowFilters={filters.bind(null, t)()}
    canCreate={true}
    ListComponent={IntegrationConfigs}
    kind={kind}
    {...props}
  />;
}

export const IntegrationConfigsDetailsPage: React.FC<IntegrationConfigsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(IntegrationConfigDetails)), editResource()]} />;

type IntegrationConfigDetailsListProps = {
  ds: K8sResourceKind;
};

type IntegrationConfigsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type IntegrationConfigDetailsProps = {
  obj: K8sResourceKind;
};

type IntegrationConfigsDetailsPageProps = {
  match: any;
};

type IntegrationConfigStatusProps = {
  result: any;
};
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
import { TrainedModelModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

import { TrainedModelReducer } from '@console/dev-console/src/utils/hc-status-reducers';

export const TrainedModelStatus: React.FC<TrainedModelStatusProps> = ({ result }) => <Status status={TrainedModelReducer(result)} />;

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(TrainedModelModel), ...Kebab.factory.common];

const kind = TrainedModelModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const TrainedModelPhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
        if (cur.status === 'True') {
          phase = 'Ready';
        } else {
          phase = 'Not Ready';
        }
      }
    });
    return phase;
  }
};


const TrainedModelTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_COMMON_FILTER_16'),
      sortFunc: 'TrainedModelPhase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_100'),
      sortField: 'spec.model.framework',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_101'),
      sortField: 'status.url',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_138'),
      sortField: 'spec.model.storageUri',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[6] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[7] },
    },
  ];
};
TrainedModelTableHeader.displayName = 'TrainedModelTableHeader';

const TrainedModelTableRow: RowFunction<K8sResourceKind> = ({ obj: tm, index, key, style }) => {
  return (
    <TableRow id={tm.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={tm.metadata.name} namespace={tm.metadata.namespace} title={tm.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={tm.metadata.namespace} title={tm.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}><TrainedModelStatus result={tm} /></TableData>
      <TableData className={tableColumnClasses[3]}>{tm.spec.model.framework}</TableData>
      <TableData className={tableColumnClasses[4]}>{tm.status.url}</TableData>
      <TableData className={tableColumnClasses[5]}>{tm.spec.model.storageUri}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <Timestamp timestamp={tm.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[7]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={tm} />
      </TableData>
    </TableRow>
  );
};

export const TrainedModelDetailsList: React.FC<TrainedModelDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_COMMON_TABLEHEADER_2')} obj={ds} path="status.result">
        <TrainedModelStatus result={ds} />
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_LNB_MENU_193')} obj={ds} path="spec.inferenceService">
        <ResourceLink kind="InferenceService" namespace={ds.metadata.namespace} name={ds.spec.inferenceService} title={ds.spec.inferenceService} />
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_100')} obj={ds} path="spec.model.framework">
        {ds.spec.model.framework}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_140')} obj={ds} path="spec.model.memory">
        {ds.spec.model.memory}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_101')} obj={ds} path="status.url">
        {ds.status.url}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_138')} obj={ds} path="spec.model.storageUri">
        {ds.spec.model.storageUri}
      </DetailsItem>
    </dl>
  );
}



const TrainedModelDetails: React.FC<TrainedModelDetailsProps> = ({ obj: tm }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(tm, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={tm} />
          </div>
          <div className="col-lg-6">
            <TrainedModelDetailsList ds={tm} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const TrainedModels: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="TrainedModels" Header={TrainedModelTableHeader.bind(null, t)} Row={TrainedModelTableRow} virtualize />;
};

export const TrainedModelsPage: React.FC<TrainedModelsPageProps> = props => {
  const { t } = useTranslation();

  return (
    <ListPage
      title={t('COMMON:MSG_LNB_MENU_196')}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_196') })}
      canCreate={true}
      ListComponent={TrainedModels}
      kind={kind} {...props}
    />
  );
};




export const TrainedModelsDetailsPage: React.FC<TrainedModelsDetailsPageProps> = props => {
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      getResourceStatus={TrainedModelPhase}
      pages={[details(detailsPage(TrainedModelDetails)), editResource()]}
    />
  );
};


type TrainedModelDetailsListProps = {
  ds: K8sResourceKind;
};

type TrainedModelDetailsProps = {
  obj: K8sResourceKind;
};

type TrainedModelsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type TrainedModelsDetailsPageProps = {
  match: any;
};

type TrainedModelStatusProps = {
  result: any;
};
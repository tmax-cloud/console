import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, MultiListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { TrainingJobModel } from '../../models';
import { ResourceLabel, ResourceLabelPlural } from '../../models/hypercloud/resource-plural';
import { NO_STATUS } from '@console/shared/src/components/status';
import * as _ from 'lodash';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(TrainingJobModel), ...Kebab.factory.common];

export const tjKind = tj => {
  return tj.kind === 'PyTorchJob' ? 'PyTorchJob' : 'TFJob';
};

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const tjPhase = tj => {
  let len = tj.status.conditions.length;
  for (let i = len - 1; i >= 0; i--) {
    if (tj.status.conditions[i].status) {
      return tj.status.conditions[i].type;
    }
  }
};

const TJStatus = ({ tj }) => {
  const phase = tjPhase(tj);
  if (!phase) {
    return (
      <span className="text-muted">
        <i className="fa fa-hourglass-half" aria-hidden="true"></i> {NO_STATUS}
      </span>
    );
  }

  switch (phase) {
    case 'Running':
      return (
        <span className="text-muted">
          <i className="fa fa-hourglass-half" aria-hidden="true"></i> Running
        </span>
      );
    case 'Restarting':
      return (
        <span className="text-muted">
          <i className="fa fa-hourglass-half" aria-hidden="true"></i> Restarting
        </span>
      );
    case 'Created':
      return (
        <span className="pvc-bound">
          <i className="fa fa-check" aria-hidden="true"></i> Created
        </span>
      );
    case 'Succeeded':
      return (
        <span className="pvc-bound">
          <i className="fa fa-check" aria-hidden="true"></i> Succeeded
        </span>
      );
    case 'Failed':
      return (
        <span className="pvc-lost">
          <i className="fa fa-minus-circle" aria-hidden="true"></i> Failed
        </span>
      );
    default:
      return phase;
  }
};

const TJComposition = ({ tj }) => {
  const specs = tj?.spec && Object.entries(tj.spec);
  const keys = specs ? Object.keys(specs[0][1]) : [];
  let str = '';
  for (let i = 0; i < keys.length; i++) {
    str += `${keys[i]} ${specs[0][1][keys[i]].replicas}`;
    if (i !== keys.length - 1) {
      str += ', ';
    }
  }

  return <span className="pvc-lost">{str}</span>;
};

const TrainingJobTableHeader = (t?: TFunction) => {
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
      sortFunc: 'tjPhase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_15'),
      sortFunc: 'tjComposition',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[4] },
    },
  ];
};
TrainingJobTableHeader.displayName = 'TrainingJobTableHeader';

const TrainingJobTableRow: RowFunction<K8sResourceKind> = ({ obj: tj, index, key, style }) => {
  return (
    <TableRow id={tj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={tjKind(tj)} name={tj.metadata.name} namespace={tj.metadata.namespace} title={tj.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={tj.metadata.namespace} title={tj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <TJStatus tj={tj} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>{<TJComposition tj={tj} />}</TableData>
      <TableData className={tableColumnClasses[4]}>
        <ResourceKebab actions={menuActions} kind={tjKind(tj)} resource={tj} />
      </TableData>
    </TableRow>
  );
};

const TrainingJobDetails: React.FC<TrainingJobDetailsProps> = ({ obj: tj }) => {
  const { t } = useTranslation();
  const makeDetailTitle = kind => {
    switch (kind) {
      case 'PyTorchJob':
        return t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_143', { 0: t('COMMON:MSG_MAIN_BUTTON_5'), 1: ResourceLabel({ kind: 'TrainingJob' }, t) });
      case 'TFJob':
        return t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_143', { 0: t('COMMON:MSG_MAIN_BUTTON_4'), 1: ResourceLabel({ kind: 'TrainingJob' }, t) });
    }
  };
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={makeDetailTitle(tj.kind)} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={tj} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const TrainingJobs: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} label={ResourceLabelPlural(TrainingJobModel, t)} aria-label="TrainingJobs" Header={TrainingJobTableHeader.bind(null, t)} Row={TrainingJobTableRow} virtualize />;
};

export const TrainingJobsPage: React.FC<TrainingJobsPageProps> = props => {
  const { t } = useTranslation();

  const createItems = {
    tfjob: t('COMMON:MSG_MAIN_BUTTON_4'),
    pytorchjob: t('COMMON:MSG_MAIN_BUTTON_5'),
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/${type}s/~new`,
  };

  return (
    <MultiListPage
      showTitle
      title={ResourceLabelPlural(TrainingJobModel, t)}
      canCreate={true}
      ListComponent={TrainingJobs}
      namespace={props.namespace}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel(TrainingJobModel, t) })}
      createProps={createProps}
      flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
      resources={[
        { kind: 'TFJob', namespaced: true, optional: true },
        { kind: 'PyTorchJob', namespaced: true, optional: true },
      ]}
      rowFilters={[
        {
          filterGroupName: ResourceLabelPlural(TrainingJobModel, t),
          type: 'trainingjob-kind',
          reducer: tjKind,
          items: [
            { id: 'tfjob', title: t('COMMON:MSG_MAIN_BUTTON_4') },
            { id: 'pytorchjob', title: t('COMMON:MSG_MAIN_BUTTON_5') },
          ],
        },
      ]}
      {...props}
    />
  );
};

export const TrainingJobsDetailsPage: React.FC<TrainingJobsDetailsPageProps> = props => <DetailsPage {...props} menuActions={menuActions} pages={[details(detailsPage(TrainingJobDetails)), editResource()]} />;

type TrainingJobDetailsProps = {
  obj: K8sResourceKind;
};

type TrainingJobsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type TrainingJobsDetailsPageProps = {
  match: any;
  kind: string;
};

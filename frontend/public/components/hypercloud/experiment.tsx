import * as _ from 'lodash';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { ExperimentModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Status } from '@console/shared';
import { ExperimentStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ExperimentModel), ...Kebab.factory.common];

const kind = ExperimentModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const ExperimentTableHeader = (t?: TFunction) => {
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
      title: '알고리즘 이름',
      sortField: 'pec.algorithm.algorithmName',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '트라이얼 개수',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '최적화 상태',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};
ExperimentTableHeader.displayName = 'ExperimentTableHeader';

const getOptimizationStatus = obj => {
  const objective = obj.spec?.objective;
  const metrics = obj.status?.currentOptimalTrial?.observation?.metrics;

  switch (objective?.objectiveMetricName) {
    case 'accuracy':
    case 'Validation-accuracy': {
      const goal = objective.goal;
      const type = objective.type;
      const metric = metrics?.find(metric => metric.name === 'Validation-accuracy');
      if (!!metric) {
        const value = type === 'maximize' ? metric.max : metric.min;
        return `${value} / ${goal}`;
      } else {
        return `- / ${goal}`;
      }
    }
    case 'loss':
    case 'Validation-loss': {
      const goal = objective.goal;
      const type = objective.type;
      const metric = metrics?.find(metric => metric.name === 'Validation-loss');
      if (!!metric) {
        const value = type === 'maximize' ? metric.max : metric.min;
        return `${value} / ${goal}`;
      } else {
        return `- / ${goal}`;
      }
    }
    default:
      return '-';
  }
};

const ExperimentTableRow: RowFunction<K8sResourceKind> = ({ obj: experiment, index, key, style }) => {
  const trials = experiment.status?.trials || '-';
  const maxTrials = experiment.spec?.maxTrialCount || '-';
  return (
    <TableRow id={experiment.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={experiment.metadata.name} namespace={experiment.metadata.namespace} title={experiment.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={experiment.metadata.namespace} title={experiment.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>{experiment.spec?.algorithm?.algorithmName || '-'}</TableData>
      <TableData className={tableColumnClasses[3]}>{`${trials} / ${maxTrials}`}</TableData>
      <TableData className={tableColumnClasses[4]}>{getOptimizationStatus(experiment)}</TableData>
      <TableData className={tableColumnClasses[5]}>
        <Status status={ExperimentStatusReducer(experiment)} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={experiment} />
      </TableData>
    </TableRow>
  );
};

export const ExperimentDetailsList: React.FC<ExperimentDetailsListProps> = ({ experiment }) => {
  const { t } = useTranslation();
  const trials = experiment.status?.trials || '-';
  const maxTrials = experiment.spec?.maxTrialCount || '-';
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')} obj={experiment}>
        <Status status={ExperimentStatusReducer(experiment)} />
      </DetailsItem>
      <DetailsItem label={t('알고리즘 이름')} obj={experiment} path="spec.algorithm.algorithmName">
        {experiment.spec?.algorithm?.algorithmName}
      </DetailsItem>
      <DetailsItem label={t('트라이얼 개수')} obj={experiment}>
        {`${trials} / ${maxTrials}`}
      </DetailsItem>
      <DetailsItem label={t('최적화 상태')} obj={experiment}>
        {getOptimizationStatus(experiment)}
      </DetailsItem>
    </dl>
  );
};

const ExperimentDetails: React.FC<ExperimentDetailsProps> = ({ obj: experiment }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(experiment, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={experiment} />
          </div>
          <div className="col-lg-6">
            <ExperimentDetailsList experiment={experiment} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;
export const Experiments: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Experiments" Header={ExperimentTableHeader.bind(null, t)} Row={ExperimentTableRow} virtualize />;
};

export const ExperimentsPage: React.FC<ExperimentsPageProps> = props => <ListPage canCreate={true} ListComponent={Experiments} kind={kind} {...props} />;

export const ExperimentsDetailsPage: React.FC<ExperimentsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(ExperimentDetails)), editResource()]} />;

type ExperimentDetailsListProps = {
  experiment: K8sResourceKind;
};

type ExperimentDetailsProps = {
  obj: K8sResourceKind;
};

type ExperimentsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ExperimentsDetailsPageProps = {
  match: any;
};

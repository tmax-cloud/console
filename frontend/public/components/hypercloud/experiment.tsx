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

const ExperimentTableRow: RowFunction<K8sResourceKind> = ({ obj: experiment, index, key, style }) => {
  let experimentectiveMetricName = experiment.spec.experimentective?.experimentectiveMetricName;
  let currentOptimal = experimentectiveMetricName && experiment.status.currentOptimalTrial.observation.metrics ? experiment.status.currentOptimalTrial.observation.metrics.find(metric => metric.name === experimentectiveMetricName) : { value: 0 };
  let optimal = currentOptimal.value + '/' + experiment.spec.experimentective?.goal;
  return (
    <TableRow id={experiment.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={experiment.metadata.name} namespace={experiment.metadata.namespace} title={experiment.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={experiment.metadata.namespace} title={experiment.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>{experiment.spec.algorithm.algorithmName}</TableData>
      <TableData className={tableColumnClasses[3]}>{experiment.status.trials + '/' + experiment.spec.maxTrialCount}</TableData>
      <TableData className={tableColumnClasses[4]}>{optimal}</TableData>
      <TableData className={tableColumnClasses[5]}>{experiment.status.conditions.length ? experiment.status.conditions[experiment.status.conditions.length - 1].type : ''}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={experiment} />
      </TableData>
    </TableRow>
  );
};

export const ExperimentDetailsList: React.FC<ExperimentDetailsListProps> = ({ experiment }) => {
  let objectiveMetricName = experiment.spec.objective.objectiveMetricName;
  const metrics = _.get(experiment, 'status.currentOptimalTrial.observation.metrics');
  let currentOptimal = objectiveMetricName && Array.isArray(metrics) ? metrics.find(metric => metric.name === objectiveMetricName) : { value: 0 };
  let optimal = currentOptimal.value + '/' + experiment.spec.objective?.goal;

  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')} obj={experiment} path="status.conditions">
        {experiment.status.conditions.length ? experiment.status.conditions[experiment.status.conditions.length - 1].type : ''}
      </DetailsItem>
      <DetailsItem label={t('알고리즘 이름')} obj={experiment} path="spec.algorithm.algorithmName">
        {experiment.spec.algorithm.algorithmName}
      </DetailsItem>
      <DetailsItem label={t('트라이얼 개수')} obj={experiment} path="status.currentNumberScheduled">
        {experiment.status.trials + '/' + experiment.spec.maxTrialCount}
      </DetailsItem>
      <DetailsItem label={t('최적화 상태')} obj={experiment} path="status.desiredNumberScheduled">
        {optimal}
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

const { details, editYaml } = navFactory;
export const Experiments: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Experiments" Header={ExperimentTableHeader.bind(null, t)} Row={ExperimentTableRow} virtualize />;
};

export const ExperimentsPage: React.FC<ExperimentsPageProps> = props => <ListPage canCreate={true} ListComponent={Experiments} kind={kind} {...props} />;

export const ExperimentsDetailsPage: React.FC<ExperimentsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(ExperimentDetails)), editYaml()]} />;

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

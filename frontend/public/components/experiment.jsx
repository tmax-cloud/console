import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const ExperimentHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.algorithm.algorithmName">
        {t('CONTENT:ALGORITHMNAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs">
        {t('CONTENT:CURRENTTRIALS/MAXTRIALCOUNT')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs">
        {t('CONTENT:CURRENTOPTIMAL/OBJECTIVE')}
      </ColHead>
      <ColHead {...props} className="col-xs-1 col-sm-1">
        {t('CONTENT:STATUS')}
      </ColHead>
    </ListHeader>
  );
};

const ExperimentRow = () =>
  // eslint-disable-next-line no-shadow
  function ExperimentRow({ obj }) {
    let trial = obj.status.trials + '/' + obj.spec.maxTrialCount;
    let status = obj.status.conditions.length ? obj.status.conditions[obj.status.conditions.length - 1].type : '';
    let objectiveMetricName = obj.spec.objective.objectiveMetricName;
    let currentOptimal = objectiveMetricName && obj.status.currentOptimalTrial.observation.metrics ? obj.status.currentOptimalTrial.observation.metrics.find(metric => metric.name === objectiveMetricName) : { value: 0 };
    let optimal = currentOptimal.value + '/' + obj.spec.objective.goal;
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="Experiment" resource={obj} />
          <ResourceLink kind="Experiment" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.algorithm.algorithmName}</div>
        <div className="col-xs-2 col-sm-2 co-break-word">{trial}</div>
        <div className="col-xs-2 col-sm-2 co-break-word">{optimal}</div>
        <div className="col-xs-1 col-sm-1 co-break-word">{status}</div>
      </div>
    );
  };

const Details = ({ obj }) => {
  const { t } = useTranslation();
  let trial = obj.status.trials + '/' + obj.spec.maxTrialCount;
  let status = obj.status.conditions.length ? obj.status.conditions[obj.status.conditions.length - 1].type : '';
  let objectiveMetricName = obj.spec.objective.objectiveMetricName;
  let currentOptimal = objectiveMetricName ? obj.status.currentOptimalTrial.observation.metrics.find(metric => metric.name === objectiveMetricName) : { value: 0 };
  let optimal = currentOptimal.value + '/' + obj.spec.objective.goal;
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Experiment', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={obj} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{status}</dd>
              <dt>{t('CONTENT:ALGORITHMNAME')}</dt>
              <dd>{obj.spec.algorithm.algorithmName}</dd>
              <dt>{t('CONTENT:CURRENTTRIALS/MAXTRIALCOUNT')}</dt>
              <dd>{trial}</dd>
              <dt>{t('CONTENT:CURRENTOPTIMAL/OBJECTIVE')}</dt>
              <dd>{optimal}</dd>
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const ExperimentList = props => {
  const { kinds } = props;
  const Row = ExperimentRow(kinds[0]);
  Row.displayName = 'ExperimentRow';
  return <List {...props} Header={ExperimentHeader} Row={Row} />;
};
ExperimentList.displayName = ExperimentList;

export const ExperimentPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={ExperimentList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="Experiment" />;
};
ExperimentPage.displayName = 'ExperimentPage';

export const ExperimentDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} kind="Experiment" menuActions={menuActions} pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

ExperimentDetailsPage.displayName = 'ExperimentDetailsPage';

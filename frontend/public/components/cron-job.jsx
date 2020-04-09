import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, Timestamp } from './utils';
import { ResourceEventStream } from './events';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.Edit, Cog.factory.Delete];

const Header = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-3 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 hidden-xs" sortField="spec.schedule">
        {t('CONTENT:SCHEDULE')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-3 hidden-sm hidden-xs" sortField="spec.schedule">
        {t('CONTENT:CONCURRENCYPOLICY')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs" sortField="spec.schedule">
        {t('CONTENT:STARTINGDEADLINESECONDS')}
      </ColHead>
    </ListHeader>
  );
};

const kind = 'CronJob';
const Row = ({ obj: cronjob }) => (
  <div className="row co-resource-list__item">
    <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind={kind} resource={cronjob} />
      <ResourceLink kind={kind} name={cronjob.metadata.name} title={cronjob.metadata.name} namespace={cronjob.metadata.namespace} />
    </div>
    <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6 co-break-word">
      <ResourceLink kind="Namespace" name={cronjob.metadata.namespace} title={cronjob.metadata.namespace} />
    </div>
    <div className="col-lg-2 col-md-3 col-sm-4 hidden-xs">{cronjob.spec.schedule}</div>
    <div className="col-lg-2 col-md-3 hidden-sm hidden-xs">{_.get(cronjob.spec, 'concurrencyPolicy', '-')}</div>
    <div className="col-lg-2 hidden-md hidden-sm hidden-xs">{_.get(cronjob.spec, 'startingDeadlineSeconds', '-')}</div>
  </div>
);

const Details = ({ obj: cronjob }) => {
  const job = cronjob.spec.jobTemplate;
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-md-6">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('CRONJOB', t) })} />
          <ResourceSummary resource={cronjob} showNodeSelector={false} showPodSelector={false} showAnnotations={false}>
            <dt>{t('CONTENT:SCHEDULE')}</dt>
            <dd>{cronjob.spec.schedule}</dd>
            <dt>{t('CONTENT:CONCURRENCYPOLICY')}</dt>
            <dd>{cronjob.spec.concurrencyPolicy || '-'}</dd>
            <dt>{t('CONTENT:STARTINGDEADLINESECONDS')}</dt>
            <dd>{cronjob.spec.startingDeadlineSeconds || '-'}</dd>
            <dt>{t('CONTENT:LASTSCHEDULETIME')}</dt>
            <dd>
              <Timestamp timestamp={cronjob.status.lastScheduleTime} />
            </dd>
          </ResourceSummary>
        </div>
        <div className="col-md-6">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Job', t) })} />
          <dl className="co-m-pane__details">
            <dt>{t('CONTENT:DESIREDCOMPLETIONS')}</dt>
            <dd>{job.spec.completions || '-'}</dd>
            <dt>{t('CONTENT:PARALLELISM')}</dt>
            <dd>{job.spec.parallelism || '-'}</dd>
            <dt>{t('CONTENT:DEADLINE')}</dt>
            <dd>{job.spec.activeDeadlineSeconds ? `${job.spec.activeDeadlineSeconds} seconds` : '-'}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const CronJobsList = props => <List {...props} Header={Header} Row={Row} />;
export const CronJobsPage = props => <ListPage {...props} ListComponent={CronJobsList} kind={kind} canCreate={true} />;

export const CronJobsDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(Details), navFactory.editYaml(), navFactory.events(ResourceEventStream)]} />;

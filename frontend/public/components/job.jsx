import * as React from 'react';
import { Link } from 'react-router-dom';

import { getJobTypeAndCompletions } from '../module/k8s';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { configureJobParallelismModal } from './modals';
import { Cog, SectionHeading, LabelList, ResourceCog, ResourceLink, ResourceSummary, Timestamp, navFactory } from './utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
import { ResourceEventStream } from './events';

const ModifyJobParallelism = (kind, obj) => ({
  label: 'Edit Parallelism',
  callback: () =>
    configureJobParallelismModal({
      resourceKind: kind,
      resource: obj,
    }),
});
const menuActions = [ModifyJobParallelism, ...Cog.factory.common];

const JobHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-4 col-md-4 col-sm-4 hidden-xs" sortField="metadata.labels">
        {t('CONTENT:LABELS')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortFunc="jobCompletions">
        {t('CONTENT:COMPLETIONS')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs" sortFunc="jobType">
        {t('CONTENT:TYPE')}
      </ColHead>
    </ListHeader>
  );
};

const JobRow = ({ obj: job }) => {
  const { type, completions } = getJobTypeAndCompletions(job);
  return (
    <ResourceRow obj={job}>
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind="Job" resource={job} />
        <ResourceLink kind="Job" name={job.metadata.name} namespace={job.metadata.namespace} title={job.metadata.uid} />
      </div>
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">
        <ResourceLink kind="Namespace" name={job.metadata.namespace} title={job.metadata.namespace} />
      </div>
      <div className="col-lg-4 col-md-4 col-sm-4 hidden-xs">
        <LabelList kind="Job" labels={job.metadata.labels} />
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
        <Link to={`/k8s/ns/${job.metadata.namespace}/jobs/${job.metadata.name}/pods`} title="pods">
          {job.status.succeeded || 0} of {completions}
        </Link>
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">{type}</div>
    </ResourceRow>
  );
};

const Details = ({ obj: job }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-md-6">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Job', t) })} />
          <ResourceSummary resource={job} showNodeSelector={false}>
            <dt>{t('CONTENT:DESIREDCOMPLETIONS')}</dt>
            <dd>{job.spec.completions || '-'}</dd>
            <dt>{t('CONTENT:PARALLELISM')}</dt>
            <dd>{job.spec.parallelism || '-'}</dd>
            <dt>{t('CONTENT:DEADLINE')}</dt>
            <dd>{job.spec.activeDeadlineSeconds ? `${job.spec.activeDeadlineSeconds} ${t('CONTENT:SECONDS')}` : '-'}</dd>
          </ResourceSummary>
        </div>
        <div className="col-md-6">
          <SectionHeading text={t('CONTENT:JOBSTATUS')} />
          <dl className="co-m-pane__details">
            <dt>{t('CONTENT:STATUS')}</dt>
            <dd>{job.status.conditions ? job.status.conditions[0].type : t('CONTENT:INPROGRESS')}</dd>
            <dt>{t('CONTENT:STARTTIME')}</dt>
            <dd>
              <Timestamp timestamp={job.status.startTime} />
            </dd>
            <dt>{t('CONTENT:COMPLETIONTIME')}</dt>
            <dd>
              <Timestamp timestamp={job.status.completionTime} />
            </dd>
            <dt>{t('CONTENT:SUCCEEDEDPODS')}</dt>
            <dd>{job.status.succeeded || 0}</dd>
            <dt>{t('CONTENT:ACTIVEPODS')}</dt>
            <dd>{job.status.active || 0}</dd>
            <dt>{t('CONTENT:FAILEDPODS')}</dt>
            <dd>{job.status.failed || 0}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

const { details, pods, editYaml, events } = navFactory;
const JobsDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} menuActions={menuActions} pages={[details(Details, t('CONTENT:OVERVIEW')), editYaml(), pods(t('CONTENT:PODS')), events(ResourceEventStream, t('CONTENT:EVENTS'))]} />;
};
const JobsList = props => <List {...props} Header={JobHeader} Row={JobRow} />;
const JobsPage = props => <ListPage ListComponent={JobsList} canCreate={true} {...props} />;
export { JobsList, JobsPage, JobsDetailsPage };

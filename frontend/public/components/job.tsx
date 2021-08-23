import * as React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Status } from '@console/shared';
import { getJobTypeAndCompletions, K8sKind, JobKind, K8sResourceKind } from '../module/k8s';
import { Conditions } from './conditions';
import { DetailsPage, ListPage } from './factory';
import { configureJobParallelismModal } from './modals';
import { ContainerTable, DetailsItem, Kebab, KebabAction, LabelList, PodsComponent, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp, navFactory, pluralize, TableProps } from './utils';
import { ResourceEventStream } from './events';
import { JobModel } from '../models';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

const ModifyJobParallelism: KebabAction = (kind: K8sKind, obj: JobKind) => {
  const { t } = useTranslation();
  return {
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_10',
    callback: () =>
      configureJobParallelismModal({
        resourceKind: kind,
        resource: obj,
        title: t('SINGLE:MSG_JOBS_EDITJOBS_EDITPARALLELISM_1'),
        message: t('SINGLE:MSG_JOBS_EDITJOBS_EDITPARALLELISM_2'),
        submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_3'),
        cancelText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_2'),
      }),
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      verb: 'patch',
    },
  };
};
const menuActions: KebabAction[] = [ModifyJobParallelism, ...Kebab.getExtensionsActionsForKind(JobModel), ...Kebab.factory.common];

const kind = JobModel.kind;

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
      sortField: 'metadata.labels',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_22',
      sortFunc: 'jobCompletions',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_17',
      sortFunc: 'jobType',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortFunc: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: JobKind) => {
    const { type, completions } = getJobTypeAndCompletions(obj);
    return [
      {
        children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
      },
      {
        children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
      },
      {
        children: <LabelList kind={kind} labels={obj.metadata.labels} />,
      },
      {
        children: (
          <Link to={`/k8s/ns/${obj.metadata.namespace}/jobs/${obj.metadata.name}/pods`} title="pods">
            {obj.status.succeeded || 0} of {completions}
          </Link>
        ),
      },
      {
        children: type,
      },
      {
        children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
      },
      {
        className: Kebab.columnClass,
        children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
      },
    ];
  },
};

const jobStatus = (job: JobKind): string => {
  return job && job.status ? _.get(job, 'status.conditions[0].type', 'In Progress') : null;
};

const JobDetails: React.FC<JobsDetailsProps> = ({ obj: job }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <div className="row">
          <div className="col-md-6">
            <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(job, t) })} />
            <ResourceSummary resource={job} showPodSelector>
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_35')} obj={job} path="spec.completions" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_36')} obj={job} path="spec.parallelism" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_37')} obj={job} path="spec.activeDeadlineSeconds">
                {job.spec.activeDeadlineSeconds ? pluralize(job.spec.activeDeadlineSeconds, 'second') : 'Not Configured'}
              </DetailsItem>
            </ResourceSummary>
          </div>
          <div className="col-md-6">
            <SectionHeading text={t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_1')} />
            <dl className="co-m-pane__details">
              <dt>{t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_2')}</dt>
              <dd>
                <Status status={jobStatus(job)} />
              </dd>
              <DetailsItem label={t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_3')} obj={job} path="status.startTime">
                <Timestamp timestamp={job.status.startTime} />
              </DetailsItem>
              <DetailsItem label={t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_4')} obj={job} path="status.completionTime">
                <Timestamp timestamp={job.status.completionTime} />
              </DetailsItem>
              <DetailsItem label={t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_5')} obj={job} path="status.succeeded" defaultValue="0" />
              <DetailsItem label={t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_6')} obj={job} path="status.active" defaultValue="0" />
              <DetailsItem label={t('SINGLE:MSG_JOBS_JOBDETAILS_TABDETAILS_JOBSTATUS_7')} obj={job} path="status.failed" defaultValue="0" />
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
        <ContainerTable containers={job.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONDITIONS_1')} />
        <Conditions conditions={job.status.conditions} />
      </div>
    </>
  );
};

const JobPods: React.FC<JobPodsProps> = props => <PodsComponent {...props} customData={{ showNodes: true }} />;

const { details, pods, editResource, events } = navFactory;
const JobsDetailsPage: React.FC<JobsDetailsPageProps> = props => <DetailsPage {...props} getResourceStatus={jobStatus} kind={kind} menuActions={menuActions} pages={[details(JobDetails), editResource(), pods(JobPods), events(ResourceEventStream)]} />;

const JobsPage: React.FC = props => {
  return <ListPage tableProps={tableProps} kind={kind} canCreate={true} {...props} />;
};
export { JobsPage, JobsDetailsPage };

type JobsDetailsProps = {
  obj: JobKind;
};

type JobPodsProps = {
  obj: K8sResourceKind;
};

type JobsDetailsPageProps = {
  match: any;
};

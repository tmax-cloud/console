import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DetailsPage, ListPage } from './factory';
import { CronJobKind } from '../module/k8s';
import { ContainerTable, DetailsItem, Kebab, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp, navFactory, pluralize, TableProps } from './utils';
import { ResourceEventStream } from './events';
import { CronJobModel } from '../models';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(CronJobModel), ...common];

const kind = CronJobModel.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_19',
      sortField: 'spec.schedule',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_20',
      sortField: 'spec.concurrencyPolicy',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_21',
      sortField: 'spec.startingDeadlineSeconds',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: CronJobKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} title={obj.metadata.name} namespace={obj.metadata.namespace} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: obj.spec.schedule,
    },
    {
      children: _.get(obj.spec, 'concurrencyPolicy', '-'),
    },
    {
      children: _.get(obj.spec, 'startingDeadlineSeconds', '-'),
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const CronJobDetails: React.FC<CronJobDetailsProps> = ({ obj: cronjob }) => {
  const { t } = useTranslation();
  const job = cronjob.spec.jobTemplate;
  return (
    <>
      <div className="co-m-pane__body">
        <div className="row">
          <div className="col-md-6">
            <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(cronjob, t) })} />
            <ResourceSummary resource={cronjob}>
              <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_19')} obj={cronjob} path="spec.schedule" />
              <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_20')} obj={cronjob} path="spec.concurrencyPolicy" />
              <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_21')} obj={cronjob} path="spec.startingDeadlineSeconds">
                {cronjob.spec.startingDeadlineSeconds ? pluralize(cronjob.spec.startingDeadlineSeconds, 'second') : t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_33')}
              </DetailsItem>
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_34')} obj={cronjob} path="status.lastScheduleTime">
                <Timestamp timestamp={cronjob.status.lastScheduleTime} />
              </DetailsItem>
            </ResourceSummary>
          </div>
          <div className="col-md-6">
            <SectionHeading text={`${t('COMMON:MSG_LNB_MENU_29')} ${t('COMMON:MSG_DETAILS_TABOVERVIEW_1')}`} />
            <dl className="co-m-pane__details">
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_35')} obj={cronjob} path="spec.jobTemplate.spec.completions" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_36')} obj={cronjob} path="spec.jobTemplate.spec.parallelism" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_37')} obj={cronjob} path="spec.jobTemplate.spec.activeDeadlineSeconds">
                {job.spec.activeDeadlineSeconds ? pluralize(job.spec.activeDeadlineSeconds, 'second') : t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_33')}
              </DetailsItem>
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
        <ContainerTable containers={job.spec.template.spec.containers} />
      </div>
    </>
  );
};

export const CronJobsPage: React.FC = props => {
  return <ListPage {...props} tableProps={tableProps} kind={kind} canCreate={true} />;
};

export const CronJobsDetailsPage: React.FC<CronJobsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[navFactory.details(CronJobDetails), navFactory.editResource(), navFactory.events(ResourceEventStream)]} />;

type CronJobDetailsProps = {
  obj: CronJobKind;
};

type CronJobsDetailsPageProps = {
  match: any;
};

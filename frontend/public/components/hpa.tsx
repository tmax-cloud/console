import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { K8sResourceKind } from '../module/k8s';
import { useTranslation } from 'react-i18next';
import { HorizontalPodAutoscalerModel } from '../models';
import { Conditions } from './conditions';
import { DetailsPage, ListPage } from './factory';
import { DetailsItem, Kebab, LabelList, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp, navFactory, TableProps } from './utils';
import { ResourceEventStream } from './events';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(HorizontalPodAutoscalerModel), ...common];

const MetricsRow: React.FC<MetricsRowProps> = ({ type, current, target }) => (
  <div className="row">
    <div className="col-xs-6">{type}</div>
    <div className="col-xs-3">{current || '-'}</div>
    <div className="col-xs-3">{target || '-'}</div>
  </div>
);

const externalRow = (metric, current, key) => {
  const { external } = metric;
  const type = external.metricName;
  // TODO: show metric selector for external metrics?
  const currentValue = external.targetAverageValue ? _.get(current, 'object.currentAverageValue') : _.get(current, 'object.currentValue');
  const targetValue = external.targetAverageValue ? external.targetAverageValue : external.targetValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const objectRow = (metric, current, ns, key) => {
  const { object } = metric;
  const type = (
    <>
      {object.metricName} on
      <ResourceLink kind={object.target.kind} name={object.target.name} namespace={ns} title={object.target.name} />
    </>
  );
  const currentValue = _.get(current, 'object.currentValue');
  const targetValue = object.targetValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const podRow = (metric, current, key) => {
  const { pods } = metric;
  const type = `${pods.metricName} on pods`;
  const currentValue = _.get(current, 'pods.currentAverageValue');
  const targetValue = pods.targetAverageValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const getResourceUtilization = currentMetric => {
  const currentUtilization = _.get(currentMetric, 'resource.currentAverageUtilization');

  // Use _.isFinite so that 0 evaluates to true, but null / undefined / NaN don't
  if (!_.isFinite(currentUtilization)) {
    return null;
  }

  const currentAverageValue = _.get(currentMetric, 'resource.currentAverageValue');
  // Only show currentAverageValue in parens if set and non-zero to avoid things like "0% (0)"
  return currentAverageValue && currentAverageValue !== '0' ? `${currentUtilization}% (${currentAverageValue})` : `${currentUtilization}%`;
};

const resourceRow = (metric, current, key) => {
  const targetUtilization = metric.resource.targetAverageUtilization;
  const resourceLabel = `resource ${metric.resource.name}`;
  const type = targetUtilization ? (
    <>
      {resourceLabel}&nbsp;<span className="small text-muted">(as a percentage of request)</span>
    </>
  ) : (
    resourceLabel
  );
  const currentValue = targetUtilization ? getResourceUtilization(current) : _.get(current, 'resource.currentAverageValue');
  const targetValue = targetUtilization ? `${targetUtilization}%` : metric.resource.targetAverageValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const MetricsTable: React.FC<MetricsTableProps> = ({ obj: hpa }) => {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_METRICS_TABLEHEADER_1')} />
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-xs-6">{t('COMMON:MSG_DETAILS_TABDETAILS_METRICS_TABLEHEADER_2')}</div>
          <div className="col-xs-3">{t('COMMON:MSG_DETAILS_TABDETAILS_METRICS_TABLEHEADER_4')}</div>
          <div className="col-xs-3">{t('COMMON:MSG_DETAILS_TABDETAILS_METRICS_TABLEHEADER_5')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {hpa.spec.metrics.map((metric, i) => {
            // https://github.com/kubernetes/api/blob/master/autoscaling/v2beta1/types.go
            const current = _.get(hpa, ['status', 'currentMetrics', i]);
            switch (metric.type) {
              case 'External':
                return externalRow(metric, current, i);
              case 'Object':
                return objectRow(metric, current, hpa.metadata.namespace, i);
              case 'Pods':
                return podRow(metric, current, i);
              case 'Resource':
                return resourceRow(metric, current, i);
              default:
                return (
                  <div key={i} className="row">
                    <div className="col-xs-12">
                      {metric.type} <span className="small text-muted">(unrecognized type)</span>
                    </div>
                  </div>
                );
            }
          })}
        </div>
      </div>
    </>
  );
};

export const HorizontalPodAutoscalersDetails: React.FC<HorizontalPodAutoscalersDetailsProps> = ({ obj: hpa }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(hpa, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={hpa} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_54')} obj={hpa} path="spec.scaleTargetRef">
                <ResourceLink kind={hpa.spec.scaleTargetRef.kind} name={hpa.spec.scaleTargetRef.name} namespace={hpa.metadata.namespace} title={hpa.spec.scaleTargetRef.name} />
              </DetailsItem>
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_55')} obj={hpa} path="spec.minReplicas" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_56')} obj={hpa} path="spec.maxReplicas" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_57')} obj={hpa} path="status.lastScaleTime">
                <Timestamp timestamp={hpa.status.lastScaleTime} />
              </DetailsItem>
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_58')} obj={hpa} path="status.currentReplicas" />
              <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_59')} obj={hpa} path="status.desiredReplicas" />
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <MetricsTable obj={hpa} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONDITIONS_1')} />
        <Conditions conditions={hpa.status.conditions} />
      </div>
    </>
  );
};

const pages = [navFactory.details(HorizontalPodAutoscalersDetails), navFactory.editResource(), navFactory.events(ResourceEventStream)];
export const HorizontalPodAutoscalersDetailsPage: React.FC<HorizontalPodAutoscalersDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={pages} />;
HorizontalPodAutoscalersDetailsPage.displayName = 'HorizontalPodAutoscalersDetailsPage';

const kind = HorizontalPodAutoscalerModel.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_23',
      sortField: 'spec.scaleTargetRef.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_24',
      sortField: 'spec.minReplicas',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_25',
      sortField: 'spec.maxReplicas',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    {
      className: classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'co-break-word'),
      children: <ResourceLink kind={obj.spec.scaleTargetRef.kind} name={obj.spec.scaleTargetRef.name} namespace={obj.metadata.namespace} title={obj.spec.scaleTargetRef.name} />,
    },
    {
      children: obj.spec.minReplicas,
    },
    {
      children: obj.spec.maxReplicas,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const HorizontalPodAutoscalersPage: React.FC = props => {
  return <ListPage {...props} tableProps={tableProps} canCreate={true} kind={kind} />;
};
HorizontalPodAutoscalersPage.displayName = 'HorizontalPodAutoscalersListPage';

export type HorizontalPodAutoscalersDetailsProps = {
  obj: any;
};

export type HorizontalPodAutoscalersDetailsPageProps = {
  match: any;
};

type MetricsTableProps = {
  obj: any;
};

type MetricsRowProps = {
  type: any;
  current: any;
  target: any;
};

import * as React from 'react';
import * as _ from 'lodash-es';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import UtilizationItem, { TopConsumerPopoverProp, MultilineUtilizationItem, QueryWithDescription, LimitRequested } from '@console/shared/src/components/dashboard/utilization-card/UtilizationItem';
import UtilizationBody from '@console/shared/src/components/dashboard/utilization-card/UtilizationBody';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';
import { useExtensions, DashboardsOverviewUtilizationItem, isDashboardsOverviewUtilizationItem } from '@console/plugin-sdk';
import { DashboardItemProps, withDashboardResources } from '../../with-dashboard-resources';
import { humanizeBinaryBytes, humanizeCpuCores, humanizeNumber, humanizeDecimalBytesPerSec } from '../../../utils/units';
import { getRangeVectorStats, getInstantVectorStats } from '../../../graphs/utils';
import { Dropdown } from '../../../utils/dropdown';
import { OverviewQuery, utilizationQueries, multilineQueries } from './queries';
import { getPrometheusQueryResponse } from '../../../../actions/dashboards';
import { Humanize } from '../../../utils/types';
import { useMetricDuration, UTILIZATION_QUERY_HOUR_MAP } from '@console/shared/src/components/dashboard/duration-hook';
import { DataPoint, PrometheusResponse } from '../../../graphs';
import { useTranslation } from 'react-i18next';

const mapStatsWithDesc = (stats: PrometheusResponse, description: DataPoint['description']): DataPoint[] =>
  getRangeVectorStats(stats).map(dp => {
    dp.x.setSeconds(0, 0);
    return {
      ...dp,
      description,
    };
  });

export const PrometheusUtilizationItem = withDashboardResources<PrometheusUtilizationItemProps>(({ watchPrometheus, stopWatchPrometheusQuery, prometheusResults, utilizationQuery, totalQuery, duration, adjustDuration, title, TopConsumerPopover, humanizeValue, byteDataType, setTimestamps, namespace, isDisabled = false, limitQuery, requestQuery, setLimitReqState }) => {
  let stats: DataPoint[] = [];
  let limitStats: DataPoint[];
  let requestStats: DataPoint[];
  let utilization: PrometheusResponse, utilizationError: any;
  let total: PrometheusResponse, totalError: any;
  let max: DataPoint<number>[];
  let limit: PrometheusResponse, limitError: any;
  let request: PrometheusResponse, requestError: any;
  let isLoading = false;

  const effectiveDuration = React.useMemo(() => (adjustDuration ? adjustDuration(UTILIZATION_QUERY_HOUR_MAP[duration]) : UTILIZATION_QUERY_HOUR_MAP[duration]), [adjustDuration, duration]);
  React.useEffect(() => {
    if (!isDisabled) {
      watchPrometheus(utilizationQuery, namespace, effectiveDuration);
      totalQuery && watchPrometheus(totalQuery, namespace);
      limitQuery && watchPrometheus(limitQuery, namespace, effectiveDuration);
      requestQuery && watchPrometheus(requestQuery, namespace, effectiveDuration);
      return () => {
        stopWatchPrometheusQuery(utilizationQuery, effectiveDuration);
        totalQuery && stopWatchPrometheusQuery(totalQuery);
        limitQuery && stopWatchPrometheusQuery(limitQuery, effectiveDuration);
        requestQuery && stopWatchPrometheusQuery(requestQuery, effectiveDuration);
      };
    }
  }, [watchPrometheus, stopWatchPrometheusQuery, effectiveDuration, utilizationQuery, totalQuery, namespace, isDisabled, limitQuery, requestQuery]);

  if (!isDisabled) {
    [utilization, utilizationError] = getPrometheusQueryResponse(prometheusResults, utilizationQuery, effectiveDuration);
    [total, totalError] = getPrometheusQueryResponse(prometheusResults, totalQuery);
    [limit, limitError] = getPrometheusQueryResponse(prometheusResults, limitQuery, effectiveDuration);
    [request, requestError] = getPrometheusQueryResponse(prometheusResults, requestQuery, effectiveDuration);

    stats = mapStatsWithDesc(utilization, (date, value) => `${value} at ${date}`);
    max = getInstantVectorStats(total);
    if (limit) {
      limitStats = mapStatsWithDesc(limit, (date, value) => `${value} total limit`);
    }
    if (request) {
      requestStats = mapStatsWithDesc(request, (date, value) => `${value} total requested`);
    }

    setTimestamps && setTimestamps(stats.map(stat => stat.x as Date));
    isLoading = !utilization || (totalQuery && !total) || (limitQuery && !limit);
  }

  return <UtilizationItem title={title} data={stats} limit={limitStats} requested={requestStats} error={utilizationError || totalError || limitError || requestError} isLoading={isLoading} humanizeValue={humanizeValue} byteDataType={byteDataType} query={utilizationQuery} max={max && max.length ? max[0].y : null} TopConsumerPopover={TopConsumerPopover} setLimitReqState={setLimitReqState} />;
});

export const PrometheusMultilineUtilizationItem = withDashboardResources<PrometheusMultilineUtilizationItemProps>(({ watchPrometheus, stopWatchPrometheusQuery, prometheusResults, queries, duration, adjustDuration, title, TopConsumerPopovers, humanizeValue, byteDataType, namespace, isDisabled = false }) => {
  const effectiveDuration = React.useMemo(() => (adjustDuration ? adjustDuration(UTILIZATION_QUERY_HOUR_MAP[duration]) : UTILIZATION_QUERY_HOUR_MAP[duration]), [adjustDuration, duration]);
  React.useEffect(() => {
    if (!isDisabled) {
      queries.forEach(q => watchPrometheus(q.query, namespace, effectiveDuration));
      return () => {
        queries.forEach(q => stopWatchPrometheusQuery(q.query, effectiveDuration));
      };
    }
  }, [watchPrometheus, stopWatchPrometheusQuery, duration, queries, namespace, isDisabled, effectiveDuration]);

  const stats = [];
  let hasError = false;
  let isLoading = false;
  if (!isDisabled) {
    _.forEach(queries, (query, index) => {
      const [response, responseError] = getPrometheusQueryResponse(prometheusResults, query.query, effectiveDuration);
      if (responseError) {
        hasError = true;
        return false;
      }
      if (!response) {
        isLoading = true;
        return false;
      }
      stats.push(
        mapStatsWithDesc(response, (date, value) => {
          const text = `${query.desc.toUpperCase()}: ${value}`;
          return index ? text : `${date}\n${text}`;
        }),
      );
    });
  }

  return <MultilineUtilizationItem title={title} data={stats} error={hasError} isLoading={isLoading} humanizeValue={humanizeValue} byteDataType={byteDataType} queries={queries} TopConsumerPopovers={TopConsumerPopovers} />;
});

const getQueries = (itemExtensions: DashboardsOverviewUtilizationItem[]) => {
  const pluginQueries = {};
  itemExtensions.forEach(e => {
    if (!pluginQueries[e.properties.id]) {
      pluginQueries[e.properties.id] = {
        utilization: e.properties.query,
        total: e.properties.totalQuery,
      };
    }
  });
  return _.defaults(pluginQueries, utilizationQueries);
};

export const UtilizationCard = () => {
  const { t } = useTranslation();
  const itemExtensions = useExtensions<DashboardsOverviewUtilizationItem>(isDashboardsOverviewUtilizationItem);

  const queries = React.useMemo(() => getQueries(itemExtensions), [itemExtensions]);

  const [timestamps, setTimestamps] = React.useState<Date[]>();
  const [duration, setDuration] = useMetricDuration();

  const cpuPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => {
      return <div>{current}</div>;
    }),
    [],
  );

  const memPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => {
      return <div>{current}</div>;
    }),
    [],
  );

  const storagePopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => {
      return <div>{current}</div>;
    }),
    [],
  );

  const podPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => {
      return <div>{current}</div>;
    }),
    [],
  );

  const networkInPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => {
      return <div>{current}</div>;
    }),
    [],
  );

  const networkOutPopover = React.useCallback(
    React.memo<TopConsumerPopoverProp>(({ current }) => {
      return <div>{current}</div>;
    }),
    [],
  );

  let durationItems = {
    ['ONE_HR']: t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_1_1'),
    ['SIX_HR']: t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_6_1'),
    ['TWENTY_FOUR_HR']: t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_24_1'),
  };

  let durationValues = {
    [t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_1_1')]: '1 Hour',
    [t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_6_1')]: '6 Hours',
    [t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_24_1')]: '24 Hours',
  };

  React.useEffect(() => {
    durationItems = {
      ['ONE_HR']: t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_1_1'),
      ['SIX_HR']: t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_6_1'),
      ['TWENTY_FOUR_HR']: t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_24_1'),
    };
    durationValues = {
      [t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_1_1')]: '1 Hour',
      [t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_6_1')]: '6 Hours',
      [t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_24_1')]: '24 Hours',
    };
  }, [duration]);

  return (
    <DashboardCard data-test-id="utilization-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_CLUSTERUTILIZATION_1')}</DashboardCardTitle>
        <Dropdown items={durationItems} onChange={setDuration} selectedKey={durationValues[duration]} title={duration} />
      </DashboardCardHeader>
      <UtilizationBody timestamps={timestamps}>
        <PrometheusUtilizationItem title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_CPU_1')} utilizationQuery={queries[OverviewQuery.CPU_UTILIZATION].utilization} totalQuery={queries[OverviewQuery.CPU_UTILIZATION].total} TopConsumerPopover={cpuPopover} duration={durationValues[duration]} humanizeValue={humanizeCpuCores} setTimestamps={setTimestamps} />
        <PrometheusUtilizationItem title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_MEMORY_1')} utilizationQuery={queries[OverviewQuery.MEMORY_UTILIZATION].utilization} totalQuery={queries[OverviewQuery.MEMORY_UTILIZATION].total} TopConsumerPopover={memPopover} duration={durationValues[duration]} humanizeValue={humanizeBinaryBytes} byteDataType={ByteDataTypes.BinaryBytes} />
        <PrometheusUtilizationItem title={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_81')} utilizationQuery={queries[OverviewQuery.STORAGE_UTILIZATION].utilization} totalQuery={queries[OverviewQuery.STORAGE_UTILIZATION].total} TopConsumerPopover={storagePopover} duration={durationValues[duration]} humanizeValue={humanizeBinaryBytes} byteDataType={ByteDataTypes.BinaryBytes} />
        <PrometheusMultilineUtilizationItem title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDCLUSTERUTILIZATION_NETWORK_1')} queries={multilineQueries[OverviewQuery.NETWORK_UTILIZATION]} duration={durationValues[duration]} humanizeValue={humanizeDecimalBytesPerSec} TopConsumerPopovers={[networkInPopover, networkOutPopover]} />
        <PrometheusUtilizationItem title={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_78')} utilizationQuery={queries[OverviewQuery.POD_UTILIZATION].utilization} TopConsumerPopover={podPopover} duration={durationValues[duration]} humanizeValue={humanizeNumber} />
      </UtilizationBody>
    </DashboardCard>
  );
};

type PrometheusCommonProps = {
  duration: string;
  adjustDuration?: (start: number) => number;
  title: string;
  humanizeValue: Humanize;
  byteDataType?: ByteDataTypes;
  namespace?: string;
  isDisabled?: boolean;
};

type PrometheusUtilizationItemProps = DashboardItemProps &
  PrometheusCommonProps & {
    utilizationQuery: string;
    totalQuery?: string;
    limitQuery?: string;
    requestQuery?: string;
    TopConsumerPopover?: React.ComponentType<TopConsumerPopoverProp>;
    setTimestamps?: (timestamps: Date[]) => void;
    setLimitReqState?: (state: LimitRequested) => void;
  };

type PrometheusMultilineUtilizationItemProps = DashboardItemProps &
  PrometheusCommonProps & {
    queries: QueryWithDescription[];
    TopConsumerPopovers?: React.ComponentType<TopConsumerPopoverProp>[];
  };

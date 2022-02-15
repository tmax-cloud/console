import * as React from 'react';
import * as _ from 'lodash-es';
import { timeFormat } from 'd3-time-format';
import { ChartAxis } from '@patternfly/react-charts';
import { Dropdown, usePoll, useSafeFetch } from '../utils';
import { humanizeBinaryBytes, humanizeCpuCores } from '../utils/units';
import { twentyFourHourTime } from '../utils/datetime';
import { DataPoint } from '../graphs';
import { AreaChart, AreaChartProps } from '../graphs/area';

const DEFAULT_DELAY = 15000; // 15 seconds
const DEFAULT_TIMESPAN = 60 * 60 * 1000; // 1 hour
const DEFAULT_SORT = '-metering_time';
const DEFAULT_LIMIT = 10;
const DEFAULT_TICK_COUNT = 3;

const getHCMeteringURL = (props: MeteringURLProps): string => {
  const params = new URLSearchParams();
  _.each(props, (value, key) => value && params.append(key, value.toString()));
  return `/api/hypercloud/metering?${params.toString()}`;
};

const useMeteringPoll = ({ delay = DEFAULT_DELAY, timespan = DEFAULT_TIMESPAN, ...rest }: MeteringPollProps) => {
  const url = getHCMeteringURL(rest);
  const [error, setError] = React.useState();
  const [response, setResponse] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const safeFetch = useSafeFetch();
  const tick = React.useCallback(() => {
    if (url) {
      safeFetch(url)
        .then(data => {
          setResponse(data);
          setError(undefined);
          setLoading(false);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setError(err);
            setLoading(false);
            // eslint-disable-next-line no-console
            console.error(`Error polling Metering: ${err}`);
          }
        });
    } else {
      setLoading(false);
    }
  }, [url]);

  usePoll(tick, delay, timespan, rest.endTime, rest.timeUnit);

  return [response, error, loading] as [MeteringResult[], Error, boolean];
};

const getRangeVectorStats: GetStats<Date> = (response, target) => {
  return _.map(response, value => ({
    x: new Date(value.meteringTime.substring(0, value.meteringTime.length - 1)),
    y: parseFloat(value[target]),
  }));
};

const getFormatDate = (timeUnit: TimeUnit) => {
  switch (timeUnit) {
    case 'hour':
      return timeFormat('%H:%M');
    case 'day':
      return timeFormat('%m/%d');
    case 'month':
      return timeFormat('%b %d');
    case 'year':
      return timeFormat('%b, %Y');
    default:
      return twentyFourHourTime;
  }
};

const Area: React.FC<AreaProps> = ({ target, delay, timespan, timeUnit, namespace, sort, limit, ...rest }) => {
  const [response, , loading] = useMeteringPoll({ delay, timespan, timeUnit, namespace, sort, limit });
  const data = getRangeVectorStats(response, target);
  return <AreaChart data={[data]} loading={loading} formatDate={getFormatDate(timeUnit)} xAxisComponent={<ChartAxis tickCount={DEFAULT_TICK_COUNT} />} {...rest} />;
};

const MeteringPage = (props: MeteringPageProps) => {
  const { namespace, timeUnit } = props;
  return (
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-md-4">
          <Area title="CPU Shares" target="cpu" humanize={humanizeCpuCores} namespace={namespace} timeUnit={timeUnit} sort={DEFAULT_SORT} limit={DEFAULT_LIMIT} />
        </div>
        <div className="col-md-4">
          <Area title="Memory" target="memory" humanize={humanizeBinaryBytes} namespace={namespace} timeUnit={timeUnit} sort={DEFAULT_SORT} limit={DEFAULT_LIMIT} />
        </div>
        <div className="col-md-4">
          <Area title="Storage" target="storage" humanize={humanizeBinaryBytes} namespace={namespace} timeUnit={timeUnit} sort={DEFAULT_SORT} limit={DEFAULT_LIMIT} />
        </div>
        <div className="col-md-4">
          <Area title="LoadBalancer IP" target="publicIp" humanize={humanizeBinaryBytes} namespace={namespace} timeUnit={timeUnit} sort={DEFAULT_SORT} limit={DEFAULT_LIMIT} />
        </div>
        <div className="col-md-4">
          <Area title="GPU" target="gpu" namespace={namespace} timeUnit={timeUnit} sort={DEFAULT_SORT} limit={DEFAULT_LIMIT} />
        </div>
      </div>
    </div>
  );
};

export const Metering = (props: MeteringProps) => {
  const { namespace } = props;

  const timeUnitLabels = {
    hour: 'Hour',
    day: 'Day',
    month: 'Month',
    year: 'Year',
  };

  const [timeUnit, setTimeUnit] = React.useState<TimeUnit>('hour');

  return (
    <div className="co-m-pane__body">
      <div style={{ float: 'right' }}>
        <Dropdown title={timeUnitLabels[timeUnit]} items={timeUnitLabels} selectedKey={timeUnit} onChange={(value: string) => setTimeUnit(value as TimeUnit)} />
      </div>
      <MeteringPage namespace={namespace} timeUnit={timeUnit} />
    </div>
  );
};

interface MeteringResult {
  id: string;
  namespace: string;
  cpu: number;
  memory: number;
  storage: number;
  gpu: number;
  publicIp: number;
  privateIp: number;
  trafficIn: number;
  trafficOut: number;
  meteringTime: string;
}

interface MeteringURLProps {
  timeUnit: TimeUnit; // 시간 단위
  namespace: string; // 네임스페이스
  startTime?: number; // 언제 시각으로부터 가져올지에 대한 변수. 타입: unixTime (e.g.: 1642195653)
  endTime?: number; // 끝나는 시간. 타입: unixTime (default = 현재 시각)
  limit?: number; // 0번째 부터 limit 까지의 갯수 반환 (default: 100)
  offset?: number; // offset번째 부터 limit 까지의 갯수 반환 (default: 0)
  sort?: MeteringURLSortParam; // 'metering_time': metering_time 기준 오름차순, '-metering_time': metering_time 기준 내림차순
}

type MeteringURLSortParam = 'metering_time' | '-metering_time';

type MeteringPollProps = MeteringURLProps & {
  delay?: number;
  timespan?: number;
};

type GetStats<X = Date | number | string> = {
  (response: MeteringResult[], target?: string): DataPoint<X>[];
};

type AreaProps = AreaChartProps &
  MeteringPollProps & {
    target?: string;
  };

type TimeUnit = 'hour' | 'day' | 'month' | 'year';

interface MeteringPageProps {
  namespace: string;
  timeUnit: TimeUnit;
}

interface MeteringProps {
  namespace: string;
}

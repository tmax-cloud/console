import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import * as _ from 'lodash-es';
import { Status } from '@console/shared';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import * as UIActions from '../actions/ui';
import { coFetchJSON } from '../co-fetch';
import { ContainerSpec, K8sResourceKindReference, PodKind } from '../module/k8s';
import { getRestartPolicyLabel, podPhase, podPhaseFilterReducer, podReadiness, podRestarts } from '../module/k8s/pods';
import { getContainerState, getContainerStatus } from '../module/k8s/container';
import { ResourceEventStream } from './events';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunctionArgs } from './factory';
import { AsyncComponent, DetailsItem, Kebab, NodeLink, ResourceIcon, ResourceKebab, ResourceLink, ResourceSummary, ScrollToTopOnMount, SectionHeading, Timestamp, formatBytesAsMiB, formatCores, humanizeBinaryBytes, humanizeDecimalBytesPerSec, humanizeCpuCores, navFactory, pluralize, units } from './utils';
import { PodLogs } from './pod-logs';
import { Area, PROMETHEUS_BASE_PATH, PROMETHEUS_TENANCY_BASE_PATH, requirePrometheus } from './graphs';
import { VolumesTable } from './volumes-table';
import { PodModel } from '../models';
import { Conditions } from './conditions';
import { ResourceLabel } from '../models/hypercloud/resource-plural';
import { ToastPopupAlert } from '@console/internal/components/utils/hypercloud/toast-popup-alert';
import { isSingleClusterPerspective } from '@console/internal/hypercloud/perspectives';
import { SHOW_ALERT_IN_SINGLECLUSTER_PODPAGE } from '@console/internal/hypercloud/auth';

// Only request metrics if the device's screen width is larger than the
// breakpoint where metrics are visible.
const showMetrics = PROMETHEUS_BASE_PATH && PROMETHEUS_TENANCY_BASE_PATH && window.screen.width >= 1200;

const fetchPodMetrics = (namespace: string): Promise<UIActions.PodMetrics> => {
  const metrics = [
    {
      key: 'memory',
      query: namespace ? `sum(container_memory_working_set_bytes{namespace='${namespace}',container=''}) BY (pod, namespace)` : "sum(container_memory_working_set_bytes{container=''}) BY (pod, namespace)",
    },
    {
      key: 'cpu',
      query: namespace ? `pod:container_cpu_usage:sum{namespace='${namespace}'}` : 'pod:container_cpu_usage:sum',
    },
  ];
  const promises = metrics.map(
    ({ key, query }): Promise<UIActions.PodMetrics> => {
      const url = namespace ? `${PROMETHEUS_TENANCY_BASE_PATH}/api/v1/query?namespace=${namespace}&query=${query}` : `${PROMETHEUS_BASE_PATH}/api/v1/query?query=${query}`;
      return coFetchJSON(url).then(({ data: { result } }) => {
        return result.reduce((acc, data) => {
          const value = Number(data.value[1]);
          return _.set(acc, [key, data.metric.namespace, data.metric.pod], value);
        }, {});
      });
    },
  );
  return Promise.all(promises).then((data: any[]) => _.assign({}, ...data));
};

export const menuActions = [...Kebab.getExtensionsActionsForKind(PodModel), ...Kebab.factory.common];

const tableColumnClasses = [
  '',
  '',
  classNames('pf-m-hidden', 'pf-m-visible-on-sm'),
  classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'pf-u-w-10-on-lg', 'pf-u-w-8-on-xl'),
  classNames('pf-m-hidden', 'pf-m-visible-on-2xl', 'pf-u-w-8-on-2xl'),
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'),
  classNames('pf-m-hidden', { 'pf-m-visible-on-xl pf-u-w-10-on-2xl': showMetrics }),
  classNames('pf-m-hidden', { 'pf-m-visible-on-xl pf-u-w-10-on-2xl': showMetrics }),
  classNames('pf-m-hidden', 'pf-m-visible-on-2xl pf-u-w-10-on-2xl'),
  Kebab.columnClass,
];

const kind = 'Pod';

const podRowStateToProps = ({ UI }) => ({
  metrics: UI.getIn(['metrics', 'pod']),
});

const PodTableRow = connect<PodTableRowPropsFromState, null, PodTableRowProps>(podRowStateToProps)(({ obj: pod, index, rowKey, style, metrics, showNodes }: PodTableRowProps & PodTableRowPropsFromState) => {
  const { name, namespace, creationTimestamp } = pod.metadata;
  const { readyCount, totalContainers } = podReadiness(pod);
  const phase = podPhase(pod);
  const restarts = podRestarts(pod);
  const bytes: number = _.get(metrics, ['memory', namespace, name]);
  const cores: number = _.get(metrics, ['cpu', namespace, name]);
  return (
    <TableRow id={pod.metadata.uid} index={index} trKey={rowKey} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={name} namespace={namespace} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Status status={phase} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        {readyCount}/{totalContainers}
      </TableData>
      <TableData className={tableColumnClasses[4]}>{restarts}</TableData>
      <TableData className={tableColumnClasses[5]}>{bytes ? `${formatBytesAsMiB(bytes)} MiB` : '-'}</TableData>
      <TableData className={tableColumnClasses[6]}>{cores ? `${formatCores(cores)} cores` : '-'}</TableData>
      <TableData className={tableColumnClasses[7]}>
        <Timestamp timestamp={creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[8]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={pod} isDisabled={phase === 'Terminating'} />
      </TableData>
    </TableRow>
  );
});
PodTableRow.displayName = 'PodTableRow';

const getHeader = showNodes => {
  return (t?: TFunction) => {
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
        title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
        sortFunc: 'podPhase',
        transforms: [sortable],
        props: { className: tableColumnClasses[2] },
      },
      {
        title: t('COMMON:MSG_MAIN_TABLEHEADER_9'),
        sortFunc: 'podReadiness',
        transforms: [sortable],
        props: { className: tableColumnClasses[3] },
      },
      {
        title: t('COMMON:MSG_MAIN_TABLEHEADER_10'),
        sortFunc: 'podRestarts',
        transforms: [sortable],
        props: { className: tableColumnClasses[4] },
      },
      {
        title: t('COMMON:MSG_MAIN_TABLEHEADER_65'),
        sortFunc: 'podMemory',
        transforms: [sortable],
        props: { className: tableColumnClasses[5] },
      },
      {
        title: t('COMMON:MSG_MAIN_TABLEHEADER_64'),
        sortFunc: 'podCPU',
        transforms: [sortable],
        props: { className: tableColumnClasses[6] },
      },
      {
        title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
        sortField: 'metadata.creationTimestamp',
        transforms: [sortable],
        props: { className: tableColumnClasses[7] },
      },
      {
        title: '',
        props: { className: tableColumnClasses[8] },
      },
    ];
  };
};

export const ContainerLink: React.FC<ContainerLinkProps> = ({ pod, name }) => (
  <span className="co-resource-item co-resource-item--inline">
    <ResourceIcon kind="Container" />
    <Link to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/containers/${name}`}>{name}</Link>
  </span>
);
ContainerLink.displayName = 'ContainerLink';

export const ContainerRow: React.FC<ContainerRowProps> = ({ pod, container }) => {
  const cstatus = getContainerStatus(pod, container.name);
  const cstate = getContainerState(cstatus);
  const startedAt = _.get(cstate, 'startedAt');
  const finishedAt = _.get(cstate, 'finishedAt');

  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
        <ContainerLink pod={pod} name={container.name} />
      </div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7 co-truncate co-nowrap co-select-to-copy">{container.image || '-'}</div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">
        <Status status={cstate.label} />
      </div>
      <div className="col-lg-1 col-md-2 hidden-sm hidden-xs">{_.get(cstatus, 'restartCount', '0')}</div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
        <Timestamp timestamp={startedAt} />
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Timestamp timestamp={finishedAt} />
      </div>
      <div className="col-lg-1 hidden-md hidden-sm hidden-xs">{_.get(cstate, 'exitCode', '-')}</div>
    </div>
  );
};

export const PodContainerTable: React.FC<PodContainerTableProps> = ({ heading, containers, pod }) => {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeading text={heading} />
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_2')}</div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_3')}</div>
          <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_4')}</div>
          <div className="col-lg-1 col-md-2 hidden-sm hidden-xs">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_5')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_6')}</div>
          <div className="col-lg-2 hidden-md hidden-sm hidden-xs">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_7')}</div>
          <div className="col-lg-1 hidden-md hidden-sm hidden-xs">{t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_8')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {containers.map((c: any, i: number) => (
            <ContainerRow key={i} pod={pod} container={c} />
          ))}
        </div>
      </div>
    </>
  );
};

const PodGraphs = requirePrometheus(({ pod }) => {
  const { t } = useTranslation();
  const status: string = podPhase(pod);
  return (
    <>
      <div className="row">
        <div className="col-md-12 col-lg-4">
          <Area title={t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_RESOURCEUSAGE_3')} humanize={humanizeBinaryBytes} byteDataType={ByteDataTypes.BinaryBytes} namespace={pod.metadata.namespace} query={`sum(container_memory_working_set_bytes{pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}',container='',}) BY (pod, namespace)`} />
          {/* <Area title={t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_RESOURCEUSAGE_3')} humanize={humanizeBinaryBytes} byteDataType={ByteDataTypes.BinaryBytes} namespace={pod.metadata.namespace} /> */}
        </div>
        <div className="col-md-12 col-lg-4">
          <Area title={t('SINGLE:MSG_NAMESPACES_NAMESPACEDETAILS_TABDETAILS_RESOURCEUSAGE_2')} humanize={humanizeCpuCores} namespace={pod.metadata.namespace} query={`pod:container_cpu_usage:sum{pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}`} />
        </div>
        <div className="col-md-12 col-lg-4">
          <Area status={status} title={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_81')} humanize={humanizeBinaryBytes} byteDataType={ByteDataTypes.BinaryBytes} namespace={pod.metadata.namespace} query={`pod:container_fs_usage_bytes:sum{pod='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}`} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 col-lg-4">
          <Area title={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_79')} humanize={humanizeDecimalBytesPerSec} namespace={pod.metadata.namespace} query={`sum(irate(container_network_receive_bytes_total{pod='${pod.metadata.name}', namespace='${pod.metadata.namespace}'}[5m])) by (pod, namespace)`} />
        </div>
        <div className="col-md-12 col-lg-4">
          <Area title={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_80')} humanize={humanizeDecimalBytesPerSec} namespace={pod.metadata.namespace} query={`sum(irate(container_network_transmit_bytes_total{pod='${pod.metadata.name}', namespace='${pod.metadata.namespace}'}[5m])) by (pod, namespace)`} />
        </div>
      </div>

      <br />
    </>
  );
});

export const PodStatus: React.FC<PodStatusProps> = ({ pod }) => <Status status={podPhase(pod)} />;

export const PodDetailsList: React.FC<PodDetailsListProps> = ({ pod }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_20')}</dt>
      <dd>
        <PodStatus pod={pod} />
      </dd>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_21')} obj={pod} path="spec.restartPolicy">
        {getRestartPolicyLabel(pod)}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_22')} obj={pod} path="spec.activeDeadlineSeconds">
        {pod.spec.activeDeadlineSeconds ? pluralize(pod.spec.activeDeadlineSeconds, 'second') : 'Not Configured'}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_23')} obj={pod} path="status.podIP" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_24')} obj={pod} path="spec.nodeName" hideEmpty>
        <NodeLink name={pod.spec.nodeName} />
      </DetailsItem>
    </dl>
  );
};

export const PodResourceSummary: React.FC<PodResourceSummaryProps> = ({ pod }) => <ResourceSummary resource={pod} showNodeSelector nodeSelector="spec.nodeSelector" showTolerations />;

const Details: React.FC<PodDetailsProps> = ({ obj: pod }) => {
  const { t } = useTranslation();
  const [isAlert, setIsAlert] = React.useState(sessionStorage.getItem(SHOW_ALERT_IN_SINGLECLUSTER_PODPAGE) === 'true');
  const limits = {
    cpu: null,
    memory: null,
  };
  limits.cpu = _.reduce(
    pod.spec.containers,
    (sum, container) => {
      const value = units.dehumanize(_.get(container, 'resources.limits.cpu', 0), 'numeric').value;
      return sum + value;
    },
    0,
  );
  limits.memory = _.reduce(
    pod.spec.containers,
    (sum, container) => {
      const value = units.dehumanize(_.get(container, 'resources.limits.memory', 0), 'binaryBytesWithoutB').value;
      return sum + value;
    },
    0,
  );

  return (
    <>
      {isAlert && isSingleClusterPerspective() && (
        <ToastPopupAlert
          title={t('SINGLE:MSG_PODS_PODDETAILS_TABOVERVIEW_2')}
          message={t('SINGLE:MSG_PODS_PODDETAILS_TABOVERVIEW_1')}
          onceOption={true}
          sessionStoragekey={SHOW_ALERT_IN_SINGLECLUSTER_PODPAGE}
          setIsAlert={setIsAlert}
        />
      )}
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(pod, t) })} />
        <PodGraphs pod={pod} />
        <div className="row">
          <div className="col-sm-6">
            <PodResourceSummary pod={pod} />
          </div>
          <div className="col-sm-6">
            <PodDetailsList pod={pod} />
          </div>
        </div>
      </div>
      {pod.spec.initContainers && (
        <div className="co-m-pane__body">
          <PodContainerTable key="initContainerTable" heading={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_141')} containers={pod.spec.initContainers} pod={pod} />
        </div>
      )}
      <div className="co-m-pane__body">
        <PodContainerTable key="containerTable" heading={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} containers={pod.spec.containers} pod={pod} />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={pod} heading={t('COMMON:MSG_DETAILS_TABDETAILS_VOLUMES_TABLEHEADER_1')} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONDITIONS_1')} />
        <Conditions conditions={pod.status.conditions} />
      </div>
    </>
  );
};

const EnvironmentPage = (props: any) => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec', 'containers'];
const PodEnvironmentComponent = props => <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec} envPath={envPath} readOnly={true} />;

export const PodExecLoader: React.FC<PodExecLoaderProps> = ({ obj, message }) => (
  <div className="co-m-pane__body">
    <div className="row">
      <div className="col-xs-12">
        <div className="panel-body">
          <AsyncComponent loader={() => import('./pod-exec').then(c => c.PodExec)} obj={obj} message={message} />
        </div>
      </div>
    </div>
  </div>
);

export const PodsDetailsPage: React.FC<PodDetailsPageProps> = props => {
  return (
    <DetailsPage
      {...props}
      getResourceStatus={podPhase}
      menuActions={menuActions}
      pages={[
        navFactory.details(Details),
        navFactory.editResource(),
        navFactory.envEditor(PodEnvironmentComponent),
        navFactory.logs(PodLogs),
        navFactory.events(ResourceEventStream),
        {
          href: 'terminal',
          name: 'COMMON:MSG_DETAILS_TAB_8',
          component: PodExecLoader,
        },
      ]}
    />
  );
};
PodsDetailsPage.displayName = 'PodsDetailsPage';

const getRow = showNodes => {
  return (rowArgs: RowFunctionArgs<PodKind>) => <PodTableRow obj={rowArgs.obj} index={rowArgs.index} rowKey={rowArgs.key} style={rowArgs.style} showNodes={showNodes} />;
};

export const PodList: React.FC<PodListProps> = props => {
  const showNodes = props?.customData?.showNodes;
  const { t } = useTranslation();
  return <Table {...props} aria-label="Pods" Header={getHeader(showNodes).bind(null, t)} Row={getRow(showNodes)} virtualize />;
};
PodList.displayName = 'PodList';

const dispatchToProps = (dispatch): PodPagePropsFromDispatch => ({
  setPodMetrics: metrics => dispatch(UIActions.setPodMetrics(metrics)),
});

export const PodsPage = connect<{}, PodPagePropsFromDispatch, PodPageProps>(
  null,
  dispatchToProps,
)((props: PodPageProps & PodPagePropsFromDispatch) => {
  const { t } = useTranslation();
  const { canCreate = true, namespace, setPodMetrics, customData, ...listProps } = props;
  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    if (showMetrics) {
      const updateMetrics = () =>
        fetchPodMetrics(namespace)
          .then(setPodMetrics)
          .catch(e => {
            // Just log the error here. Showing a warning alert could be more annoying
            // than helpful. It should be obvious there are no metrics in the list, and
            // if monitoring is broken, it'll be really apparent since none of the
            // graphs and dashboards will load in the UI.
            // eslint-disable-next-line no-console
            console.error('Unable to fetch pod metrics', e);
          });
      updateMetrics();
      const id = setInterval(updateMetrics, 30 * 1000);
      return () => clearInterval(id);
    }
  }, [namespace]);
  /* eslint-enable react-hooks/exhaustive-deps */
  return (
    <ListPage
      {...listProps}
      title={t('COMMON:MSG_LNB_MENU_23')}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_23') })}
      canCreate={canCreate}
      kind="Pod"
      ListComponent={PodList}
      rowFilters={[
        {
          filterGroupName: t('COMMON:MSG_COMMON_BUTTON_FILTER_3'),
          type: POD_STATUS_QUERY_PARAM,
          reducer: podPhaseFilterReducer,
          items: [
            { id: POD_STATUS.RUNNING, title: POD_STATUS.RUNNING },
            { id: POD_STATUS.PENDING, title: POD_STATUS.PENDING },
            { id: POD_STATUS.TERMINATING, title: POD_STATUS.TERMINATING },
            { id: POD_STATUS.CRASHLOOPBACKOFF, title: POD_STATUS.CRASHLOOPBACKOFF },
            // Use title "Completed" to match what appears in the status column for the pod.
            // The pod phase is "Succeeded," but the container state is "Completed."
            { id: POD_STATUS.SUCCEEDED, title: POD_STATUS.SUCCEEDED },
            { id: POD_STATUS.FAILED, title: POD_STATUS.FAILED },
            { id: POD_STATUS.UNKNOWN, title: POD_STATUS.UNKNOWN },
          ],
        },
      ]}
      namespace={namespace}
      customData={customData}
    />
  );
});

export const POD_STATUS_QUERY_PARAM = 'pod-status';

export enum POD_STATUS {
  PENDING = 'Pending',
  RUNNING = 'Running',
  SUCCEEDED = 'Succeeded',
  CRASHLOOPBACKOFF = 'CrashLoopBackOff',
  FAILED = 'Failed',
  TERMINATING = 'Terminating',
  UNKNOWN = 'Unknown',
}

type ContainerLinkProps = {
  pod: PodKind;
  name: string;
};

type ContainerRowProps = {
  pod: PodKind;
  container: ContainerSpec;
};

type PodContainerTableProps = {
  heading: string;
  containers: ContainerSpec[];
  pod: PodKind;
};

type PodStatusProps = {
  pod: PodKind;
};

type PodResourceSummaryProps = {
  pod: PodKind;
};

type PodDetailsListProps = {
  pod: PodKind;
};

type PodExecLoaderProps = {
  obj: PodKind;
  message?: React.ReactElement;
};

type PodDetailsProps = {
  obj: PodKind;
};

type PodTableRowProps = {
  obj: PodKind;
  index: number;
  rowKey: string;
  style: object;
  showNodes?: boolean;
};

type PodTableRowPropsFromState = {
  metrics: UIActions.PodMetrics;
};

type PodListProps = {
  customData?: any;
};

type PodPageProps = {
  canCreate?: boolean;
  fieldSelector?: any;
  namespace?: string;
  selector?: any;
  showTitle?: boolean;
  customData?: any;
};

type PodPagePropsFromDispatch = {
  setPodMetrics: (metrics) => void;
};

type PodDetailsPageProps = {
  kind: K8sResourceKindReference;
  match: any;
};

import * as React from 'react';
import { Link } from 'react-router-dom';
import * as _ from 'lodash-es';

import { getVolumeType, getVolumeLocation, getVolumeMountPermissions, getVolumeMountsByPermissions, getRestartPolicyLabel, podPhase, podPhaseFilterReducer, podReadiness } from '../module/k8s/pods';
import { getContainerState, getContainerStatus } from '../module/k8s/docker';
import { ResourceEventStream } from './events';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { SectionHeading, Cog, LabelList, navFactory, NodeLink, Overflow, ResourceCog, ResourceIcon, ResourceLink, ResourceSummary, ScrollToTopOnMount, Selector, Timestamp, VolumeIcon, units, AsyncComponent } from './utils';
import { PodLogs } from './pod-logs';
import { Line, requirePrometheus } from './graphs';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { EnvironmentPage } from './environment';
import { formatDuration } from './utils/datetime';
import { CamelCaseWrap } from './utils/camel-case-wrap';
import { ResourcePlural } from './utils/lang/resource-plural';
import { useTranslation } from 'react-i18next';

const menuActions = [Cog.factory.EditEnvironment, ...Cog.factory.common];
const validReadinessStates = new Set(['ContainersNotReady', 'Ready', 'PodCompleted']);
const validStatuses = new Set(['ContainerCreating', 'Running', 'Completed']);

/** @type {React.SFC.<{pod: string}>} */
export const Readiness = ({ pod }) => {
  const readiness = podReadiness(pod);
  if (!readiness) {
    return null;
  }
  if (validReadinessStates.has(readiness)) {
    return <CamelCaseWrap value={readiness} />;
  }
  return (
    <span className="co-error co-icon-and-text">
      <i className="fa fa-times-circle co-icon-and-text__icon" aria-hidden="true" />
      <CamelCaseWrap value={readiness} />
    </span>
  );
};

Readiness.displayName = 'Readiness';

export const PodRow = ({ obj: pod }) => {
  const phase = podPhase(pod);
  const status = validStatuses.has(phase) ? (
    <CamelCaseWrap value={phase} />
  ) : (
    <span className="co-error co-icon-and-text">
      <i className="fa fa-times-circle co-icon-and-text__icon" aria-hidden="true" />
      <CamelCaseWrap value={phase} />
    </span>
  );

  return (
    <ResourceRow obj={pod}>
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind="Pod" resource={pod} isDisabled={phase === 'Terminating'} />
        <ResourceLink kind="Pod" name={pod.metadata.name} namespace={pod.metadata.namespace} title={pod.metadata.uid} />
      </div>
      <div className="col-lg-2 col-md-2 col-sm-4 col-xs-6 co-break-word">
        <ResourceLink kind="Namespace" name={pod.metadata.namespace} title={pod.metadata.namespace} />
      </div>
      <div className="col-lg-2 col-md-3 col-sm-4 hidden-xs">
        <LabelList kind="Pod" labels={pod.metadata.labels} />
      </div>
      {/* <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
        <NodeLink name={pod.spec.nodeName} />
      </div> */}
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{status}</div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        <Readiness pod={pod} />
      </div>
    </ResourceRow>
  );
};

PodRow.displayName = 'PodRow';

const PodHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 hidden-xs" sortField="metadata.labels">
        {t('CONTENT:PODLABELS')}
      </ColHead>
      {/* <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.nodeName">
        {t('CONTENT:NODE')}
      </ColHead> */}
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortFunc="podPhase">
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs" sortFunc="podReadiness">
        {t('CONTENT:READINESS')}
      </ColHead>
    </ListHeader>
  );
};

const ContainerLink = ({ pod, name }) => (
  <span className="co-resource-link co-resource-link--inline">
    <ResourceIcon kind="Container" />
    <Link to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/containers/${name}`}>{name}</Link>
  </span>
);

export const ContainerRow = ({ pod, container }) => {
  const cstatus = getContainerStatus(pod, container.name);
  const cstate = getContainerState(cstatus);
  const startedAt = _.get(cstate, 'startedAt');
  const finishedAt = _.get(cstate, 'finishedAt');

  return (
    <div className="row">
      <div className="col-sm-2 col-xs-4">
        <ContainerLink pod={pod} name={container.name} />
      </div>
      <Overflow className="col-md-2 col-sm-3 hidden-xs" value={_.get(cstatus, 'containerID', '-')} />
      <Overflow className="col-md-2 col-sm-3 col-xs-8" value={container.image} />
      <div className="col-md-1 col-sm-2 hidden-xs text-nowrap">{_.get(cstate, 'label', '-')}</div>
      <div className="col-md-1 col-sm-2 hidden-xs">{_.get(cstatus, 'restartCount', '0')}</div>
      <div className="col-md-2 hidden-sm hidden-xs">
        <Timestamp timestamp={startedAt} />
      </div>
      <div className="col-md-2 hidden-sm hidden-xs">
        <Timestamp timestamp={finishedAt} />
      </div>
    </div>
  );
};

const Volume = ({ pod, volume }) => {
  const kind = _.get(getVolumeType(volume.volume), 'id', '');
  const loc = getVolumeLocation(volume.volume);
  const mountPermissions = getVolumeMountPermissions(volume);

  return (
    <div className="row">
      <Overflow className="col-sm-3 col-xs-4 co-truncate" value={volume.name} />
      <div className="col-sm-3 col-xs-4">
        <VolumeIcon kind={kind} />
        <span className="co-break-word">{loc && ` (${loc})`}</span>
      </div>
      <div className="col-sm-3 hidden-xs">{mountPermissions}</div>
      <div className="col-sm-3 col-xs-4">
        {volume.mounts.map((m, i) => (
          <React.Fragment key={i}>
            <ContainerLink pod={pod} name={m.container} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ContainerTable = ({ heading, containers, pod }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={heading} />
      <div className="row">
        <div className="co-m-table-grid co-m-table-grid--bordered">
          <div className="row co-m-table-grid__head">
            <div className="col-sm-2 col-xs-4">{t('CONTENT:NAME')}</div>
            <div className="col-md-2 col-sm-3 hidden-xs">{t('CONTENT:ID')}</div>
            <div className="col-md-2 col-sm-3 col-xs-8">{t('CONTENT:IMAGE')}</div>
            <div className="col-md-1 col-sm-2 hidden-xs">{t('CONTENT:STATE')}</div>
            <div className="col-md-1 col-sm-2 hidden-xs">{t('CONTENT:RESTARTS')}</div>
            <div className="col-md-2 hidden-sm hidden-xs">{t('CONTENT:STARTED')}</div>
            <div className="col-md-2 hidden-sm hidden-xs">{t('CONTENT:FINISHED')}</div>
          </div>
          <div className="co-m-table-grid__body">
            {containers.map((c, i) => (
              <ContainerRow key={i} pod={pod} container={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PodGraphs = requirePrometheus(({ pod }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="row">
        <div className="col-md-4">
          <Line title={t('CONTENT:RAM')} query={`pod_name:container_memory_usage_bytes:sum{pod_name='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}`} />
        </div>
        <div className="col-md-4">
          <Line title={t('CONTENT:CPUSHARES')} query={`pod_name:container_cpu_usage:sum{pod_name='${pod.metadata.name}',namespace='${pod.metadata.namespace}'} * 1000`} />
        </div>
        <div className="col-md-4">
          <Line title={t('CONTENT:FILESYSTEM')} query={`pod_name:container_fs_usage_bytes:sum{pod_name='${pod.metadata.name}',namespace='${pod.metadata.namespace}'}`} />
        </div>
      </div>

      <br />
    </React.Fragment>
  );
});

const Details = ({ obj: pod }) => {
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
  const activeDeadlineSeconds = _.get(pod, 'spec.activeDeadlineSeconds');
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Pod', t) })} />
        <PodGraphs pod={pod} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={pod} showPodSelector={false} showNodeSelector={false}>
              <dt>{t('CONTENT:NODESELECTOR')}</dt>
              <dd>
                <Selector kind="Node" selector={pod.spec.nodeSelector} />
              </dd>
            </ResourceSummary>
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{podPhase(pod)}</dd>
              <dt>{t('CONTENT:RESTARTPOLICY')}</dt>
              <dd>{getRestartPolicyLabel(pod)}</dd>
              {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>{t('CONTENT:ACTIVEDEADLINE')}</dt>
                  {/* Convert to ms for formatDuration */}
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )}
              <dt>{t('CONTENT:PODIP')}</dt>
              <dd>{pod.status.podIP || '-'}</dd>
              {/* <dt>{t('CONTENT:NODE')}</dt>
              <dd>
                <NodeLink name={pod.spec.nodeName} />
              </dd> */}
            </dl>
          </div>
        </div>
      </div>

      {pod.spec.initContainers && <ContainerTable key="initContainerTable" heading="Init Containers" containers={pod.spec.initContainers} pod={pod} />}
      <ContainerTable key="containerTable" heading={t('CONTENT:CONTAINERS')} containers={pod.spec.containers} pod={pod} />

      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:PODVOLUMES')} />
        <div className="row">
          <div className="co-m-table-grid co-m-table-grid--bordered">
            <div className="row co-m-table-grid__head">
              <div className="col-sm-3 col-xs-4">{t('CONTENT:NAME')}</div>
              <div className="col-sm-3 col-xs-4">{t('CONTENT:TYPE')}</div>
              <div className="col-sm-3 hidden-xs">{t('CONTENT:PERMISSIONS')}</div>
              <div className="col-sm-3 col-xs-4">{t('CONTENT:UTILIZEDBY')}</div>
            </div>
            <div className="co-m-table-grid__body">
              {getVolumeMountsByPermissions(pod).map((v, i) => (
                <Volume key={i} pod={pod} volume={v} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const envPath = ['spec', 'containers'];
const environmentComponent = props => {
  const { t } = useTranslation();
  return <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.containers} envPath={envPath} readOnly={true} />;
};

const PodExecLoader = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-xs-12">
          <div className="panel-body">
            <AsyncComponent loader={() => import('./pod-exec').then(c => c.PodExec)} obj={obj} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
};

/** @type {React.SFC<any>} */
export const PodsDetailsPage = props => {
  const { t } = useTranslation();
  // const Log = PodLogs({ ..._.cloneDeep(props), t });
  return (
    <DetailsPage
      {...props}
      breadcrumbsFor={obj =>
        breadcrumbsForOwnerRefs(obj).concat({
          name: t(`RESOURCE:${obj.kind.toUpperCase()}`) + ' ' + t('CONTENT:DETAILS'),
          path: props.match.url,
        })
      }
      menuActions={menuActions}
      pages={[
        navFactory.details(Details, t('CONTENT:OVERVIEW')),
        navFactory.editYaml(t('CONTENT:YAML')),
        navFactory.envEditor(environmentComponent, t('CONTENT:ENVIRONMENT')),
        navFactory.logs(PodLogs, t('CONTENT:LOGS')),
        navFactory.events(ResourceEventStream, t('CONTENT:EVENTS')),
        {
          href: 'terminal',
          name: t('CONTENT:TERMINAL'),
          component: PodExecLoader,
        },
      ]}
      t={t}
    />
  );
};
PodsDetailsPage.displayName = 'PodsDetailsPage';

export const PodList = props => <List {...props} Header={PodHeader} Row={PodRow} />;
PodList.displayName = 'PodList';

// const filters = [
//   {
//     type: 'pod-status',
//     selected: ['Running', 'Pending', 'Terminating', 'CrashLoopBackOff'],
//     reducer: podPhaseFilterReducer,
//     items: [
//       { id: 'Running', title: 'Running' },
//       { id: 'Pending', title: 'Pending' },
//       { id: 'Terminating', title: 'Terminating' },
//       { id: 'CrashLoopBackOff', title: 'CrashLoopBackOff' },
//       // Use title "Completed" to match what appears in the status column for the pod.
//       // The pod phase is "Succeeded," but the container state is "Completed."
//       { id: 'Succeeded', title: 'Completed' },
//       { id: 'Failed', title: 'Failed' },
//       { id: 'Unknown', title: 'Unknown ' },
//     ],
//   },
// ];

export const PodsPage = props => {
  // shouldComponentUpdate(nextProps) {
  //   return !_.isEqual(nextProps, this.props);
  // }
  const { t } = useTranslation();
  const filters = [
    {
      type: 'pod-status',
      selected: ['Running', 'Pending', 'Terminating', 'CrashLoopBackOff'],
      reducer: podPhaseFilterReducer,
      items: [
        { id: 'Running', title: t('CONTENT:RUNNING') },
        { id: 'Pending', title: t('CONTENT:PENDING') },
        { id: 'Terminating', title: t('CONTENT:TERMINATING') },
        { id: 'CrashLoopBackOff', title: t('CONTENT:CRASHLOOPBACKOFF') },
        // Use title "Completed" to match what appears in the status column for the pod.
        // The pod phase is "Succeeded," but the container state is "Completed."
        { id: 'Succeeded', title: t('CONTENT:COMPLETED') },
        { id: 'Failed', title: t('CONTENT:FAILED') },
        { id: 'Unknown', title: t('CONTENT:UNKNOWN') },
      ],
    },
  ];
  const { canCreate = true } = props;

  return <ListPage {...props} canCreate={canCreate} kind="Pod" ListComponent={PodList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Pod', t) })} rowFilters={filters} />;
};

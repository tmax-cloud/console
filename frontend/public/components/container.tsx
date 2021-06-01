import * as React from 'react';
import * as _ from 'lodash-es';

import { Status } from '@console/shared';
import { ContainerLifecycle, ContainerLifecycleStage, ContainerPort, ContainerProbe, ContainerSpec, ContainerStatus, EnvVar, PodKind, ResourceList, VolumeMount } from '../module/k8s';
import * as k8sProbe from '../module/k8s/probe';
import { getContainerState, getContainerStatus, getPullPolicyLabel } from '../module/k8s/container';
import { Firehose, HorizontalNav, MsgBox, NodeLink, PageHeading, ResourceLink, ScrollToTopOnMount, SectionHeading, Timestamp } from './utils';
import { resourcePath } from './utils/resource-link';
import { useTranslation } from 'react-i18next';

const formatComputeResources = (resources: ResourceList) => _.map(resources, (v, k) => `${k}: ${v}`).join(', ');

const getResourceRequestsValue = (container: ContainerSpec) => {
  const requests: ResourceList = _.get(container, 'resources.requests');
  return formatComputeResources(requests);
};

const getResourceLimitsValue = (container: ContainerSpec) => {
  const limits: ResourceList = _.get(container, 'resources.limits');
  return formatComputeResources(limits);
};

const Lifecycle: React.FC<LifecycleProps> = ({ lifecycle }) => {
  const fields = lifecycle && k8sProbe.mapLifecycleConfigToFields(lifecycle);
  const postStart = _.get(fields, 'postStart.cmd');
  const preStop = _.get(fields, 'preStop.cmd');

  const label = (stage: ContainerLifecycleStage) => lifecycle && k8sProbe.getLifecycleHookLabel(lifecycle, stage);
  return (
    <div>
      {postStart && (
        <div>
          <span>PostStart: {label('postStart')}</span> <code>{postStart}</code>
        </div>
      )}
      {preStop && (
        <div>
          <span>PreStop: {label('preStop')}</span> <code>{preStop}</code>
        </div>
      )}
      {!postStart && !preStop && '-'}
    </div>
  );
};
Lifecycle.displayName = 'Lifecycle';

const Probe: React.FC<ProbeProps> = ({ probe, podIP }) => {
  const label = probe && k8sProbe.getActionLabelFromObject(probe);
  const value = probe && _.get(k8sProbe.mapProbeToFields(probe, podIP), 'cmd');
  if (!value) {
    return <>-</>;
  }
  const isMultiline = value.indexOf('\n') !== -1;
  const formattedValue = isMultiline ? <pre>{value}</pre> : <code>{value}</code>;
  return (
    <>
      {label} {formattedValue}
    </>
  );
};
Probe.displayName = 'Probe';

const Ports: React.FC<PortsProps> = ({ ports }) => {
  const { t } = useTranslation();
  if (!ports || !ports.length) {
    return <MsgBox className="co-sysevent-stream__status-box-empty" title={t('COMMON:MSG_DETAILS_CONTAINER_PORTS_1')} detail={t('COMMON:MSG_DETAILS_CONTAINER_PORTS_2')} />;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('SINGLE:MSG_PODS_PODDETAILS_CONTAINERDETAILS_2')}</th>
          <th>{t('SINGLE:MSG_PODS_PODDETAILS_CONTAINERDETAILS_3')}</th>
        </tr>
      </thead>
      <tbody>
        {ports.map((p: ContainerPort, i: number) => (
          <tr key={i}>
            <td>{p.name || '-'}</td>
            <td>{p.containerPort}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const VolumeMounts: React.FC<VolumeMountProps> = ({ volumeMounts }) => {
  const { t } = useTranslation();
  if (!volumeMounts || !volumeMounts.length) {
    return <MsgBox className="co-sysevent-stream__status-box-empty" title={t('SINGLE:MSG_PODS_PODDETAILS_CONTAINERDETAILS_6')} detail={t('SINGLE:MSG_PODS_PODDETAILS_CONTAINERDETAILS_7')} />;
  }

  return (
    <table className="table table--layout-fixed">
      <thead>
        <tr>
          <th>{t('COMMON:MSG_DETAILS_CONTAINER_MOUNTEDVOLUMES_2')}</th>
          <th>{t('COMMON:MSG_DETAILS_CONTAINER_MOUNTEDVOLUMES_3')}</th>
          <th>{t('COMMON:MSG_DETAILS_CONTAINER_MOUNTEDVOLUMES_4')}</th>
        </tr>
      </thead>
      <tbody>
        {volumeMounts.map((v: VolumeMount) => (
          <tr key={v.name}>
            <td>{v.readOnly === true ? 'Read Only' : 'Read / Write'}</td>
            <td className="co-break-all co-select-to-copy">{v.name}</td>
            <td>{v.mountPath ? <div className="co-break-all co-select-to-copy">{v.mountPath}</div> : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
VolumeMounts.displayName = 'VolumeMounts';

const Env: React.FC<EnvProps> = ({ env }) => {
  const { t } = useTranslation();
  if (!env || !env.length) {
    return <MsgBox className="co-sysevent-stream__status-box-empty" title={t('SINGLE:MSG_PODS_PODDETAILS_CONTAINERDETAILS_4')} detail={t('SINGLE:MSG_PODS_PODDETAILS_CONTAINERDETAILS_5')} />;
  }

  const value = (e: EnvVar) => {
    const v = e.valueFrom;
    if (_.has(v, 'fieldRef')) {
      return `field: ${v.fieldRef.fieldPath}`;
    } else if (_.has(v, 'resourceFieldRef')) {
      return `resource: ${v.resourceFieldRef.resource}`;
    } else if (_.has(v, 'configMapKeyRef')) {
      return `config-map: ${v.configMapKeyRef.name}/${v.configMapKeyRef.key}`;
    } else if (_.has(v, 'secretKeyRef')) {
      return `secret: ${v.secretKeyRef.name}/${v.secretKeyRef.key}`;
    }
    return e.value;
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('COMMON:MSG_DETAILS_CONTAINER_ENVIRONMENTVARIABLES_2')}</th>
          <th>{t('COMMON:MSG_DETAILS_CONTAINER_ENVIRONMENTVARIABLES_3')}</th>
        </tr>
      </thead>
      <tbody>
        {env.map((e: EnvVar, i: number) => (
          <tr key={i}>
            <td>{e.name}</td>
            <td>{value(e)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
Env.displayName = 'Env';

// Split image string into the image name and tag.
const getImageNameAndTag = (image: string) => {
  if (!image) {
    return { imageName: null, imageTag: null };
  }
  const index = image.lastIndexOf(':');
  if (index === -1 || _.includes(image, '@sha256:')) {
    return { imageName: image, imageTag: null };
  }
  const imageName = image.substr(0, index);
  const imageTag = image.substr(index + 1);
  return { imageName, imageTag };
};

const ContainerDetails: React.FC<ContainerDetailsProps> = props => {
  const { t } = useTranslation();
  const pod = props.obj;
  const container = (_.find(pod.spec.containers, { name: props.match.params.name }) as ContainerSpec) || (_.find(pod.spec.initContainers, { name: props.match.params.name }) as ContainerSpec);
  if (!container) {
    return null;
  }

  const status: ContainerStatus = getContainerStatus(pod, container.name) || ({} as ContainerStatus);
  const state = getContainerState(status);
  const stateValue = state.value === 'terminated' && _.isFinite(state.exitCode) ? `${state.label} with exit code ${state.exitCode}` : state.label;
  const { imageName, imageTag } = getImageNameAndTag(container.image);

  return (
    <div className="co-m-pane__body">
      <ScrollToTopOnMount />

      <div className="row">
        <div className="col-lg-4">
          <SectionHeading text={t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_12')} />
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_1')}</dt>
            <dd>
              <Status status={stateValue} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_2')}</dt>
            <dd>{status.containerID ? <div className="co-break-all co-select-to-copy">{status.containerID}</div> : '-'}</dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_3')}</dt>
            <dd>{status.restartCount}</dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_4')}</dt>
            <dd>{getResourceRequestsValue(container) || '-'}</dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_5')}</dt>
            <dd>{getResourceLimitsValue(container) || '-'}</dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_6')}</dt>
            <dd>
              <Lifecycle lifecycle={container.lifecycle} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_7')}</dt>
            <dd>
              <Probe probe={container.readinessProbe} podIP={pod.status.podIP || '-'} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_8')}</dt>
            <dd>
              <Probe probe={container.livenessProbe} podIP={pod.status.podIP || '-'} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_9')}</dt>
            <dd>
              <Timestamp timestamp={state.startedAt} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_10')}</dt>
            <dd>
              <Timestamp timestamp={state.finishedAt} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_11')}</dt>
            <dd>
              <ResourceLink kind="Pod" name={props.match.params.podName} namespace={props.match.params.ns} />
            </dd>
          </dl>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('COMMON:MSG_DETAILS_CONTAINER_DETAILS_13')} />
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_IMAGEDETAILS_1')}</dt>
            <dd>{imageName ? <div className="co-break-all co-select-to-copy">{imageName}</div> : '-'}</dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_IMAGEDETAILS_2')}</dt>
            <dd>{imageTag || '-'}</dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_IMAGEDETAILS_3')}</dt>
            <dd>
              {container.command ? (
                <pre>
                  <code>{container.command.join(' ')}</code>
                </pre>
              ) : (
                <span>-</span>
              )}
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_IMAGEDETAILS_4')}</dt>
            <dd>
              {container.args ? (
                <pre>
                  <code>{container.args.join(' ')}</code>
                </pre>
              ) : (
                <span>-</span>
              )}
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_IMAGEDETAILS_5')}</dt>
            <dd>{getPullPolicyLabel(container)}</dd>
          </dl>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('COMMON:MSG_DETAILS_CONTAINER_NETWORK_3')} />
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_NETWORK_1')}</dt>
            <dd>
              <NodeLink name={pod.spec.nodeName} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_CONTAINER_NETWORK_2')}</dt>
            <dd>{pod.status.podIP || '-'}</dd>
          </dl>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-lg-4">
          <SectionHeading text={t('COMMON:MSG_DETAILS_CONTAINER_PORTS_3')} />
          <div className="co-table-container">
            <Ports ports={container.ports} />
          </div>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('COMMON:MSG_DETAILS_CONTAINER_MOUNTEDVOLUMES_1')} />
          <div className="co-table-container">
            <VolumeMounts volumeMounts={container.volumeMounts} />
          </div>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('COMMON:MSG_DETAILS_CONTAINER_ENVIRONMENTVARIABLES_1')} />
          <div className="co-table-container">
            <Env env={container.env} />
          </div>
        </div>
      </div>
    </div>
  );
};
ContainerDetails.displayName = 'ContainerDetails';

export const ContainersDetailsPage: React.FC<ContainerDetailsPageProps> = props => {
  const { t } = useTranslation();
  return (
    <div>
      <Firehose
        resources={[
          {
            name: props.match.params.podName,
            namespace: props.match.params.ns,
            kind: 'Pod',
            isList: false,
            prop: 'obj',
          },
        ]}
      >
        <PageHeading
          detail={true}
          title={props.match.params.name}
          kind="Container"
          breadcrumbsFor={() => [
            { name: t('COMMON:MSG_LNB_MENU_23'), path: `/k8s/ns/${props.match.params.ns}/pods` },
            {
              name: props.match.params.podName,
              path: resourcePath('Pod', props.match.params.podName, props.match.params.ns),
            },
            { name: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_14') }), path: props.match.url },
          ]}
        />
        <HorizontalNav hideNav={true} pages={[{ name: 'container', href: '', component: ContainerDetails }]} match={props.match} />
      </Firehose>
    </div>
  );
};
ContainersDetailsPage.displayName = 'ContainersDetailsPage';

type LifecycleProps = {
  lifecycle: ContainerLifecycle;
};

type ProbeProps = {
  probe: ContainerProbe;
  podIP: string;
};

type PortsProps = {
  ports: ContainerPort[];
};

type VolumeMountProps = {
  volumeMounts: VolumeMount[];
};

type EnvProps = {
  env: EnvVar[];
};

type ContainerDetailsProps = {
  match: any;
  obj: PodKind;
};

type ContainerDetailsPageProps = {
  match: any;
};

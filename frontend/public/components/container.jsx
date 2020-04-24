import * as React from 'react';
import * as _ from 'lodash-es';
import { ResourcePlural } from './utils/lang/resource-plural';
import { getContainerState, getContainerStatus, getPullPolicyLabel } from '../module/k8s/docker';
import * as k8sProbe from '../module/k8s/probe';
import { SectionHeading, Firehose, Overflow, MsgBox, NavTitle, Timestamp, VertNav, ResourceLink, ScrollToTopOnMount } from './utils';
import { useTranslation } from 'react-i18next';
const formatComputeResources = resources => _.map(resources, (v, k) => `${k}: ${v}`).join(', ');
const HDCModeFlag = window.SERVER_FLAGS.HDCModeFlag;
const getResourceRequestsValue = container => {
  const requests = _.get(container, 'resources.requests');
  return formatComputeResources(requests);
};

const getResourceLimitsValue = container => {
  const limits = _.get(container, 'resources.limits');
  return formatComputeResources(limits);
};

const Lifecycle = ({ lifecycle }) => {
  const fields = lifecycle && k8sProbe.mapLifecycleConfigToFields(lifecycle);
  const postStart = _.get(fields, 'postStart.cmd');
  const preStop = _.get(fields, 'preStop.cmd');

  const label = stage => lifecycle && k8sProbe.getLifecycleHookLabel(lifecycle, stage);
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
      {!postStart && !preStop && <span>-</span>}
    </div>
  );
};

const Probe = ({ probe, podIP }) => {
  const label = probe && k8sProbe.getActionLabelFromObject(probe);
  const value = probe && _.get(k8sProbe.mapProbeToFields(probe, podIP), 'cmd');
  if (!value) {
    return '-';
  }
  const isMultiline = value.indexOf('\n') !== -1;
  const formattedValue = isMultiline ? <pre>{value}</pre> : <code>{value}</code>;
  return (
    <React.Fragment>
      {label} {formattedValue}
    </React.Fragment>
  );
};

const Ports = ({ ports }) => {
  const { t } = useTranslation();
  if (!ports || !ports.length) {
    return <MsgBox className="co-sysevent-stream__status-box-empty" title={t('STRING:CONTAINER-DETAIL_0')} detail={t('STRING:CONTAINER-DETAIL_1')} />;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('CONTENT:NAME')}</th>
          <th>{t('RESOURCE:CONTAINER')}</th>
        </tr>
      </thead>
      <tbody>
        {ports.map((p, i) => (
          <tr key={i}>
            <td>{p.name || '-'}</td>
            <td>{p.containerPort}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Volumes = ({ volumes }) => {
  const { t } = useTranslation();
  if (!volumes || !volumes.length) {
    return <MsgBox className="co-sysevent-stream__status-box-empty" title={t('STRING:CONTAINER-DETAIL_2')} detail={t('STRING:CONTAINER-DETAIL_3')} />;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('CONTENT:ACCESS')}</th>
          <th>{t('CONTENT:LOCATION')}</th>
          <th>{t('CONTENT:MOUNTPATH')}</th>
        </tr>
      </thead>
      <tbody>
        {volumes.map((v, i) => (
          <tr key={i}>
            <td>{v.readOnly === true ? 'Read Only' : 'Read / Write'}</td>
            <td>{v.name}</td>
            <td>
              <Overflow value={v.mountPath} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Env = ({ env }) => {
  const { t } = useTranslation();
  if (!env || !env.length) {
    return <MsgBox className="co-sysevent-stream__status-box-empty" title={t('STRING:CONTAINER-DETAIL_4')} detail={t('STRING:CONTAINER-DETAIL_5')} />;
  }

  const value = e => {
    let v = e.valueFrom;
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
          <th>{t('CONTENT:NAME')}</th>
          <th>{t('CONTENT:VALUE')}</th>
        </tr>
      </thead>
      <tbody>
        {env.map((e, i) => (
          <tr key={i}>
            <td>{e.name}</td>
            <td>{value(e)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Split image string into the image name and tag.
const getImageNameAndTag = image => {
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

const Details = props => {
  const pod = props.obj;
  const { t } = useTranslation();
  const container = _.find(pod.spec.containers, { name: props.match.params.name }) || _.find(pod.spec.initContainers, { name: props.match.params.name });
  if (!container) {
    return null;
  }

  const status = getContainerStatus(pod, container.name) || {};
  const state = getContainerState(status) || {};
  const { imageName, imageTag } = getImageNameAndTag(container.image);

  return (
    <div className="co-m-pane__body">
      <ScrollToTopOnMount />

      <div className="row">
        <div className="col-lg-4">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Container', t) })} />
          <dl className="co-m-pane__details">
            <dt>{t('CONTENT:STATE')}</dt>
            <dd>{state.label}</dd>
            <dt>{t('CONTENT:ID')}</dt>
            <dd>
              <Overflow value={status.containerID} />
            </dd>
            <dt>{t('CONTENT:RESTARTS')}</dt>
            <dd>{status.restartCount}</dd>
            <dt>{t('CONTENT:RESOURCEREQUESTS')}</dt>
            <dd>{getResourceRequestsValue(container) || '-'}</dd>
            <dt>{t('CONTENT:RESOURCERELIMITS')}</dt>
            <dd>{getResourceLimitsValue(container) || '-'}</dd>
            <dt>{t('CONTENT:LIFECYCLEHOOKS')}</dt>
            <dd>
              <Lifecycle lifecycle={container.lifecycle} />
            </dd>
            <dt>{t('CONTENT:READINESSPROBE')}</dt>
            <dd>
              <Probe probe={container.readinessProbe} podIP={pod.status.podIP || '-'} />
            </dd>
            <dt>{t('CONTENT:LIVENESSPROBE')}</dt>
            <dd>
              <Probe probe={container.livenessProbe} podIP={pod.status.podIP || '-'} />
            </dd>
            <dt>{t('CONTENT:STARTED')}</dt>
            <dd>
              <Timestamp timestamp={state.startedAt} />
            </dd>
            <dt>{t('CONTENT:FINISHED')}</dt>
            <dd>
              <Timestamp timestamp={state.finishedAt} />
            </dd>
            <dt>{t('RESOURCE:POD')}</dt>
            <dd>
              <ResourceLink kind="Pod" name={props.match.params.podName} namespace={props.match.params.ns} />
            </dd>
          </dl>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('CONTENT:IMAGEDETAILS')} />
          <dl className="co-m-pane__details">
            <dt>{t('CONTENT:IMAGE')}</dt>
            <dd>
              <Overflow value={imageName || '-'} />
            </dd>
            <dt>{t('CONTENT:IMAGEVERSIONTAG')}</dt>
            <dd>
              <Overflow value={imageTag || '-'} />
            </dd>
            <dt>{t('CONTENT:COMMAND')}</dt>
            <dd>
              {container.command ? (
                <pre>
                  <code>{container.command.join(' ')}</code>
                </pre>
              ) : (
                  <span>-</span>
                )}
            </dd>
            <dt>{t('CONTENT:ARGS')}</dt>
            <dd>
              {container.args ? (
                <pre>
                  <code>{container.args.join(' ')}</code>
                </pre>
              ) : (
                  <span>-</span>
                )}
            </dd>
            <dt>{t('CONTENT:PULLPOLICY')}</dt>
            <dd>{getPullPolicyLabel(container)}</dd>
          </dl>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('RESOURCE:NETWORK')} />
          <dl className="co-m-pane__details">
            {!HDCModeFlag && <div><dt>{t('RESOURCE:NODE')}</dt>
              <dd>
                <ResourceLink kind="Node" name={pod.spec.nodeName} title={pod.spec.nodeName} />
              </dd></div>}
            <dt>{t('CONTENT:PODIP')}</dt>
            <dd>{pod.status.podIP || '-'}</dd>
          </dl>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-lg-4">
          <SectionHeading text={t('CONTENT:PORTS')} />
          <div className="co-table-container">
            <Ports ports={container.ports} />
          </div>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('CONTENT:MOUNTEDVOLUMES')} />
          <div className="co-table-container">
            <Volumes volumes={container.volumeMounts} />
          </div>
        </div>

        <div className="col-lg-4">
          <SectionHeading text={t('CONTENT:ENVVARIABLES')} />
          <div className="co-table-container">
            <Env env={container.env} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContainersDetailsPage = props => (
  <div>
    <NavTitle
      detail={true}
      title={props.match.params.name}
      kind="Container"
      breadcrumbsFor={() => [
        {
          name: props.match.params.podName,
          path: `${props.match.url
            .split('/')
            .filter((v, i) => i <= props.match.path.split('/').indexOf(':podName'))
            .join('/')}`,
        },
        { name: 'Container Details', path: `${props.match.url}` },
      ]}
    />
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
      <VertNav hideNav={true} pages={[{ name: 'container', href: '', component: Details }]} match={props.match} />
    </Firehose>
  </div>
);

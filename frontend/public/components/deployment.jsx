import * as React from 'react';
import * as _ from 'lodash-es';

import { DeploymentModel } from '../models';
import { configureUpdateStrategyModal } from './modals';
import { DetailsPage, List, ListPage, WorkloadListHeader, WorkloadListRow } from './factory';
import { Cog, DeploymentPodCounts, SectionHeading, LoadingInline, navFactory, Overflow, pluralize, ResourceSummary } from './utils';
import { Conditions } from './conditions';
import { EnvironmentPage } from './environment';
import { ResourceEventStream } from './events';
import { formatDuration } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const { ModifyCount, EditEnvironment, common } = Cog.factory;

const UpdateStrategy = (kind, deployment) => {
  const { t } = useTranslation();
  return {
    label: t('CONTENT:EDITUPDATESTRATEGY'),
    callback: () => configureUpdateStrategyModal({ deployment }),
  };
};

const menuActions = [ModifyCount, UpdateStrategy, EditEnvironment, ...common];

const ContainerRow = ({ container }) => {
  const resourceLimits = _.get(container, 'resources.limits');
  const ports = _.get(container, 'ports');
  return (
    <div className="row">
      <div className="col-xs-6 col-sm-4 col-md-3">{container.name}</div>
      <Overflow className="col-xs-6 col-sm-4 col-md-3" value={container.image} />
      <div className="col-sm-4 col-md-3 hidden-xs">{_.map(resourceLimits, (v, k) => `${k}: ${v}`).join(', ') || '-'}</div>
      <Overflow className="col-md-3 hidden-xs hidden-sm" value={_.map(ports, port => `${port.containerPort}/${port.protocol}`).join(', ')} />
    </div>
  );
};

export const ContainerTable = ({ containers }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-xs-6 col-sm-4 col-md-3">{t('CONTENT:NAME')}</div>
        <div className="col-xs-6 col-sm-4 col-md-3">{t('CONTENT:IMAGE')}</div>
        <div className="col-sm-4 col-md-3 hidden-xs">{t('CONTENT:RESOURCELIMITS')}</div>
        <div className="col-md-3 hidden-xs hidden-sm">{t('CONTENT:PORTS')}</div>
      </div>
      <div className="co-m-table-grid__body">
        {_.map(containers, (c, i) => (
          <ContainerRow key={i} container={c} />
        ))}
      </div>
    </div>
  );
};

const DeploymentDetails = ({ obj: deployment }) => {
  const isRecreate = deployment.spec.strategy.type === 'Recreate';
  const progressDeadlineSeconds = _.get(deployment, 'spec.progressDeadlineSeconds');

  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Deployment', t) })} />
        <DeploymentPodCounts resource={deployment} resourceKind={DeploymentModel} t={t} />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={deployment}>
                <dt>{t('CONTENT:STATUS')}</dt>
                <dd>
                  {deployment.status.availableReplicas === deployment.status.updatedReplicas ? (
                    <span>{t('CONTENT:ACTIVE')}</span>
                  ) : (
                    <div>
                      <span className="co-icon-space-r">
                        <LoadingInline />
                      </span>{' '}
                      {t('CONTENT:UPDATING')}
                    </div>
                  )}
                </dd>
              </ResourceSummary>
            </div>
            <div className="col-sm-6">
              <dl className="co-m-pane__details">
                <dt>{t('CONTENT:UPDATESTRATEGY')}</dt>
                <dd>{deployment.spec.strategy.type || 'RollingUpdate'}</dd>
                {isRecreate || <dt>{t('CONTENT:MAXUNAVAILABLE')}</dt>}
                {isRecreate || (
                  <dd>
                    {t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_4', { something1: deployment.spec.strategy.rollingUpdate.maxUnavailable, something2: t('PLURAL:POD', { count: deployment.spec.replicas }) })}
                    {/* {deployment.spec.strategy.rollingUpdate.maxUnavailable || 1} of {t('PLURAL:POD', { count: deployment.spec.replicas })} */}
                  </dd>
                )}
                {isRecreate || <dt>{t('CONTENT:MAXSURGE')}</dt>}
                {isRecreate || (
                  <dd>
                    {t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_5', { something1: deployment.spec.strategy.rollingUpdate.maxSurge, something2: t('PLURAL:POD', { count: deployment.spec.replicas }) })}
                    {/* {deployment.spec.strategy.rollingUpdate.maxSurge || 1} greater than {t('PLURAL:POD', { count: deployment.spec.replicas })} */}
                  </dd>
                )}
                {progressDeadlineSeconds && <dt>{t('CONTENT:PROGRESSDEADLINE')}</dt>}
                {progressDeadlineSeconds && <dd>{/* Convert to ms for formatDuration */ formatDuration(progressDeadlineSeconds * 1000)}</dd>}
                <dt>{t('CONTENT:MINREADYSECONDS')}</dt>
                <dd>{deployment.spec.minReadySeconds ? t('PLURAL:SECOND', { count: deployment.spec.minReadySeconds }) : t('CONTENT:NOTCONFIGURED')}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:CONTAINERS')} />
        <ContainerTable containers={deployment.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:CONDITIONS')} />
        <Conditions conditions={deployment.status.conditions} />
      </div>
    </React.Fragment>
  );
};

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = props => {
  const { t } = useTranslation();
  return <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec.containers} envPath={envPath} readOnly={false} t={t} />;
};

const { details, editYaml, pods, envEditor, events } = navFactory;
const DeploymentsDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} menuActions={menuActions} pages={[details(DeploymentDetails, t('CONTENT:OVERVIEW')), editYaml(), pods(t('CONTENT:PODS')), envEditor(environmentComponent, t('CONTENT:ENVIRONMENT')), events(ResourceEventStream, t('CONTENT:EVENTS'))]} />;
};

const Row = props => <WorkloadListRow {...props} kind="Deployment" actions={menuActions} />;
const DeploymentsList = props => <List {...props} Header={WorkloadListHeader} Row={Row} />;
const DeploymentsPage = props => {
  const { t } = useTranslation();

  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/deployments/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  return <ListPage ListComponent={DeploymentsList} canCreate={true} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} createProps={createProps} {...props} />;
};
export { DeploymentsList, DeploymentsPage, DeploymentsDetailsPage };

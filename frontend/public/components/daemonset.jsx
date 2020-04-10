import * as React from 'react';
import { Link } from 'react-router-dom';

import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { SectionHeading, Cog, LabelList, ResourceCog, ResourceLink, ResourceSummary, Selector, navFactory, detailsPage } from './utils';
import { EnvironmentPage } from './environment';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.EditEnvironment, ...Cog.factory.common];

const DaemonSetHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 hidden-xs" sortField="metadata.labels">
        {t('CONTENT:LABELS')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortFunc="daemonsetNumScheduled">
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 hidden-md hidden-sm hidden-xs" sortField="spec.selector">
        {t('CONTENT:PODSELECTOR')}
      </ColHead>
    </ListHeader>
  );
};

const DaemonSetRow = ({ obj: daemonset }) => (
  <ResourceRow obj={daemonset}>
    <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind="DaemonSet" resource={daemonset} />
      <ResourceLink kind="DaemonSet" name={daemonset.metadata.name} namespace={daemonset.metadata.namespace} title={daemonset.metadata.uid} />
    </div>
    <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">
      <ResourceLink kind="Namespace" name={daemonset.metadata.namespace} title={daemonset.metadata.namespace} />
    </div>
    <div className="col-lg-3 col-md-4 col-sm-4 hidden-xs">
      <LabelList kind="DaemonSet" labels={daemonset.metadata.labels} />
    </div>
    <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
      <Link to={`/k8s/ns/${daemonset.metadata.namespace}/daemonsets/${daemonset.metadata.name}/pods`} title="pods">
        {daemonset.status && daemonset.status.currentNumberScheduled} of {daemonset.status && daemonset.status.desiredNumberScheduled} pods
      </Link>
    </div>
    <div className="col-lg-3 hidden-md hidden-sm hidden-xs">
      <Selector selector={daemonset.spec.selector} namespace={daemonset.metadata.namespace} />
    </div>
  </ResourceRow>
);

const Details = ({ obj: daemonset }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('DaemonSet', t) })} />
      <div className="row">
        <div className="col-lg-6">
          <ResourceSummary resource={daemonset} />
        </div>
        <div className="col-lg-6">
          <dl className="co-m-pane__details">
            <dt>{t('CONTENT:CURRENTCOUNT')}</dt>
            <dd>{(daemonset.status && daemonset.status.currentNumberScheduled) || '-'}</dd>
            <dt>{t('CONTENT:DESIREDCOUNT')}</dt>
            <dd>{(daemonset.status && daemonset.status.desiredNumberScheduled) || '-'}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = props => <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec.containers} envPath={envPath} readOnly={false} />;

const { details, pods, editYaml, envEditor } = navFactory;

const DaemonSets = props => <List {...props} Header={DaemonSetHeader} Row={DaemonSetRow} />;
const DaemonSetsPage = props => <ListPage canCreate={true} ListComponent={DaemonSets} {...props} />;
const DaemonSetsDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[details(detailsPage(Details)), editYaml(), pods(), envEditor(environmentComponent)]} />;

export { DaemonSets, DaemonSetsPage, DaemonSetsDetailsPage };

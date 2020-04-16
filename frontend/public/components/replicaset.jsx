import * as React from 'react';

import { DetailsPage, List, ListPage, WorkloadListHeader, WorkloadListRow } from './factory';
import { Cog, navFactory, SectionHeading, ResourceSummary, ResourcePodCount } from './utils';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { EnvironmentPage } from './environment';
import { ResourceEventStream } from './events';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const { ModifyCount, EditEnvironment, common } = Cog.factory;
export const replicaSetMenuActions = [ModifyCount, EditEnvironment, ...common];

const Details = ({ obj: replicaSet }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Replicaset', t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={replicaSet} />
          </div>
          <div className="col-md-6">
            <dt>{t('CONTENT:CURRENTCOUNT')}</dt>
            <dd>{replicaSet.status.replicas || 0}</dd>
            <dt>{t('CONTENT:DESIREDCOUNT')}</dt>
            <dd>{replicaSet.spec.replicas || 0}</dd>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = props => {
  const { t } = useTranslation();
  return <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec.containers} envPath={envPath} readOnly={false} t={t} />;
};
// const { details, editYaml, pods, envEditor, events } = navFactory;
const ReplicaSetsDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      breadcrumbsFor={obj =>
        breadcrumbsForOwnerRefs(obj).concat({
          name: t(`RESOURCE:${obj.kind.toUpperCase()}`) + ' ' + t('CONTENT:DETAILS'),
          path: props.match.url,
        })
      }
      menuActions={replicaSetMenuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml(t('CONTENT:YAML')), navFactory.pods(t('CONTENT:PODS')), navFactory.envEditor(environmentComponent, t('CONTENT:ENVIRONMENT')), navFactory.events(ResourceEventStream, t('CONTENT:EVENTS'))]}
    />
  );
};

const Row = props => <WorkloadListRow {...props} kind="ReplicaSet" actions={replicaSetMenuActions} />;
const ReplicaSetsList = props => <List {...props} Header={WorkloadListHeader} Row={Row} />;
const ReplicaSetsPage = props => {
  const { t } = useTranslation();
  return <ListPage canCreate={true} ListComponent={ReplicaSetsList} {...props} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};

export { ReplicaSetsList, ReplicaSetsPage, ReplicaSetsDetailsPage };

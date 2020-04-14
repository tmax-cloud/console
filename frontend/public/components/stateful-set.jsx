import * as React from 'react';

import { DetailsPage, List, ListPage, WorkloadListHeader, WorkloadListRow } from './factory';
import { Cog, navFactory, SectionHeading, ResourceSummary } from './utils';
import { EnvironmentPage } from './environment';
import { ResourceEventStream } from './events';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.EditEnvironment, ...Cog.factory.common];

const kind = 'StatefulSet';
const Row = props => <WorkloadListRow {...props} kind={kind} actions={menuActions} />;

const Details = ({ obj: ss }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('StatefulSet', t) })} />
        <ResourceSummary resource={ss} showNodeSelector={false} />
      </div>
    </React.Fragment>
  );
};

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = props => {
  const { t } = useTranslation();
  return <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec.containers} envPath={envPath} readOnly={false} t={t} />;
};

export const StatefulSetsList = props => <List {...props} Header={WorkloadListHeader} Row={Row} />;
export const StatefulSetsPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={StatefulSetsList} kind={kind} canCreate={true} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })} />;
};

export const StatefulSetsDetailsPage = props => {
  const { t } = useTranslation();

  const pages = [navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml(), navFactory.pods(t('CONTENT:PODS')), navFactory.envEditor(environmentComponent, t('CONTENT:ENVIRONMENT')), navFactory.events(ResourceEventStream, t('CONTENT:EVENTS'))];
  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};

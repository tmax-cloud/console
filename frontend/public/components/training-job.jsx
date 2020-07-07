import * as _ from 'lodash-es';
import * as React from 'react';


import { ColHead, DetailsPage, List, ListHeader, MultiListPage } from './factory';
import { Cog, SectionHeading, ResourceCog, ResourceLink, ResourceSummary, navFactory } from './utils';

import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

export const tjKind = tj => {
  return tj.kind === 'PyTorchJob' ? 'pytorchjob' : 'tfjob';
};

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const tjPhase = tj => {
  let len = tj.status.conditions.length;
  for (let i = len - 1; i>=0; i--) {
    if (tj.status.conditions[i].status) {
      return tj.status.conditions[i].type;
    }
  }
};

const TJStatus = ({ tj }) => {
  const phase = tjPhase(tj);
  if (!phase) {
    return '-';
  }

  switch (phase) {
    case 'Running':
      return (
        <span className="text-muted">
          <i className="fa fa-hourglass-half" aria-hidden="true"></i> Running
        </span>
      );
    case 'Restarting':
      return (
        <span className="text-muted">
          <i className="fa fa-hourglass-half" aria-hidden="true"></i> Restarting
        </span>
      );
    case 'Created':
      return (
        <span className="pvc-bound">
          <i className="fa fa-check" aria-hidden="true"></i> Created
        </span>
      );
    case 'Succeeded':
      return (
        <span className="pvc-bound">
          <i className="fa fa-check" aria-hidden="true"></i> Succeeded
        </span>
      );
    case 'Failed':
      return (
        <span className="pvc-lost">
          <i className="fa fa-minus-circle" aria-hidden="true"></i> Failed
        </span>
      );
    default:
      return phase;
  }
};

const TJComposition = ({ tj }) => {
  const specs = Object.entries(tj.spec);
  const keys = Object.keys(specs[0][1]);
  let str = '';
  for (let i = 0; i < keys.length; i++) {
    str += `${keys[i]} ${specs[0][1][keys[i]].replicas}`;
    if (i !== keys.length - 1) {
      str += ', ';
    }
  }

  return (
    <span className="pvc-lost">
      {str}
    </span>
  );
};

const Header = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">{t('CONTENT:NAME')}</ColHead>
      <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.namespace">{t('CONTENT:NAMESPACE')}</ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortFunc="tjPhase">{t('CONTENT:STATUS')}</ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortFunc="tjComposition">{t('CONTENT:COMPOSITION')}</ColHead>
    </ListHeader>
  );
};

const Row = ({ obj }) => {
  return (
    <div className="row co-resource-list__item">
      <div className="col-sm-4 col-xs-6 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind={obj.kind} resource={obj} />
        <ResourceLink kind={obj.kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </div>
      <div className="col-sm-4 col-xs-4 co-break-word">
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </div>
      <div className="col-sm-2 hidden-xs">
        <TJStatus tj={obj} />
      </div>
      <div className="col-sm-2 hidden-xs">
        <TJComposition tj={obj} />
      </div>
    </div>
  );
};

const DetailsForKind = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('TASK', t) })} />
        <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
      </div>
    </React.Fragment>
  );
};

const TrainingJobsList = props => <List {...props} Header={Header} Row={Row} />;
TrainingJobsList.displayName = 'TrainingJobsList';

const TrainingJobsPage = ({ namespace, showTitle}) => {
  const { t } = useTranslation();

  const createItems = {
    tfjob: t('CONTENT:YAMLEDITORTFJOB'),
    pytorchjob: t('CONTENT:YAMLEDITORPYTORCHJOB'),
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${namespace || 'default'}/${type}s/new`,
  };

  return (
    <MultiListPage
      ListComponent={TrainingJobsList}
      canCreate={true}
      showTitle={showTitle}
      namespace={namespace}
      createProps={createProps}
      filterLabel="TrainingJobs by name"
      flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('TrainingJob', t) })}
      resources={[
        { kind: 'TFJob', namespaced: true, optional: true },
        { kind: 'PyTorchJob', namespaced: true, optional: true },
      ]}
      rowFilters={[
        {
          type: 'trainingjob-kind',
          selected: ['tfjob', 'pytorchjob'],
          reducer: tjKind,
          items: [
            { id: 'tfjob', title: 'TF Job' },
            { id: 'pytorchjob', title: 'Pytorch Job' },
          ],
        },
      ]}
      title={t('RESOURCE:TRAININGJOB')}
    />
  );
};

const TrainingJobsDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      menuActions={menuActions}
      pages={[navFactory.details(DetailsForKind, t('CONTENT:OVERVIEW')), navFactory.editYaml() /*, navFactory.pods(t('CONTENT:PODS')) */]}
    />
  );
};

export { TrainingJobsList, TrainingJobsPage, TrainingJobsDetailsPage};


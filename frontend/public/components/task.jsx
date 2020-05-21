import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, MultiListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference, referenceForModel } from '../module/k8s';
import { TaskModel } from '../models';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

export const taskKind = task => (task.metadata.namespace ? 'Task' : 'ClusterTask');

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const TaskHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-4 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const TaskRow = () =>
  // eslint-disable-next-line no-shadow
  function TaskRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind={taskKind(obj)} resource={obj} />
          <ResourceLink kind={taskKind(obj)} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-4 col-sm-4 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'All'}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
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

export const TaskList = props => {
  const { kinds } = props;
  const Row = TaskRow(kinds[0]);
  Row.displayName = 'TaskRow';
  return <List {...props} Header={TaskHeader} Row={Row} />;
};
TaskList.displayName = TaskList;

// export const TasksPage = props => {
//   const { t } = useTranslation();
//   return <ListPage {...props} ListComponent={TaskList} canCreate={true} kind="Task" createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
// };
// TasksPage.displayName = 'TasksPage';

export const taskType = task => {
  return task.metadata.namespace ? 'namespace' : 'cluster';
};

export const TasksPage = (({ namespace, showTitle }) => {
  const { t } = useTranslation();
  return (
    <MultiListPage
      ListComponent={TaskList}
      canCreate={true}
      showTitle={showTitle}
      namespace={namespace}
      createProps={{ to: `/k8s/ns/${namespace || 'default'}/tasks/new` }}
      filterLabel="Tasks by name"
      flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Task', t) })}
      resources={[
        { kind: 'Task', namespaced: true, optional: true },
        { kind: 'ClusterTask', namespaced: false, optional: true },
      ]}
      rowFilters={[
        {
          type: 'task-kind',
          selected: ['cluster', 'namespace'],
          reducer: taskType,
          items: [
            { id: 'cluster', title: 'Cluster-wide Tasks' },
            { id: 'namespace', title: 'Namespace Tasks' },
          ],
        },
      ]}
      title={t('RESOURCE:TASK')}
    />
  );
});





export const TaskDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      // breadcrumbsFor={obj =>
      //   breadcrumbsForOwnerRefs(obj).concat({
      //     name: 'Task Details',
      //     path: props.match.url,
      //   })
      // }
      menuActions={menuActions}
      pages={[navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};
export const ClusterTasksDetailsPage = TaskDetailsPage;
TaskDetailsPage.displayName = 'TaskDetailsPage';

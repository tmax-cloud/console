import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
    Cog,
    navFactory,
    ResourceCog,
    SectionHeading,
    ResourceLink,
    ResourceSummary
} from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference, referenceForModel } from '../module/k8s';
import { TaskModel } from '../models';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
    Cog.factory.ModifyLabels,
    Cog.factory.ModifyAnnotations,
    Cog.factory.Edit,
    Cog.factory.Delete
];

const TaskHeader = props => (
    <ListHeader>
        <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
            Name
    </ColHead>
        <ColHead
            {...props}
            className="col-xs-3 col-sm-3"
            sortField="metadata.namespace"
        >
            Namespace
    </ColHead>

        <ColHead
            {...props}
            className="col-sm-3 hidden-xs"
            sortField="metadata.creationTimestamp"
        >
            Created
    </ColHead>
    </ListHeader>
);

const TaskRow = () =>
    // eslint-disable-next-line no-shadow
    function TaskRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
                    <ResourceCog
                        actions={menuActions}
                        kind="Task"
                        resource={obj}
                    />
                    <ResourceLink
                        kind="Task"
                        name={obj.metadata.name}
                        namespace={obj.metadata.namespace}
                        title={obj.metadata.name}
                    />
                </div>
                <div className="col-xs-3 col-sm-3 co-break-word">
                    {obj.metadata.namespace ? (
                        <ResourceLink
                            kind="Namespace"
                            name={obj.metadata.namespace}
                            title={obj.metadata.namespace}
                        />
                    ) : (
                            'None'
                        )}
                </div>
                <div className="col-xs-3 col-sm-3 co-break-word">
                    {(obj.objects && obj.objects.length) || 'None'}
                </div>
                <div className="col-xs-3 col-sm-3 hidden-xs">
                    {fromNow(obj.metadata.creationTimestamp)}
                </div>
            </div>
        );
    };



export const TaskList = props => {
    const { kinds } = props;
    const Row = TaskRow(kinds[0]);
    Row.displayName = 'TaskRow';
    return <List {...props} Header={TaskHeader} Row={Row} />;
};
TaskList.displayName = TaskList;

export const TasksPage = props => (
    <ListPage
        {...props}
        ListComponent={TaskList}
        canCreate={true}
        kind="Task"
    />
);
TasksPage.displayName = 'TasksPage';

// export const TaskDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const TaskDetailsPage = props => (
    <DetailsPage
        {...props}
        breadcrumbsFor={obj =>
            breadcrumbsForOwnerRefs(obj).concat({
                name: 'Task Details',
                path: props.match.url
            })
        }
        menuActions={menuActions}
        pages={[
            navFactory.details(DetailsForKind(props.kind)),
            navFactory.editYaml()
        ]}
    />
);

TaskDetailsPage.displayName = 'TaskDetailsPage';

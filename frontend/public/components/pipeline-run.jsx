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
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { PipelineRunModel } from '../models';

const menuActions = [
    Cog.factory.ModifyLabels,
    Cog.factory.ModifyAnnotations,
    Cog.factory.Edit,
    Cog.factory.Delete
];

const PipelineRunHeader = props => (
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

const PipelineRunRow = () =>
    // eslint-disable-next-line no-shadow
    function PipelineRunRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
                    <ResourceCog
                        actions={menuActions}
                        kind="PipelineRun"
                        resource={obj}
                    />
                    <ResourceLink
                        kind="PipelineRun"
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

const DetailsForKind = kind =>
    function DetailsForKind_({ obj }) {
        return (
            <React.Fragment>
                <div className="co-m-pane__body">
                    <SectionHeading text={`Pipeline Run Overview`} />
                    <ResourceSummary
                        resource={obj}
                        podSelector="spec.podSelector"
                        showNodeSelector={false}
                    />
                </div>
            </React.Fragment>
        );
    };

export const PipelineRunList = props => {
    const { kinds } = props;
    const Row = PipelineRunRow(kinds[0]);
    Row.displayName = 'PipelineRun';
    return <List {...props} Header={PipelineRunHeader} Row={Row} />;
};
PipelineRunList.displayName = PipelineRunList;

export const PipelineRunsPage = props => (
    <ListPage
        {...props}
        ListComponent={PipelineRunList}
        canCreate={true}
        kind="PipelineRun"
    />
);
PipelineRunsPage.displayName = 'PipelineRunsPage';

// export const TaskDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const PipelineRunDetailsPage = props => (
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

PipelineRunDetailsPage.displayName = 'PipelineRunDetailsPage';

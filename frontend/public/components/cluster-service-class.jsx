import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
    Cog,
    navFactory,
    ResourceCog,
    SectionHeading,
    ResourceLink,
    ScrollToTopOnMount,
    ResourceSummary
} from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
    Cog.factory.ModifyLabels,
    Cog.factory.ModifyAnnotations,
    Cog.factory.Edit,
    Cog.factory.Delete
];

const ClusterServiceClassHeader = props => (
    <ListHeader>
        <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
            Name
    </ColHead>
        <ColHead
            {...props}
            className="col-sm-4 hidden-xs"
            sortField="metadata.creationTimestamp" >
            Created
    </ColHead>
    </ListHeader>
);

const ClusterServiceClassRow = () =>
    // eslint-disable-next-line no-shadow
    function ClusterServiceClassRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
                    <ResourceCog
                        actions={menuActions}
                        kind="ClusterServiceClass"
                        resource={obj}
                    />
                    <ResourceLink
                        kind="ClusterServiceClass"
                        name={obj.metadata.name}
                        title={obj.metadata.name}
                    />
                </div>
                <div className="col-xs-4 col-sm-4 hidden-xs">
                    {fromNow(obj.metadata.creationTimestamp)}
                </div>
            </div>
        );
    };


const Details = ({ obj: ClusterServiceClass }) => {
    return (
        <React.Fragment>
            <ScrollToTopOnMount />
            <div className="co-m-pane__body">
                <SectionHeading text="Pod Overview" />
                <div className="row">
                    <div className="col-sm-6">
                        <ResourceSummary resource={ClusterServiceClass} />
                    </div>
                    {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
                </div>
            </div>
        </React.Fragment>
    )
}

export const ClusterServiceClassList = props => {
    const { kinds } = props;
    const Row = ClusterServiceClassRow(kinds[0]);
    Row.displayName = 'ClusterServiceClassRow';
    return <List {...props} Header={ClusterServiceClassHeader} Row={Row} />;
};
ClusterServiceClassList.displayName = ClusterServiceClassList;

export const ClusterServiceClassesPage = props => (
    <ListPage
        {...props}
        ListComponent={ClusterServiceClassList}
        canCreate={true}
        kind="ClusterServiceClass"
    />
);
ClusterServiceClassesPage.displayName = 'ClusterServiceClassesPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const ClusterServiceClassesDetailsPage = props => (
    <DetailsPage
        {...props}
        breadcrumbsFor={obj =>
            breadcrumbsForOwnerRefs(obj).concat({
                name: 'ClusterServiceClass Details',
                path: props.match.url
            })
        }
        kind="ClusterServiceClass"
        menuActions={menuActions}
        pages={[
            navFactory.details(Details),
            navFactory.editYaml()
        ]}
    />
);

ClusterServiceClassesDetailsPage.displayName = 'ClusterServiceClassesDetailsPage';

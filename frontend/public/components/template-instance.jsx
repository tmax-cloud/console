import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { referenceFor, kindForReference, referenceForModel } from '../module/k8s';
import { TemplateInstanceModel } from '../models';


const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const TemplateInstanceHeader = props => <ListHeader>
    <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">Name</ColHead>
    <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.namespace">Namespace</ColHead>
    <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.namespace">Parameter Count</ColHead>
    <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">Created</ColHead>
</ListHeader>;

const TemplateInstanceRow = kind => function TemplateInstanceRow({ obj }) {
    return <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
            <ResourceCog actions={menuActions} kind={referenceForModel(TemplateInstanceModel)} resource={obj} />
            <ResourceLink kind={referenceForModel(TemplateInstanceModel)} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-3 col-sm-3 co-break-word">
            {obj.metadata.namespace
                ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
                : 'None'
            }
        </div>
        <div className="col-xs-3 col-sm-3 co-break-word">
            {
                (obj.spec.template && obj.spec.template.parameters.length) || 'None'
            }
        </div>
        <div className="col-xs-3 col-sm-3 hidden-xs">
            {fromNow(obj.metadata.creationTimestamp)}
        </div>
    </div>;
};

const DetailsForKind = kind => function DetailsForKind_({ obj }) {
    return <React.Fragment>
        <div className="co-m-pane__body">
            <SectionHeading text={`${kindForReference(kind)} Overview`} />
            <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
    </React.Fragment>;
};

export const TemplateInstanceList = props => {
    const { kinds } = props;
    const Row = TemplateInstanceRow(kinds[0]);
    Row.displayName = 'TemplateInstanceRow';
    return <List {...props} Header={TemplateInstanceHeader} Row={Row} />;
};
TemplateInstanceList.displayName = TemplateInstanceList;

export const TemplateInstancesPage = props =>
    <ListPage {...props} ListComponent={TemplateInstanceList} canCreate={true} kind={referenceForModel(TemplateInstanceModel)} />;
TemplateInstancesPage.displayName = 'TemplateInstancesPage';


export const TemplateInstancesDetailsPage = props => {
    const pages = [navFactory.details(DetailsForKind(props.kind)), navFactory.editYaml()];
    return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};

TemplateInstancesDetailsPage.displayName = 'TemplateInstancesDetailsPage';

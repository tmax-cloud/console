import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const WorkflowHeader = props => {
    const { t } = useTranslation();
    return (
        <ListHeader>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
                {t('CONTENT:NAME')}
            </ColHead>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
                {t('CONTENT:NAMESPACE')}
            </ColHead>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.hosts">
                {t('CONTENT:PIPELINE')}
            </ColHead>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.gateways">
                {t('CONTENT:STATUS')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:ElAPSEDTIME')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:STARTTIME')}
            </ColHead>
        </ListHeader>
    );
};

const WorkflowRow = () =>
    // eslint-disable-next-line no-shadow
    function WorkflowRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
                    <ResourceCog actions={menuActions} kind="Workflow" resource={obj} />
                    <ResourceLink kind="Workflow" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
                </div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.hosts}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.gateways}</div>
                <div className="col-xs-2 col-sm-2 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
                <div className="col-xs-2 col-sm-2 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
            </div>
        );
    };

const Details = ({ obj: condition }) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <ScrollToTopOnMount />
            <div className="co-m-pane__body">
                <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('UserSecurityPolicy', t) })} />
                <div className="row">
                    <div className="col-sm-6">
                        <ResourceSummary resource={condition} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export const WorkflowList = props => {
    const { kinds } = props;
    const Row = WorkflowRow(kinds[0]);
    Row.displayName = 'WorkflowRow';
    return <List {...props} Header={WorkflowHeader} Row={Row} />;
};
WorkflowList.displayName = WorkflowList;

export const WorkflowPage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={WorkflowList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="Workflow" />;
};
WorkflowPage.displayName = 'WorkflowPage';

export const WorkflowDetailsPage = props => {
    const { t } = useTranslation();
    return (
        <DetailsPage
            {...props}
            kind="Workflow"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
        />
    );
};

WorkflowDetailsPage.displayName = 'WorkflowDetailsPage';

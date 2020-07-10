import * as _ from 'lodash-es';
import * as React from 'react';
import { PodsPage } from './pod';
import { StatefulSetsPage } from './stateful-set';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

// const menuActions = [...Cog.factory.common, Cog.factory.Connect];
const menuActions = [...Cog.factory.common];
const NotebookHeader = props => {
    const { t } = useTranslation();
    return (
        <ListHeader>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
                {t('CONTENT:NAME')}
            </ColHead>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
                {t('CONTENT:NAMESPACE')}
            </ColHead>
            <ColHead {...props} className="col-xs-5 col-sm-5" sortField="spec.template.spec.containers[0].image">
                {t('CONTENT:IMAGE')}
            </ColHead>

        </ListHeader>
    );
};

const NotebookRow = () =>
    // eslint-disable-next-line no-shadow
    function NotebookRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
                    <ResourceCog actions={menuActions} kind="Notebook" resource={obj} />
                    <ResourceLink kind="Notebook" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
                </div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
                <div className="col-xs-5 col-sm-5 co-break-word">{obj.spec.template.spec.containers[0].image}</div>
            </div>
        );
    };

const Details = ({ obj: condition }) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <ScrollToTopOnMount />
            <div className="co-m-pane__body">
                <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Notebook', t) })} />
                <div className="row">
                    <div className="col-sm-6">
                        <ResourceSummary resource={condition} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export const NotebookList = props => {
    const { kinds } = props;
    const Row = NotebookRow(kinds[0]);
    Row.displayName = 'NotebookRow';
    return <List {...props} Header={NotebookHeader} Row={Row} />;
};
NotebookList.displayName = NotebookList;

export const NotebookPage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={NotebookList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="Notebook" />;
};
NotebookPage.displayName = 'NotebookPage';

export const NotebookDetailsPage = props => {
    const { t } = useTranslation();
    const statefultSetComponent = props => {
        let selector = { matchLabels: { 'notebook-name': props.match.params.name } }
        return <StatefulSetsPage obj={props.obj} showTitle={false} namespace={props.match.params.ns} selector={selector} canCreate={false} />;
    };
    const podComponent = props => {
        let selector = { matchLabels: { 'notebook-name': props.match.params.name } }
        return <PodsPage obj={props.obj} showTitle={false} namespace={props.match.params.ns} selector={selector} canCreate={false} />;
    };
    return (
        <DetailsPage
            {...props}
            kind="Notebook"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml(), navFactory.statefulsets(t('RESOURCE:STATEFULSET'), statefultSetComponent), navFactory.pods(t('RESOURCE:POD'), podComponent)]}
        />
    );
};

NotebookDetailsPage.displayName = 'NotebookDetailsPage';

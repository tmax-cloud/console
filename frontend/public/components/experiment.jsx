import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const ExperimentHeader = props => {
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
                {t('CONTENT:STATUS')}
            </ColHead>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.gateways">
                {t('CONTENT:ALGORITHMNAME')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:CURRENTTRIAL')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:MAXTRIALCOUNT')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:CURRENTOPTIMAL')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:OBJECTIVE')}
            </ColHead>
        </ListHeader>
    );
};

const ExperimentRow = () =>
    // eslint-disable-next-line no-shadow
    function ExperimentRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
                    <ResourceCog actions={menuActions} kind="Experiment" resource={obj} />
                    <ResourceLink kind="Experiment" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
                </div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.hosts}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.gateways}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.gateways}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.gateways}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.gateways}</div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.spec.gateways}</div>
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

export const ExperimentList = props => {
    const { kinds } = props;
    const Row = ExperimentRow(kinds[0]);
    Row.displayName = 'ExperimentRow';
    return <List {...props} Header={ExperimentHeader} Row={Row} />;
};
ExperimentList.displayName = ExperimentList;

export const ExperimentPage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={ExperimentList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="Experiment" />;
};
ExperimentPage.displayName = 'ExperimentPage';

export const ExperimentDetailsPage = props => {
    const { t } = useTranslation();
    return (
        <DetailsPage
            {...props}
            kind="Experiment"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
        />
    );
};

ExperimentDetailsPage.displayName = 'ExperimentDetailsPage';

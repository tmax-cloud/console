import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const InferenceServiceHeader = props => {
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
                {t('CONTENT:FRAMEWORK')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:CPU')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:MEMORY')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:STORAGEURI')}
            </ColHead>
            <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:URL')}
            </ColHead>
        </ListHeader>
    );
};

const InferenceServiceRow = () =>
    // eslint-disable-next-line no-shadow
    function InferenceServiceRow({ obj }) {
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

export const InferenceServiceList = props => {
    const { kinds } = props;
    const Row = InferenceServiceRow(kinds[0]);
    Row.displayName = 'InferenceServiceRow';
    return <List {...props} Header={InferenceServiceHeader} Row={Row} />;
};
InferenceServiceList.displayName = InferenceServiceList;

export const InferenceServicePage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={InferenceServiceList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="InferenceService" />;
};
InferenceServicePage.displayName = 'InferenceServicePage';

export const InferenceServiceDetailsPage = props => {
    const { t } = useTranslation();
    return (
        <DetailsPage
            {...props}
            kind="InferenceService"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
        />
    );
};

InferenceServiceDetailsPage.displayName = 'InferenceServiceDetailsPage';

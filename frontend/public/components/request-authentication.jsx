import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const RequestAuthenticationHeader = props => {
    const { t } = useTranslation();
    return (
        <ListHeader>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
                {t('CONTENT:NAME')}
            </ColHead>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
                {t('CONTENT:NAMESPACE')}
            </ColHead>
            <ColHead {...props} className="col-sm-1 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:CREATED')}
            </ColHead>
        </ListHeader>
    );
};

const RequestAuthenticationRow = () =>
    // eslint-disable-next-line no-shadow
    function RequestAuthenticationRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
                    <ResourceCog actions={menuActions} kind="RequestAuthentication" resource={obj} />
                    <ResourceLink kind="RequestAuthentication" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
                </div>
                <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
                <div className="col-xs-1 col-sm-1 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
            </div>
        );
    };

const Details = ({ obj: condition }) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <ScrollToTopOnMount />
            <div className="co-m-pane__body">
                <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('RequestAuthentication', t) })} />
                <div className="row">
                    <div className="col-sm-6">
                        <ResourceSummary resource={condition} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export const RequestAuthenticationList = props => {
    const { kinds } = props;
    const Row = RequestAuthenticationRow(kinds[0]);
    Row.displayName = 'RequestAuthenticationRow';
    return <List {...props} Header={RequestAuthenticationHeader} Row={Row} />;
};
RequestAuthenticationList.displayName = RequestAuthenticationList;

export const RequestAuthenticationPage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={RequestAuthenticationList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="RequestAuthentication" />;
};
RequestAuthenticationPage.displayName = 'RequestAuthenticationPage';

export const RequestAuthenticationDetailsPage = props => {
    const { t } = useTranslation();
    return (
        <DetailsPage
            {...props}
            kind="RequestAuthentication"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
        />
    );
};

RequestAuthenticationDetailsPage.displayName = 'RequestAuthenticationDetailsPage';

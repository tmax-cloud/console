import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete, Cog.factory.EditStatus];
let flag = 0;

const CatalogServiceClaimHeader = props => {
    const { t } = useTranslation();
    return (
        <ListHeader>
            <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.name">
                {t('CONTENT:NAME')}
            </ColHead>
            <ColHead {...props} className="col-xs-3 col-sm-3" sortField="status.status">
                {t('CONTENT:STATUS')}
            </ColHead>
            <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:CREATED')}
            </ColHead>
        </ListHeader>
    );
};
const CatalogServiceClaimRow = () =>
    function CatalogServiceClaimRow({ obj }) {
        flag = flag + 1;
        return (
            <div className="row co-resource-list__item">
                <div className="col-md-3 col-xs-3 co-resource-link-wrapper">
                    <ResourceCog actions={menuActions} kind="CatalogServiceClaim" resource={obj} />
                    <ResourceLink kind="CatalogServiceClaim" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
                </div>
                <div className="col-xs-3 col-sm-3 hidden-xs">{obj.status && obj.status.status}</div>
                <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
            </div>
        );
    };

const Details = ({ obj }) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <ScrollToTopOnMount />
            <div className="co-m-pane__body">
                <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('NAMESPACECLAIM', t) })} />
                <div className="row">
                    <div className="col-sm-6">
                        <ResourceSummary resource={obj} />
                    </div>
                    <div className="col-sm-6">
                        <dl className="co-m-pane__details">
                            <dt>{t('CONTENT:RESOURCENAME')}</dt>
                            <dd>{obj.resourceName}</dd>
                            <dt>{t('CONTENT:STATUS')}</dt>
                            <dd>{obj.status && obj.status.status}</dd>
                            {obj.status && obj.status.reason && <dt>{t('CONTENT:REASON')}</dt>}
                            {obj.status && obj.status.reason && <dd>{obj.status.reason}</dd>}
                        </dl>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export const CatalogServiceClaimList = props => {
    const { kinds } = props;
    const Row = CatalogServiceClaimRow(kinds[0]);
    Row.displayName = 'CatalogServiceClaimRow';
    return <List {...props} Header={CatalogServiceClaimHeader} Row={Row} />;
};
CatalogServiceClaimList.displayName = CatalogServiceClaimList;

export const CatalogServiceClaimPage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={CatalogServiceClaimList} canCreate={true} kind="CatalogServiceClaim" {...props} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};
CatalogServiceClaimPage.displayName = 'CatalogServiceClaimPage';

export const CatalogServiceClaimsDetailsPage = props => {
    const { t } = useTranslation();
    return (
        <DetailsPage
            {...props}
            kind="CatalogServiceClaim"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
        />
    );
};

CatalogServiceClaimsDetailsPage.displayName = 'CatalogServiceClaimsDetailsPage';

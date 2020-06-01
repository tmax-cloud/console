import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const UserSecurityPolicyHeader = props => {
    const { t } = useTranslation();
    return (
        <ListHeader>
            <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
                {t('CONTENT:NAME')}
            </ColHead>
            <ColHead {...props} className="col-sm-1 hidden-xs" sortField="metadata.creationTimestamp">
                {t('CONTENT:CREATED')}
            </ColHead>
        </ListHeader>
    );
};

const UserSecurityPolicyRow = () =>
    // eslint-disable-next-line no-shadow
    function UserSecurityPolicyRow({ obj }) {
        return (
            <div className="row co-resource-list__item">
                <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
                    <ResourceCog actions={menuActions} kind="Usersecuritypolicy" resource={obj} />
                    <ResourceLink kind="Usersecuritypolicy" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
                </div>
                <div className="col-xs-1 col-sm-1 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
            </div>
        );
    };

const Details = ({ obj: usersecuritypolicy }) => {
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <ScrollToTopOnMount />

            <div className="co-m-pane__body">
                <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('UserSecurityPolicy', t) })} />
                <div className="row">
                    <div className="col-sm-6">
                        <ResourceSummary resource={usersecuritypolicy} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export const UserSecurityPolicyList = props => {
    const { kinds } = props;
    const Row = UserSecurityPolicyRow(kinds[0]);
    Row.displayName = 'UserSecurityPolicyRow';
    return <List {...props} Header={UserSecurityPolicyHeader} Row={Row} />;
};
UserSecurityPolicyList.displayName = UserSecurityPolicyList;

export const UserSecurityPoliciesPage = props => {
    const { t } = useTranslation();
    return <ListPage {...props} ListComponent={UserSecurityPolicyList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="Usersecuritypolicy" />;
};
UserSecurityPoliciesPage.displayName = 'UserSecurityPoliesPage';

export const UserSecurityPoliciesDetailsPage = props => {
    const { t } = useTranslation();
    return (
        <DetailsPage
            {...props}
            kind="Usersecuritypolicy"
            menuActions={menuActions}
            pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
        />
    );
};

UserSecurityPoliciesDetailsPage.displayName = 'UserSecurityPoliciesDetailsPage';

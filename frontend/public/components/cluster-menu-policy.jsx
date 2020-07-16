import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ClusterMenuPolicyHeader = props => {
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

const ClusterMenuPolicyRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterMenuPolicyRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="ClusterMenuPolicy" resource={obj} />
          <ResourceLink kind="ClusterMenuPolicy" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-1 col-sm-1 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const Details = ({ obj: clustermenupolicy }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('ClusterMenuPolicy', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={clustermenupolicy} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const ClusterMenuPolicyList = props => {
  const { kinds } = props;
  const Row = ClusterMenuPolicyRow(kinds[0]);
  Row.displayName = 'ClusterMenuPolicyRow';
  return <List {...props} Header={ClusterMenuPolicyHeader} Row={Row} />;
};
ClusterMenuPolicyList.displayName = ClusterMenuPolicyList;

export const ClusterMenuPoliciesPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={ClusterMenuPolicyList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="ClusterMenuPolicy" />;
};
ClusterMenuPoliciesPage.displayName = 'ClusterMenuPoliesPage';

export const ClusterMenuPoliciesDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} kind="ClusterMenuPolicy" menuActions={menuActions} pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

ClusterMenuPoliciesDetailsPage.displayName = 'ClusterMenuPoliciesDetailsPage';

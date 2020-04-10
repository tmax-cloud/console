import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ScrollToTopOnMount, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ClusterServicePlanHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-6 col-sm-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-6 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const ClusterServicePlanRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterServicePlanRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="ClusterServicePlan" resource={obj} />
          <ResourceLink kind="ClusterServicePlan" name={obj.metadata.name} title={obj.metadata.name} />
        </div>
        <div className="col-xs-6 col-sm-6 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const Details = ({ obj: ClusterServicePlan }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={ClusterServicePlan} />
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
  );
};

export const ClusterServicePlanList = props => {
  const { kinds } = props;
  const Row = ClusterServicePlanRow(kinds[0]);
  Row.displayName = 'ClusterServicePlanRow';
  return <List {...props} Header={ClusterServicePlanHeader} Row={Row} />;
};
ClusterServicePlanList.displayName = ClusterServicePlanList;

export const ClusterServicePlansPage = props => <ListPage {...props} ListComponent={ClusterServicePlanList} kind="ClusterServicePlan" />;
ClusterServicePlansPage.displayName = 'ClusterServicePlansPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const ClusterServicePlansDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'ClusterServicePlan Details',
        path: props.match.url,
      })
    }
    kind="ClusterServicePlan"
    menuActions={menuActions}
    pages={[navFactory.details(Details), navFactory.editYaml()]}
  />
);

ClusterServicePlansDetailsPage.displayName = 'ClusterServicePlansDetailsPage';

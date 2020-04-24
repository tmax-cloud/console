import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ScrollToTopOnMount, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ClusterServiceClassHeader = props => {
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

const ClusterServiceClassRow = () =>
  // eslint-disable-next-line no-shadow
  function ClusterServiceClassRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          {/* <ResourceCog actions={menuActions} kind="ClusterServiceClass" resource={obj} /> */}
          <ResourceLink kind="ClusterServiceClass" name={obj.metadata.name} title={obj.metadata.name} />
        </div>
        <div className="col-xs-6 col-sm-6 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const Details = ({ obj: ClusterServiceClass }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('CLUSTERSERVICECLASS', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={ClusterServiceClass} />
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

export const ClusterServiceClassList = props => {
  const { kinds } = props;
  const Row = ClusterServiceClassRow(kinds[0]);
  Row.displayName = 'ClusterServiceClassRow';
  return <List {...props} Header={ClusterServiceClassHeader} Row={Row} />;
};
ClusterServiceClassList.displayName = ClusterServiceClassList;

export const ClusterServiceClassesPage = props => <ListPage {...props} ListComponent={ClusterServiceClassList} canCreate={false} kind="ClusterServiceClass" />;
ClusterServiceClassesPage.displayName = 'ClusterServiceClassesPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const ClusterServiceClassesDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind="ClusterServiceClass"
      // menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW'))]}
    />
  )
};

ClusterServiceClassesDetailsPage.displayName = 'ClusterServiceClassesDetailsPage';

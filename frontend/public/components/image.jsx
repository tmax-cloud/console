import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const ImageHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="spec.name">
        {t('CONTENT:IMAGE')}
      </ColHead>

      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const ImageRow = () =>
  // eslint-disable-next-line no-shadow
  function ImageRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="Image" resource={obj} />
          <ResourceLink kind="Image" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{obj.metadata.namespace}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{obj.spec.name}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

function Details({ obj }) {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <div className="col-sm-6">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Image', t) })} />
          <ResourceSummary resource={obj} />
        </div>
        <div className="col-sm-6">
          <dl className="co-m-pane__details">
            <dt>{t('CONTENT:IMAGE')}</dt>
            <dd>{obj.spec.name}</dd>
          </dl>
        </div>
      </div>
    </React.Fragment>
  );
}
// const DeploymentsList = props => <List {...props} Header={WorkloadListHeader} Row={Row} />;

export const ImageList = props => {
  const { kinds } = props;
  const Row = ImageRow(kinds[0]);
  Row.displayName = 'ImageRow';
  return <List {...props} Header={ImageHeader} Row={Row} />;
};
ImageList.displayName = ImageList;

export const ImagesPage = props => {
  // const { t } = useTranslation();
  return <ListPage {...props} ListComponent={ImageList} kind="Image" />;
};
ImagesPage.displayName = 'ImagesPage';

export const ImagesDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} kind="Image" menuActions={menuActions} pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

ImagesDetailsPage.displayName = 'ImagesDetailsPage';

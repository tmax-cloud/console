import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference, referenceForModel } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { PipelineResourceModel } from '../models';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const PipelineResourceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-4 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const PipelineResourceRow = () =>
  // eslint-disable-next-line no-shadow
  function PipelineResourceRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="PipelineResource" resource={obj} />
          <ResourceLink kind="PipelineResource" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-4 col-sm-4 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('PipelineResource', t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const PipelineResourceList = props => {
  const { kinds } = props;
  const Row = PipelineResourceRow(kinds[0]);
  Row.displayName = 'PipelineResourceRow';
  return <List {...props} Header={PipelineResourceHeader} Row={Row} />;
};
PipelineResourceList.displayName = PipelineResourceList;

const PipelineResourcesPage = props => {
  const { t } = useTranslation();

  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/pipelineresources/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  return <ListPage ListComponent={PipelineResourceList} canCreate={true} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} createProps={createProps} {...props} />;
};
PipelineResourcesPage.displayName = 'PipelineResourcesPage';
export { PipelineResourcesPage };
export const PipelineResourceDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'PipelineResource Details',
        path: props.match.url,
      })
    }
    menuActions={menuActions}
    pages={[navFactory.details(DetailsForKind(props.kind)), navFactory.editYaml()]}
  />
);

PipelineResourceDetailsPage.displayName = 'PipelineResourceDetailsPage';

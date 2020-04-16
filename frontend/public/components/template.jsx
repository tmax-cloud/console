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

const TemplateHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="objects.length">
        {t('CONTENT:OBJECTCOUNT')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const TemplateRow = () =>
  // eslint-disable-next-line no-shadow
  function TemplateRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="Template" resource={obj} />
          <ResourceLink kind="Template" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-3 col-sm-3 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-xs-3 col-sm-3 co-break-word">{(obj.objects && obj.objects.length) || 'None'}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural(kind, t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const TemplateList = props => {
  const { kinds } = props;
  const Row = TemplateRow(kinds[0]);
  Row.displayName = 'TemplateRow';
  return <List {...props} Header={TemplateHeader} Row={Row} />;
};
TemplateList.displayName = TemplateList;

export const TemplatesPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={TemplateList} canCreate={true} kind="Template" createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};
TemplatesPage.displayName = 'TemplatesPage';

export const TemplatesDetailsPage = props => (
  <DetailsPage
    {...props}
    // breadcrumbsFor={obj =>
    //   breadcrumbsForOwnerRefs(obj).concat({
    //     name: 'Templates Details',
    //     path: props.match.url,
    //   })
    // }
    kind="Template"
    menuActions={menuActions}
    pages={[navFactory.details(DetailsForKind(props.kind)), navFactory.editYaml()]}
  />
);

TemplatesDetailsPage.displayName = 'TemplatesDetailsPage';

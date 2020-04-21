import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { referenceFor, kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const TemplateInstanceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 hidden-xs">
        {t('CONTENT:PARAMETERCOUNT')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="templateInstancePhase">
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 hidden-md hidden-sm hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

// template-instance status 값
const templateInstancePhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Phase') {
        phase = cur.status;
      }
    });
    switch (phase) {
      case 'Running':
        return '실행 중';
        break;
      case 'Pending':
        return '대기 중';
        break;
      case 'Terminating':
        return '종료 중';
        break;
      case 'Completed':
        return '완료됨';
        break;
      default:
        return phase;
    }
  }
};

const TemplateInstanceRow = kind =>
  function TemplateInstanceRow({ obj }) {
    let phase = templateInstancePhase(obj);
    let paramCount = obj.spec.template.parameters ? obj.spec.template.parameters.length : 0;
    return (
      <div className="row co-resource-list__item">
        <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="TemplateInstance" resource={obj} />
          <ResourceLink kind="TemplateInstance" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-lg-3 col-md-4 col-sm-4 hidden-xs co-break-word">{paramCount}</div>
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs hidden-xs">{phase}</div>
        <div className="col-lg-3 hidden-md hidden-sm hidden-xs hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

export const TemplateInstanceList = props => {
  const { kinds } = props;
  const Row = TemplateInstanceRow(kinds[0]);
  Row.displayName = 'TemplateInstanceRow';
  return <List {...props} Header={TemplateInstanceHeader} Row={Row} />;
};
TemplateInstanceList.displayName = TemplateInstanceList;
const TemplateInstancesPage = props => {
  const { t } = useTranslation();
  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/templateinstances/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  return <ListPage ListComponent={TemplateInstanceList} canCreate={true} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} createProps={createProps} {...props} />;
};
export { TemplateInstancesPage };

const Details = ({ obj: templateinstance }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('TemplateInstance', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={templateinstance} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{templateInstancePhase(templateinstance)}</dd>
              {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

TemplateInstancesPage.displayName = 'TemplateInstancesPage';

export const TemplateInstancesDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      breadcrumbsFor={obj =>
        breadcrumbsForOwnerRefs(obj).concat({
          name: t(`RESOURCE:${obj.kind.toUpperCase()}`) + ' ' + t('CONTENT:DETAILS'),
          path: props.match.url,
        })
      }
      kind="TemplateInstance"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};

TemplateInstancesDetailsPage.displayName = 'TemplateInstancesDetailsPage';

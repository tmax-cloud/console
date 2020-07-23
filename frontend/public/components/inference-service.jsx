import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount } from './utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const InferenceServiceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-1 col-sm-1">
        {t('CONTENT:FRAMEWORK')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs">
        {t('CONTENT:STORAGEURI')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs">
        {t('CONTENT:URL')}
      </ColHead>
      <ColHead {...props} className="col-sm-1 hidden-xs">
        {t('CONTENT:CANARY')}
      </ColHead>
      <ColHead {...props} className="col-xs-1 col-sm-1">
        {t('CONTENT:STATUS')}
      </ColHead>
    </ListHeader>
  );
};

const InferenceServiceRow = () =>
  // eslint-disable-next-line no-shadow
  function InferenceServiceRow({ obj }) {
    let status = obj.status.conditions.length ? obj.status.conditions[obj.status.conditions.length - 1].type : '';
    const frameworkList = ['tensorflow', 'onnx', 'sklearn', 'xgboost', 'pytorch', 'tensorrt'];
    let framework = frameworkList.includes(Object.keys(obj.spec.default.predictor)[0]) ? Object.keys(obj.spec.default.predictor)[0] : Object.keys(obj.spec.default.predictor)[1];
    let storageUri = obj.spec.default.predictor[framework].storageUri;
    let canary = Object.keys(obj.status.canary).length === 0 ? 'N' : 'Y';
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="InferenceService" resource={obj} />
          <ResourceLink kind="InferenceService" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
        <div className="col-xs-1 col-sm-1 co-break-word">{framework}</div>
        <div className="col-xs-2 col-sm-2 co-break-word">{storageUri}</div>
        <div className="col-xs-3 col-sm-3 co-break-word">{obj.status.url}</div>
        <div className="col-xs-1 col-sm-1 co-break-word">{canary}</div>
        <div className="col-xs-1 col-sm-1 co-break-word">{status}</div>
      </div>
    );
  };

const Details = ({ obj: condition }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('UserSecurityPolicy', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={condition} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const InferenceServiceList = props => {
  const { kinds } = props;
  const Row = InferenceServiceRow(kinds[0]);
  Row.displayName = 'InferenceServiceRow';
  return <List {...props} Header={InferenceServiceHeader} Row={Row} />;
};
InferenceServiceList.displayName = InferenceServiceList;

export const InferenceServicePage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={InferenceServiceList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="InferenceService" />;
};
InferenceServicePage.displayName = 'InferenceServicePage';

export const InferenceServiceDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind="InferenceService"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};

InferenceServiceDetailsPage.displayName = 'InferenceServiceDetailsPage';

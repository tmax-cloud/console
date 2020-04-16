import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { ConfigMapData } from './configmap-and-secret-data';
import { Cog, SectionHeading, navFactory, ResourceCog, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = Cog.factory.common;

const ConfigMapHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortFunc="dataSize">
        {t('CONTENT:SIZE')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const ConfigMapRow = ({ obj: configMap }) => (
  <ResourceRow obj={configMap}>
    <div className="col-sm-4 col-xs-6 co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind="ConfigMap" resource={configMap} />
      <ResourceLink kind="ConfigMap" name={configMap.metadata.name} namespace={configMap.metadata.namespace} title={configMap.metadata.uid} />
    </div>
    <div className="col-sm-4 col-xs-6 co-break-word">
      <ResourceLink kind="Namespace" name={configMap.metadata.namespace} title={configMap.metadata.namespace} />
    </div>
    <div className="col-sm-2 hidden-xs">{_.size(configMap.data)}</div>
    <div className="col-sm-2 hidden-xs">{fromNow(configMap.metadata.creationTimestamp)}</div>
  </ResourceRow>
);

const ConfigMapDetails = ({ obj: configMap }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('ConfigMap', t) })} />
        <ResourceSummary resource={configMap} showPodSelector={false} showNodeSelector={false} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:DATA')} />
        <ConfigMapData data={configMap.data} />
      </div>
    </React.Fragment>
  );
};

const ConfigMaps = props => <List {...props} Header={ConfigMapHeader} Row={ConfigMapRow} />;
const ConfigMapsPage = props => {
  const { t } = useTranslation();
  return <ListPage ListComponent={ConfigMaps} canCreate={true} {...props} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};
const ConfigMapsDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(ConfigMapDetails, t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

export { ConfigMaps, ConfigMapsPage, ConfigMapsDetailsPage };

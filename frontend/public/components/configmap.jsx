import * as _ from 'lodash-es';
import * as React from 'react';
import { DetailsPage, ListPage } from './factory';
import { ConfigMapData, ConfigMapBinaryData } from './configmap-and-secret-data';
import { Kebab, SectionHeading, navFactory, ResourceKebab, ResourceLink, ResourceSummary, Timestamp } from './utils';
import { ConfigMapModel } from '../models';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

const menuActions = [...Kebab.getExtensionsActionsForKind(ConfigMapModel), ...Kebab.factory.common];

const kind = ConfigMapModel.kind;

const tableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_18',
      sortFunc: 'dataSize',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: obj => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: _.size(obj.data) + _.size(obj.binaryData),
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const ConfigMapDetails = ({ obj: configMap }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(configMap, t) })} />
        <ResourceSummary resource={configMap} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DATA_1')} />
        <ConfigMapData data={configMap.data} label={t('COMMON:MSG_DETAILS_TABDETAILS_DATA_1')} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('SINGLE:MSG_CONFIGMAPS_CONFIGMAPDETAILS_TABDETAILS_BINARYDATA_1')} />
        <ConfigMapBinaryData data={configMap.binaryData} />
      </div>
    </>
  );
};

const ConfigMapsPage = props => {
  const { t } = useTranslation();
  return <ListPage tableProps={tableProps} canCreate={true} {...props} />;
};
const ConfigMapsDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(ConfigMapDetails), navFactory.editResource()]} />;

export { ConfigMapsPage, ConfigMapsDetailsPage };

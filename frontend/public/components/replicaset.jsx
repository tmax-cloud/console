// TODO file should be renamed replica-set.jsx to match convention

import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from './factory';
import { Kebab, ContainerTable, navFactory, SectionHeading, ResourceSummary, ResourcePodCount, AsyncComponent, ResourceLink, resourcePath, LabelList, ResourceKebab, OwnerReferences, Timestamp, PodsComponent } from './utils';
import { ResourceEventStream } from './events';
import { VolumesTable } from './volumes-table';
import { ReplicaSetModel } from '../models';
import { ResourceLabel } from '../models/hypercloud/resource-plural';
import { PodStatus } from './hypercloud/utils/pod-status';

const { ModifyCount, AddStorage, common } = Kebab.factory;

export const replicaSetMenuActions = [ModifyCount, AddStorage, ...Kebab.getExtensionsActionsForKind(ReplicaSetModel), ...common];

const Details = ({ obj: replicaSet }) => {
  const { t } = useTranslation();
  const revision = _.get(replicaSet, ['metadata', 'annotations', 'deployment.kubernetes.io/revision']);
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(replicaSet, t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={replicaSet} showPodSelector showNodeSelector showTolerations showOwner={false}>
              {revision && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_41')}</dt>
                  <dd>{revision}</dd>
                </>
              )}
            </ResourceSummary>
          </div>
          <div className="col-md-6">
            <ResourcePodCount resource={replicaSet} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
        <ContainerTable containers={replicaSet.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={replicaSet} heading={t('COMMON:MSG_DETAILS_TABDETAILS_VOLUMES_TABLEHEADER_1')} />
      </div>
    </>
  );
};

const EnvironmentPage = props => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = props => <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec} envPath={envPath} readOnly={false} />;

const ReplicaSetPods = props => <PodsComponent {...props} customData={{ showNodes: true }} />;

const { details, editResource, pods, envEditor, events } = navFactory;
const ReplicaSetsDetailsPage = props => <DetailsPage {...props} menuActions={replicaSetMenuActions} pages={[details(Details), editResource(), pods(ReplicaSetPods), envEditor(environmentComponent), events(ResourceEventStream)]} />;

const kind = ReplicaSetModel.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortFunc: 'numReplicas',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
      sortField: 'metadata.labels',
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
      children: <PodStatus resource={obj} kind={kind} desired={obj.spec.replicas} ready={obj.status.replicas} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={replicaSetMenuActions} kind={kind} resource={obj} />,
    },
  ],
};

const ReplicaSetsPage = props => {
  return <ListPage canCreate={true} kind={kind} tableProps={tableProps} {...props} />;
};

export { ReplicaSetsPage, ReplicaSetsDetailsPage };

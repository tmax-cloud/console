import * as React from 'react';

import PodRingSet from '@console/shared/src/components/pod/PodRingSet';
import { PodRingController } from '@console/shared';
import { AddHealthChecks, EditHealthChecks } from '@console/app/src/actions/modify-health-checks';
import { K8sResourceKind } from '../module/k8s';
import { ResourceEventStream } from './events';
import { DetailsPage, ListPage } from './factory';
import { useTranslation } from 'react-i18next';
import { AsyncComponent, Kebab, KebabAction, ContainerTable, ResourceSummary, SectionHeading, navFactory, LoadingInline, PodsComponent, ResourceLink, ResourceKebab, LabelList, Selector } from './utils';
import { VolumesTable } from './volumes-table';
import { StatefulSetModel } from '../models';
import { ResourceLabel } from '../models/hypercloud/resource-plural';
import Memo, { memoColumnClass } from './hypercloud/utils/memo';
import { PodStatus } from './hypercloud/utils/pod-status';

const { AddStorage, common, ModifyCount } = Kebab.factory;
export const menuActions: KebabAction[] = [AddHealthChecks, ModifyCount, AddStorage, ...Kebab.getExtensionsActionsForKind(StatefulSetModel), EditHealthChecks, ...common];

const kind = StatefulSetModel.kind;

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_16',
      sortField: 'spec.selector',
    },
    {
      title: '메모',
      transforms: null,
      props: { className: memoColumnClass },
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
      children: <Selector selector={obj.spec.selector} namespace={obj.metadata.namespace} />,
    },
    {
      className: memoColumnClass,
      children: <Memo model={StatefulSetModel} resource={obj} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const StatefulSetDetails: React.FC<StatefulSetDetailsProps> = ({ obj: ss }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(ss, t) })} />
        <PodRingController
          namespace={ss.metadata.namespace}
          kind={ss.kind}
          render={d => {
            return d.loaded ? <PodRingSet key={ss.metadata.uid} podData={d.data[ss.metadata.uid]} obj={ss} resourceKind={StatefulSetModel} path="/spec/replicas" /> : <LoadingInline />;
          }}
        />
        <ResourceSummary resource={ss} showPodSelector showNodeSelector showTolerations />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
        <ContainerTable containers={ss.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={ss} heading={t('COMMON:MSG_DETAILS_TABDETAILS_VOLUMES_TABLEHEADER_1')} />
      </div>
    </>
  );
};

const EnvironmentPage: React.FC<EnvironmentPageProps> = props => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec', 'template', 'spec', 'containers'];
const EnvironmentTab: React.FC<EnvironmentTabProps> = props => <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec} envPath={envPath} readOnly={false} />;

export const StatefulSetsPage: React.FC = props => {
  return <ListPage {...props} tableProps={tableProps} kind={kind} canCreate={true} />;
};

const StatefulSetPods: React.FC<StatefulSetPodsProps> = props => <PodsComponent {...props} customData={{ showNodes: true }} />;

const pages = [navFactory.details(StatefulSetDetails), navFactory.editResource(), navFactory.pods(StatefulSetPods), navFactory.envEditor(EnvironmentTab), navFactory.events(ResourceEventStream)];

export const StatefulSetsDetailsPage: React.FC<StatefulSetsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={pages} />;

type EnvironmentPageProps = {
  obj: K8sResourceKind;
  rawEnvData: any;
  envPath: string[];
  readOnly: boolean;
};

type EnvironmentTabProps = {
  obj: K8sResourceKind;
};

type StatefulSetDetailsProps = {
  obj: K8sResourceKind;
};

type StatefulSetPodsProps = {
  obj: K8sResourceKind;
};

type StatefulSetsDetailsPageProps = {
  match: any;
};

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AddHealthChecks, EditHealthChecks } from '@console/app/src/actions/modify-health-checks';
import { K8sResourceKind } from '../module/k8s';
import { DetailsPage, ListPage } from './factory';
import { AsyncComponent, DetailsItem, Kebab, KebabAction, ContainerTable, detailsPage, LabelList, navFactory, PodsComponent, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Selector, LoadingInline } from './utils';
import { ResourceEventStream } from './events';
import { VolumesTable } from './volumes-table';
import { DaemonSetModel } from '../models';
import { PodRingController, PodRing } from '@console/shared';
import { ResourceLabel } from '../models/hypercloud/resource-plural';
import { PodStatus } from './hypercloud/utils/pod-status';
import { TableProps } from './hypercloud/utils/default-list-component';

export const menuActions: KebabAction[] = [AddHealthChecks, Kebab.factory.AddStorage, ...Kebab.getExtensionsActionsForKind(DaemonSetModel), EditHealthChecks, ...Kebab.factory.common];

const kind = DaemonSetModel.kind;

const tableProps: TableProps = {
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
      sortFunc: 'daemonsetNumScheduled',
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
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: <PodStatus resource={obj} kind={kind} desired={obj.status.desiredNumberScheduled} ready={obj.status.currentNumberScheduled} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    { children: <Selector selector={obj.spec.selector} namespace={obj.metadata.namespace} /> },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const DaemonSetDetailsList: React.FC<DaemonSetDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_38')} obj={ds} path="status.currentNumberScheduled" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_39')} obj={ds} path="status.desiredNumberScheduled" />
    </dl>
  );
};

const DaemonSetDetails: React.FC<DaemonSetDetailsProps> = ({ obj: daemonset }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(daemonset, t) })} />
        <PodRingController
          namespace={daemonset.metadata.namespace}
          kind={daemonset.kind}
          render={d => {
            return d.loaded ? <PodRing key={daemonset.metadata.uid} pods={d.data[daemonset.metadata.uid].pods} obj={daemonset} resourceKind={DaemonSetModel} enableScaling={false} /> : <LoadingInline />;
          }}
        />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={daemonset} showPodSelector showNodeSelector showTolerations />
          </div>
          <div className="col-lg-6">
            <DaemonSetDetailsList ds={daemonset} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
        <ContainerTable containers={daemonset.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={daemonset} heading={t('COMMON:MSG_DETAILS_TABDETAILS_VOLUMES_TABLEHEADER_1')} />
      </div>
    </>
  );
};

const EnvironmentPage: React.FC<EnvironmentPageProps> = props => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec', 'template', 'spec', 'containers'];
const EnvironmentTab: React.FC<EnvironmentTabProps> = props => <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec} envPath={envPath} readOnly={false} />;
const { details, pods, editResource, envEditor, events } = navFactory;

export const DaemonSetsPage: React.FC = props => {
  return <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;
};

const DaemonSetPods: React.FC<DaemonSetPodsProps> = props => <PodsComponent {...props} customData={{ showNodes: true }} />;

export const DaemonSetsDetailsPage: React.FC<DaemonSetsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(DaemonSetDetails)), editResource(), pods(DaemonSetPods), envEditor(EnvironmentTab), events(ResourceEventStream)]} />;

type DaemonSetDetailsListProps = {
  ds: K8sResourceKind;
};

type EnvironmentPageProps = {
  obj: K8sResourceKind;
  rawEnvData: any;
  envPath: string[];
  readOnly: boolean;
};

type EnvironmentTabProps = {
  obj: K8sResourceKind;
};

type DaemonSetDetailsProps = {
  obj: K8sResourceKind;
};

type DaemonSetPodsProps = {
  obj: K8sResourceKind;
};

type DaemonSetsDetailsPageProps = {
  match: any;
};

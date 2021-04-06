import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, LoadingBox, Firehose } from '../utils';
import { WorkflowVisualization } from '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/WorkflowVisualization';
import { WorkflowModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { fromNow } from '../utils/datetime';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(WorkflowModel), ...Kebab.factory.common];

const kind = WorkflowModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const WorkflowTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:STATUS'),
      sortField: 'status.status',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:STARTTIME'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:ENDTIME'),
      sortField: 'status.finishedAt',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};
WorkflowTableHeader.displayName = 'WorkflowTableHeader';

const WorkflowTableRow: RowFunction<K8sResourceKind> = ({ obj: wf, index, key, style }) => {
  return (
    <TableRow id={wf.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={wf.metadata.name} namespace={wf.metadata.namespace} title={wf.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={wf.metadata.namespace} title={wf.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {wf.status.phase}
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        {wf.metadata.creationTimestamp ? fromNow(wf.metadata.creationTimestamp) : ''}
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        {wf.status.finishedAt ? fromNow(wf.status.finishedAt) : ''}
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={wf} />
      </TableData>
    </TableRow>
  );
};

export const WorkflowTemplateRef = (props) => {
  const { workflow, workflowTemplateRef } = props;
  workflowTemplateRef.data.status = workflow.status; // 상태값은 workflow에서 가져옴
  if (!workflowTemplateRef.loaded) {
    return <LoadingBox className="loading-box loading-box__loading" />;
  }
  return (
    <div className="co-m-pane__body">
      <WorkflowVisualization workflow={workflowTemplateRef.data} />
    </div>
  );
};

const WorkflowGraph = ({ obj }) => {
  if (obj.spec.workflowTemplateRef) {
    // workflowTempalteRef 가 있는 경우 workflowTemplate을 조회하여 graph 표현
    // 상태값은 workflow 객체에서 가져옴
    const resources = [
      {
        kind: 'WorkflowTemplate',
        name: obj.spec.workflowTemplateRef.name,
        namespace: obj.metadata.namespace,
        prop: 'workflowTemplateRef',
      },
    ];
    return (
      <Firehose resources={resources}>
        <WorkflowTemplateRef workflow={obj} />
      </Firehose>
    );
  }
  return (
    <div className="co-m-pane__body">
      <WorkflowVisualization workflow={obj} />
    </div>
  );
};
const WorkflowDetails: React.FC<WorkflowDetailsProps> = ({ obj: wf }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(wf, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={wf} />
          </div>
        </div>
      </div>
    </>
  );
}

const { details, editYaml } = navFactory;
export const Workflows: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Workflows" Header={WorkflowTableHeader.bind(null, t)} Row={WorkflowTableRow} virtualize />;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = props => <ListPage canCreate={true} ListComponent={Workflows} kind={kind} {...props} />;

export const WorkflowsDetailsPage: React.FC<WorkflowsDetailsPageProps> = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      pages={[
        details(detailsPage(WorkflowDetails)),
        {
          href: 'workflow',
          name: t('RESOURCE:WORKFLOW'),
          component: WorkflowGraph,
        },
        editYaml()
      ]}
    />
  );
}

type WorkflowDetailsProps = {
  obj: K8sResourceKind;
};

type WorkflowsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type WorkflowsDetailsPageProps = {
  match: any;
};

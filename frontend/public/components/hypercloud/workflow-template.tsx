import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { WorkflowTemplateVisualization } from '../../../packages/dev-console/src/components/pipelines/detail-page-tabs/pipeline-details/WorkflowTemplateVisualization';
import { WorkflowTemplateModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { fromNow } from '../utils/datetime';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(WorkflowTemplateModel), ...Kebab.factory.common];

const kind = WorkflowTemplateModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), Kebab.columnClass];

const WorkflowTemplateTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};
WorkflowTemplateTableHeader.displayName = 'WorkflowTemplateTableHeader';

const WorkflowTemplateTableRow: RowFunction<K8sResourceKind> = ({ obj: wft, index, key, style }) => {
  return (
    <TableRow id={wft.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={wft.metadata.name} namespace={wft.metadata.namespace} title={wft.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={wft.metadata.namespace} title={wft.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {fromNow(wft.metadata.creationTimestamp)}
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={wft} />
      </TableData>
    </TableRow>
  );
};

const WorkflowTemplateGraph = ({ obj }) => {
  return (
    <div className="co-m-pane__body">
      <WorkflowTemplateVisualization workflowTemplate={obj} />
    </div>
  );
};

const WorkflowTemplateDetails: React.FC<WorkflowTemplateDetailsProps> = ({ obj: wft }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(wft, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={wft} />
          </div>
        </div>
      </div>
    </>
  );
}

const { details, editYaml } = navFactory;
export const WorkflowTemplates: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="WorkflowTemplates" Header={WorkflowTemplateTableHeader.bind(null, t)} Row={WorkflowTemplateTableRow} virtualize />;
}

export const WorkflowTemplatesPage: React.FC<WorkflowTemplatesPageProps> = props => <ListPage canCreate={true} ListComponent={WorkflowTemplates} kind={kind} {...props} />;

export const WorkflowTemplatesDetailsPage: React.FC<WorkflowTemplatesDetailsPageProps> = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      pages={[
        details(detailsPage(WorkflowTemplateDetails)),
        {
          href: 'template',
          name: t('RESOURCE:TEMPLATE'),
          component: WorkflowTemplateGraph,
        },
        editYaml()
      ]}
    />
  );
}

type WorkflowTemplateDetailsProps = {
  obj: K8sResourceKind;
};

type WorkflowTemplatesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type WorkflowTemplatesDetailsPageProps = {
  match: any;
};

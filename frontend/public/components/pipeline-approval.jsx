import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, MultiListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference, referenceForModel } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { PipelineApprovalModel } from '../models';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Approval];

const PipelineApprovalHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-sm-3 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 col-xs-6" sortField="status.result">
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const PipelineApprovalRow = () =>
  // eslint-disable-next-line no-shadow
  function PipelineApprovalRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-sm-3 col-xs-6 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="Approval" resource={obj} />
          <ResourceLink kind="Approval" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-sm-3 col-xs-6 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-sm-3 col-xs-6 co-break-word">{obj.hasOwnProperty('status') ? obj.status.result : 'Waiting'}</div>
        <div className="col-sm-3 col-xs-6 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Approval', t) })} />
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
            </div>
            <div className="col-sm-6">
              <dl className="co-m-pane__details">
                <dt>{t('CONTENT:STATUS')}</dt>
                <dd>{obj.status.result}</dd>
                <dt>{t('RESOURCE:USER')}</dt>
                <dd>{obj.spec.users.join(' ')}</dd>
              </dl>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

export const PipelineApprovalList = props => {
  const { kinds } = props;
  const Row = PipelineApprovalRow(kinds[0]);
  Row.displayName = 'PipelineApprovalRow';
  return <List {...props} Header={PipelineApprovalHeader} Row={Row} />;
};
PipelineApprovalList.displayName = PipelineApprovalList;

export const approvalType = approval => {
  switch (approval.status.result) {
    case 'Approved':
      return 'Approved';
    case 'Canceled':
      return 'Canceled';
    case 'Rejected':
      return 'Rejected';
    default:
      return 'Waiting';
  }
};

export const PipelineApprovalsPage = props => {
  const { t } = useTranslation();
  return (
    <ListPage
      {...props}
      ListComponent={PipelineApprovalList}
      canCreate={false}
      kind="Approval"
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })}
      // rowFilters={filters}
      rowFilters={[
        {
          type: 'approval-status',
          selected: ['Waiting', 'Approved', 'Rejected', 'Canceled'],
          reducer: approvalType,
          items: [
            { id: 'Waiting', title: 'Waiting' },
            { id: 'Approved', title: 'Approved' },
            { id: 'Rejected', title: 'Rejected' },
            { id: 'Canceled', title: 'Canceled' },
          ],
        },
      ]}
      title={t('RESOURCE:APPROVAL')}
    />
  );
};
PipelineApprovalsPage.displayName = 'PipelineApprovalsPage';

export const PipelineApprovalDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      // breadcrumbsFor={obj =>
      //   breadcrumbsForOwnerRefs(obj).concat({
      //     name: 'PipelineApproval Details',
      //     path: props.match.url,
      //   })
      // }
      menuActions={menuActions}
      pages={[navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};

PipelineApprovalDetailsPage.displayName = 'PipelineApprovalDetailsPage';

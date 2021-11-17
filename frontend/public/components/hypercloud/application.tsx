import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { ApplicationModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';

const kind = ApplicationModel.kind;

const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ApplicationModel), ...Kebab.factory.common];

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
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
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const SourceSummary: React.FC<SourceSummaryProps> = ({ obj }) => {
  const { t } = useTranslation();
  const { repoURL, path, targetRevision } = obj.spec?.source;
  return (
    <>
      <div>
        <span>{t('SINGLE:MSG_APPLICATIONS_APPLICATIONDETAILS_2')} : </span>
        <a href={repoURL} target="_blank">
          {repoURL}
        </a>
      </div>
      <div>
        <span>{t('SINGLE:MSG_APPLICATIONS_APPLICATIONDETAILS_3')} : </span>
        <span>{targetRevision}</span>
      </div>
      <div>
        <span>{t('SINGLE:MSG_APPLICATIONS_APPLICATIONDETAILS_4')} : </span>
        <span>{path}</span>
      </div>
    </>
  );
};

// TODO : 리소스 부분 서버구현 완료돼면 리소스테이블 추가하기
// const ResourceTable: React.FC<ResourceTableProps> = props => {
//   const { t } = useTranslation();
//   const resources = [];
//   const rows = [];
//   return (
//     <>
//       {resources?.length ? (
//         <div className="co-m-table-grid co-m-table-grid--bordered">
//           <div className="row co-m-table-grid__head">
//             <div className="col-xs-6 col-sm-4 col-md-4">{t('COMMON:MSG_DETAILS_TABDETAILS_RESOURCES_TABLEHEADER_1')}</div>
//             <div className="col-xs-6 col-sm-4 col-md-4">{t('COMMON:MSG_DETAILS_TABDETAILS_RESOURCES_TABLEHEADER_2')}</div>
//             <div className="col-xs-6 col-sm-4 col-md-4">{t('COMMON:MSG_DETAILS_TABDETAILS_RESOURCES_TABLEHEADER_3')}</div>
//           </div>
//           <div className="co-m-table-grid__body">{rows}</div>
//         </div>
//       ) : (
//         <div className="cos-status-box">
//           <div className="text-center">{t('COMMON:MSG_COMMON_ERROR_MESSAGE_22', { something: t('COMMON:MSG_DETAILS_TABDETAILS_RESOURCES_1') })}</div>
//         </div>
//       )}
//     </>
//   );
// };

export const ApplicationDetailsList: React.FC<ApplicationDetailsListProps> = ({ obj: app }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('SINGLE:MSG_APPLICATIONS_APPLICATIONDETAILS_1')} obj={app}>
        <SourceSummary obj={app} />
      </DetailsItem>
      <DetailsItem label={t('SINGLE:MSG_APPLICATIONS_APPLICATIONDETAILS_5')} obj={app}>
        {app.spec?.destination?.name}
      </DetailsItem>
    </dl>
  );
};

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ obj: app }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(app, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={app} />
          </div>
          <div className="col-sm-6">
            <ApplicationDetailsList obj={app} />
          </div>
        </div>
      </div>
      {/* <div className="co-m-pane__body">
        <SectionHeading text={`${t('COMMON:MSG_DETAILS_TABDETAILS_RESOURCES_1')}`} />
        <ResourceTable obj={app} />
      </div> */}
    </>
  );
};

const { details, editResource } = navFactory;

export const ApplicationsPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const ApplicationsDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(ApplicationDetails)), editResource()]} />;
};

// type ResourceTableProps = {
//   obj: K8sResourceKind;
// };

type SourceSummaryProps = {
  obj: K8sResourceKind;
};

type ApplicationDetailsListProps = {
  obj: K8sResourceKind;
};

type ApplicationDetailsProps = {
  obj: K8sResourceKind;
};

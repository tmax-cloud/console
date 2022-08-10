import * as React from 'react';
import * as classNames from 'classnames';
import { ServiceBindingModel } from '../../models';
import { DetailsItem, detailsPage, Kebab, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { TableProps } from './utils/default-list-component';
import { K8sResourceKind } from 'public/module/k8s';
import { Status } from '@console/shared';
import { DetailsPage, DetailsPageProps, ListPage } from '../factory';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ServiceBindingStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { ServiceBindingConditions } from './service-binding_conditions';
import { TFunction } from 'i18next';


const kind = ServiceBindingModel.kind;

const filters = (t: TFunction) => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'servicebinding-status',
    reducer: ServiceBindingStatusReducer,
    items: [
      { id: 'Succeeded', title: 'Succeeded' },
      { id: 'Failed', title: 'Failed' },
      { id: 'Unknown', title: 'Unknown' },
    ],
  },
];

export const serviceBindingMenuActions = [...Kebab.getExtensionsActionsForKind(ServiceBindingModel), ...Kebab.factory.common];

// table
const tableProps: TableProps = {
  header: [
    // 이름
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    // 네임스페이스
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    // 상태
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_3',
      sortFunc: 'ServiceBindingStatusReducer',
    },
    // 애플리케이션
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_143',
      sortField: 'spec.application.name',
    },
    // 배후 서비스
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_144',
      sortField: 'spec.services[0].name',
    },
    // 생성 시간
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    // action menu
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => [
    // 이름
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    // 네임스페이스
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    // 상태
    {
      className: classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'co-break-word'),
      children: <Status status={ServiceBindingStatusReducer(obj)} />,
    },
    // 애플리케이션
    {
      children: obj.spec.application.name
    },
    // 배후 서비스
    {
      children: obj.spec.services[0].name
    },
    // 생성 시간
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    // menu actions
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={serviceBindingMenuActions} kind={kind} resource={obj} />,
    },
  ]
}

export const ServiceBindingsPage: React.FC = props => {
  const { t } = useTranslation();
  return <ListPage {...props} canCreate={true} kind={kind} rowFilters={filters.bind(null, t)()} tableProps={tableProps} />;
};

// 디테일 페이지
export const ServiceBindingDetailsList: React.FC<ServiceBindingDetailsListProps> = ({ obj: sb }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      {/* 상태 */}
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_3')} obj={sb}>
        <Status status={ServiceBindingStatusReducer(sb)} />
      </DetailsItem>
      {/* 애플리케이션 */}
      <DetailsItem label={t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_1')} obj={sb}>
        {sb.spec.application.name}
      </DetailsItem>
      {/* 배후 서비스 */}
      <DetailsItem label={t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_2')} obj={sb}>
        {sb.spec.services[0].name}
      </DetailsItem>
      {/* 바인딩 리소스 */}
      <DetailsItem label={t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_3')} obj={sb}>
        {/* 데이터 찾기 */}
        <div>
          {
            `${t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_4')} : ${sb.spec.detectBindingResources ?
              t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_5')
              :
              t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_6')}`
          }
        </div>
        {/* 네이밍 방식 */}
        <div>
          {`${t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_7')} : \'${sb.spec.namingStrategy}\'`}
        </div>
        {/* 데이터 저장 타입 */}
        <div>
          {
            `${t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_8')} : ${sb.spec.bindAsFiles ?
              t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_9')
              :
              t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_10')}`
          }
        </div>
        {/* 사용자 입력 데이터 */}
        <div>
          <table>
            <tr>
              <td style={{'verticalAlign': 'top'}}>
                {`${t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_11')} :`}&nbsp;
              </td>
              <td>
                {sb.spec.mappings?.map(({name, value}) => {
                  return <div>{name}-{value}</div>
                })}
              </td>
            </tr>
          </table>
        </div>
      </DetailsItem>
    </dl>
  );
};

const ServiceBindingDetails: React.FC<ServiceBindingDetailsProps> = ({ obj: sb }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(sb, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={sb} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <ServiceBindingDetailsList obj={sb} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('SINGLE:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_CONDITIONS_1')} />
        <ServiceBindingConditions conditions={sb.status.conditions} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const ServiceBindingsDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} getResourceStatus={ServiceBindingStatusReducer} kind={kind} menuActions={serviceBindingMenuActions} pages={[details(detailsPage(ServiceBindingDetails)), editResource()]} />;
};


type ServiceBindingDetailsListProps = {
  obj: K8sResourceKind;
};

type ServiceBindingDetailsProps = {
  obj: K8sResourceKind;
};

import * as React from 'react';
// import * as classNames from 'classnames';
import { ServiceBindingModel } from '../../models';
import { DetailsItem, Kebab, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { TableProps } from './utils/default-list-component';
import { K8sResourceKind } from 'public/module/k8s';
// import { Status } from '@console/shared';
import { ListPage } from '../factory';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from 'public/models/hypercloud/resource-plural';


const kind = ServiceBindingModel.kind;

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
      sortField: '',
    },
    // 애플리케이션
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_143',
      sortField: '',
    },
    // 배후 서비스
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_144',
      sortField: '',
    },
    // 생성 시간
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    }
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
    // {
    //   className: classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'co-break-word'),
    //   children: <Status status={AwxStatusReducer(obj)} />,
    // },
    // 애플리케이션
    // 배후 서비스
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
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

// 디테일 페이지
export const AWXDetailsList: React.FC<ServiceBindingDetailsListProps> = ({ obj: sb }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      {/* 상태 */}
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_3')} obj={sb}>
        {/* <Status status={AwxStatusReducer(awx)} /> */}
      </DetailsItem>
      {/* 애플리케이션 */}
      <DetailsItem label={t('COMMON:MSG_SERVICEBINDINGS_SERVICEBINDINGDETAILS_TABDETAILS_1')} obj={sb}>
        {/* <Status status={AwxStatusReducer(awx)} /> */}
      </DetailsItem>

      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_2')} obj={awx} path="spec.tower_hostname">
        {awx.spec?.tower_hostname ? (
          <a href={`https://${awx.spec?.tower_hostname}`} target="_blank">
            {awx.spec.tower_hostname}
          </a>
        ) : (
          <div>-</div>
        )}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_3')} obj={awx}>
        <ImageSummary obj={awx} />
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
            <AWXDetailsList obj={awx} />
          </div>
        </div>
      </div>
    </>
  );
};


type ServiceBindingDetailsListProps = {
  obj: K8sResourceKind;
};

type ServiceBindingDetailsProps = {
  obj: K8sResourceKind;
};

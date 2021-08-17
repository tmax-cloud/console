import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { useState } from 'react';
import { Button } from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';
import { Status } from '@console/shared';
import { ServiceInstanceModel, ServiceClassModel, ClusterServiceClassModel, ServicePlanModel, ClusterServicePlanModel } from '../../models';
import { K8sResourceKind, modelFor, k8sGet } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { Kebab, ResourceKebab, navFactory, viewYamlComponent, SectionHeading, ResourceSummary, ResourceLink, Timestamp, resourcePath } from '../utils';
import { ResourceSidebar } from '../sidebars/resource-sidebar';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ResourceIcon } from '../utils/resource-icon';
import { Link } from 'react-router-dom';

const { ModifyLabels, ModifyAnnotations, Delete } = Kebab.factory;

const kind = ServiceInstanceModel.kind;

export const serviceInstanceMenuActions = [...Kebab.getExtensionsActionsForKind(ServiceInstanceModel), ModifyLabels, ModifyAnnotations, Delete];

const ServiceInstanceDetails: React.FC<ServiceInstanceDetailsProps> = props => {
  const { t } = useTranslation();
  const { obj: serviceInstance, match } = props;
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarDetails, setSidebarDetails] = useState({});
  const [sidebarKind, setSidebarKind] = useState('');
  const [sidebarTitle, setSidebarTitle] = useState('');
  // const [planDetails, setPlanDetails] = useState({});
  const getDetails = async (kind, name) => {
    const model = modelFor(kind);
    const details = await k8sGet(model, name, kind.indexOf('Cluster') < 0 ? match.params.ns : null);
    setSidebarDetails(details);
    setShowSidebar(true);
    setSidebarKind(kind);
    setSidebarTitle(details.spec?.externalName || details.metadata.name);
    console.log(sidebarDetails);
  };

  const SidebarLink = ({ name, displayName, kind }) => {
    return (
      <>
        <ResourceIcon kind={kind} />
        <Button type="button" variant="link" isInline onClick={getDetails.bind(null, kind, name)}>
          {displayName}
        </Button>
      </>
    );
  };
  const clusterServiceClassRefName = serviceInstance.spec?.clusterServiceClassExternalName || serviceInstance.spec?.clusterServiceClassRef?.name;
  const clusterServicePlanRefName = serviceInstance.spec?.clusterServicePlanExternalName || serviceInstance.spec?.clusterServicePlanRef?.name;

  const serviceClassRefName = serviceInstance.spec?.serviceClassExternalName || serviceInstance.spec?.serviceClassRef?.name;
  const servicePlanRefName = serviceInstance.spec?.servicePlanExternalName || serviceInstance.spec?.servicePlanRef?.name;

  if (window.location.href.indexOf('?serviceplanSidebar=open') > 0) {
    getDetails(!!clusterServicePlanRefName ? ClusterServicePlanModel.kind : ServicePlanModel.kind, !!clusterServicePlanRefName ? serviceInstance.spec?.clusterServicePlanRef?.name : serviceInstance.spec?.servicePlanRef?.name);
    window.history.replaceState(null, null, window.location.pathname);
  }

  return (
    <>
      <div className="co-p-has-sidebar">
        <div className="co-m-pane__body">
          <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(serviceInstance, t) })} />
          <div className="row">
            <div className="col-md-6">
              <ResourceSummary resource={serviceInstance}></ResourceSummary>
            </div>
            <div className="col-md-6">
              <dl className="co-m-pane__details">
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_13')}</dt>
                <dd>
                  <Status status={serviceInstance.status?.lastConditionState} />
                </dd>
                <dt>{!!clusterServiceClassRefName ? t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP1_DIV2_2') : t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_19')}</dt>
                <dd>{!!clusterServiceClassRefName ? <ResourceLink kind={ClusterServiceClassModel.kind} displayName={clusterServiceClassRefName} name={serviceInstance.spec?.clusterServiceClassRef?.name} title={clusterServiceClassRefName} /> : <ResourceLink kind={ServiceClassModel.kind} displayName={serviceClassRefName} name={serviceInstance.spec?.serviceClassRef?.name} title={serviceClassRefName} namespace={serviceInstance.metadata.namespace} />}</dd>
                <dt>{!!clusterServicePlanRefName ? t('COMMON:MSG_DETAILS_TABSERVICEPLANS_DETAILS_SIDEPANEL_13') : t('COMMON:MSG_DETAILS_TABSERVICEPLANS_1')}</dt>
                <dd>
                  <SidebarLink displayName={!!clusterServicePlanRefName ? clusterServicePlanRefName : servicePlanRefName} name={!!clusterServicePlanRefName ? serviceInstance.spec?.clusterServicePlanRef?.name : serviceInstance.spec?.servicePlanRef?.name} kind={!!clusterServicePlanRefName ? ClusterServicePlanModel.kind : ServicePlanModel.kind}></SidebarLink>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <ResourceSidebar
          toggleSidebar={() => {
            setShowSidebar(!showSidebar);
            window.dispatchEvent(new Event('sidebar_toggle'));
          }}
          resource={sidebarDetails}
          kindObj={modelFor(sidebarKind)}
          title={sidebarTitle}
          isFloat={true}
          showName={true}
          showID={false}
          showDescription={true}
          showAnnotations={false}
          showPodSelector={false}
          showNodeSelector={false}
          showOwner={false}
          showSidebar={showSidebar}
          samples={[]}
          isCreateMode={true}
          showDetails={true}
          noTabsOnlyDetails={true}
        />
      </div>
    </>
  );
};

type ServiceInstanceDetailsProps = {
  obj: K8sResourceKind;
  match?: any;
};

const { details, editYaml } = navFactory;
const ServiceInstancesDetailsPage: React.FC<ServiceInstancesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={serviceInstanceMenuActions} getResourceStatus={serviceInstanceStatusReducer} pages={[details(ServiceInstanceDetails), editYaml(viewYamlComponent)]} />;
ServiceInstancesDetailsPage.displayName = 'ServiceInstancesDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', // NAMESPACE
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // STATUS
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // SERVICE CLASS
  classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), // SERVICE PLAN
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'), // CREATED
  Kebab.columnClass, // MENU ACTIONS
];

// MEMO : ServiceInstance리스트페이지에서 ServicePlan이름클릭 시 SidePanel펼쳐진 ServiceInstance상세페이지로 이동하는 기획에 맞춰 구현하기 위해(Sidepanel펼침유무는 원래 url로 구분이 안됨)
// ?serviceplanSidebar=open param을 붙여서 상세페이지로 이동시키고 ServiceInstanceDetails에서 해당 param이 붙어왔을 땐 sidepanel 펼쳐준 뒤 param 없애주는 방식으로 구현함.
const ServicePlanSidePanelOpenedLink = ({ serviceinstance, displayName, iconKind }) => {
  return (
    <>
      <ResourceIcon kind={iconKind} />
      <Link to={resourcePath(ServiceInstanceModel.kind, serviceinstance.metadata.name, serviceinstance.metadata.namespace) + '?serviceplanSidebar=open'}>{displayName}</Link>
    </>
  );
};

const ServiceInstanceTableRow = ({ obj, index, key, style }) => {
  const clusterServiceClassRefName = obj.spec?.clusterServiceClassExternalName || obj.spec?.clusterServiceClassRef?.name;
  const clusterServicePlanRefName = obj.spec?.clusterServicePlanExternalName || obj.spec?.clusterServicePlanRef?.name;

  const serviceClassRefName = obj.spec?.serviceClassExternalName || obj.spec?.serviceClassRef?.name;
  const servicePlanRefName = obj.spec?.servicePlanExternalName || obj.spec?.servicePlanRef?.name;

  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1])}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Status status={obj.status?.lastConditionState} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>{!!clusterServiceClassRefName ? <ResourceLink kind={ClusterServiceClassModel.kind} title={clusterServiceClassRefName} name={obj.spec.clusterServiceClassRef?.name} displayName={clusterServiceClassRefName} /> : <ResourceLink kind={ServiceClassModel.kind} title={serviceClassRefName} name={obj.spec.serviceClassRef?.name} displayName={serviceClassRefName} namespace={obj.metadata.namespace} />}</TableData>
      <TableData className={tableColumnClasses[4]}>
        {!!clusterServicePlanRefName ? (
          <dd>
            <ServicePlanSidePanelOpenedLink serviceinstance={obj} iconKind={ClusterServicePlanModel.kind} displayName={clusterServiceClassRefName} />
          </dd>
        ) : (
          <dd>
            <ServicePlanSidePanelOpenedLink serviceinstance={obj} iconKind={ServicePlanModel.kind} displayName={servicePlanRefName} />
          </dd>
        )}
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={serviceInstanceMenuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

const getServiceClassName = (obj: K8sResourceKind): string | null => {
  const clusterServiceClassRefName = obj.spec?.clusterServiceClassExternalName || obj.spec?.clusterServiceClassRef?.name;
  const serviceClassRefName = obj.spec?.serviceClassExternalName || obj.spec?.serviceClassRef?.name;

  return clusterServiceClassRefName || serviceClassRefName;
};

const getServicePlanName = (obj: K8sResourceKind): string | null => {
  const clusterServicePlanRefName = obj.spec?.clusterServicePlanExternalName || obj.spec?.clusterServicePlanRef?.name;
  const servicePlanRefName = obj.spec?.servicePlanExternalName || obj.spec?.servicePlanRef?.name;

  return clusterServicePlanRefName || servicePlanRefName;
};

const ServiceInstanceTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.lastConditionState',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_8'),
      sortFunc: 'getServiceClassName',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_DETAILS_TABSERVICEPLANS_1'),
      sortFunc: 'getServicePlanName',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};

ServiceInstanceTableHeader.displayName = 'ServiceInstanceTableHeader';

const ServiceInstancesList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Service Instance" Header={ServiceInstanceTableHeader.bind(null, t)} Row={ServiceInstanceTableRow} customSorts={{ getServiceClassName, getServicePlanName }} />;
};
ServiceInstancesList.displayName = 'ServiceInstancesList';

const serviceInstanceStatusReducer = (serviceInstance: any): string => {
  return serviceInstance.status?.lastConditionState;
};

const ServiceInstancesPage: React.FC<ServiceInstancesPageProps> = props => {
  const { t } = useTranslation();
  return (
    <ListPage
      title={t('COMMON:MSG_LNB_MENU_17')}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_17') })}
      createProps={{ to: `/catalog/ns/${props.namespace}/serviceinstance?kind=%5B"ClusterServiceClass"%2C"ServiceClass"%5D` }}
      canCreate={true}
      kind={kind}
      ListComponent={ServiceInstancesList}
      rowFilters={[
        {
          filterLabel: t('COMMON:MSG_COMMON_BUTTON_FILTER_3'),
          filterGroupName: 'Status',
          type: 'service-instance-status',
          reducer: serviceInstanceStatusReducer,
          items: [
            { id: 'Ready', title: 'Ready' },
            { id: 'Failed', title: 'Failed' },
          ],
        },
      ]}
      {...props}
    />
  );
};
ServiceInstancesPage.displayName = 'ServiceInstancesPage';

export { ServiceInstancesList, ServiceInstancesPage, ServiceInstancesDetailsPage };

type ServiceInstancesPageProps = {
  namespace: string;
};

type ServiceInstancesDetailsPageProps = {
  match: any;
};

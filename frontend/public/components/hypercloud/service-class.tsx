import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ServiceClassModel } from '../../models';
import { ServicePlansPage } from './service-plan';
import { K8sResourceKind } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { navFactory, SectionHeading, ResourceSummary, ResourceLink, Timestamp } from '../utils';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

const kind = ServiceClassModel.kind;

const ServiceClassDetails: React.FC<ServiceClassDetailsProps> = ({ obj: serviceClass }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(serviceClass, t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={serviceClass} showPodSelector={false} showNodeSelector={false} showAnnotations={false}></ResourceSummary>
          </div>
          <div className="col-md-6">
            <dl className="co-m-pane__details">
              <dt>{t('COMMON:MSG_MAIN_TABLEHEADER_83')}</dt>
              <dd>{serviceClass.spec.bindable ? 'Available' : 'Unavailable'}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_17')}</dt>
              <dd>{serviceClass.spec?.externalName}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_18')}</dt>
              <dd>
                <ResourceLink kind="ServiceBroker" name={serviceClass.spec?.serviceBrokerName} title={serviceClass.spec?.serviceBrokerName} namespace={serviceClass.metadata.namespace} />
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

type ServiceClassDetailsProps = {
  obj: K8sResourceKind;
};

const ServicePlansTab: React.FC<ServicePlansTabProps> = ({ obj }) => {
  const serviceClassRef = obj.spec?.externalMetadata?.serviceClassRefName;

  const selector = {
    matchLabels: {
      'servicecatalog.k8s.io/spec.serviceClassRef.name': serviceClassRef,
    },
  };

  return <ServicePlansPage selector={selector} />;
};

const { details } = navFactory;
const ServiceClassesDetailsPage: React.FC<ServiceClassesDetailsPageProps> = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} kind={kind} pages={[details(ServiceClassDetails), { href: 'serviceplans', name: t('COMMON:MSG_DETAILS_TABSERVICEPLANS_1'), component: ServicePlansTab }]} />;
};
ServiceClassesDetailsPage.displayName = 'ServiceClassesDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', //NAMESPACE
  classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), //BINDABLE
  classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), //EXTERNAL NAME
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // SERVICEBROKER
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'), // CREATED
];

const ServiceClassTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1])}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>{obj.spec.bindable ? 'Available' : 'Unavailable'}</TableData>
      <TableData className={tableColumnClasses[3]}>{obj.spec?.externalName}</TableData>
      <TableData className={tableColumnClasses[4]}>
        <ResourceLink kind="ServiceBroker" name={obj.spec.serviceBrokerName} namespace={obj.metadata.namespace} title={obj.spec.serviceBrokerName} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
    </TableRow>
  );
};

const ServiceClassTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_83'),
      sortField: 'spec.bindable',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_6'),
      sortField: 'spec.externalName',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_7'),
      sortField: 'spec.serviceBrokerName',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
  ];
};

ServiceClassTableHeader.displayName = 'ServiceClassTableHeader';

const ServiceClassesList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Service Class" Header={ServiceClassTableHeader.bind(null, t)} Row={ServiceClassTableRow} />;
};
ServiceClassesList.displayName = 'ServiceClassesList';

const ServiceClassesPage: React.FC<ServiceClassesPageProps> = props => {
  const { t } = useTranslation();
  return <ListPage title={t('COMMON:MSG_LNB_MENU_12')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_12') })} canCreate={false} kind={kind} ListComponent={ServiceClassesList} {...props} />;
};
ServiceClassesPage.displayName = 'ServiceClassesPage';

export { ServiceClassesList, ServiceClassesPage, ServiceClassesDetailsPage };
type ServiceClassesPageProps = {};

type ServiceClassesDetailsPageProps = {
  match: any;
};

type ServicePlansTabProps = {
  obj: K8sResourceKind;
};

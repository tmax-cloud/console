import * as React from 'react';
import * as classNames from 'classnames';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { BareMetalHostModel } from '@console/internal/models';
import { BareMetalHostStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { TableProps } from './utils/default-list-component';

const kind = BareMetalHostModel.kind;

const menuActions: KebabAction[] = [...Kebab.factory.common];

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
      sortField: 'status.provisioning.state',
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
      className: classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'co-break-word'),
      children: <Status status={obj.status?.provisioning.state} />,
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

const filters = (t: TFunction) => [
    {
      filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
      type: 'baremetalhost-status',
      reducer: BareMetalHostStatusReducer,
      items: [
        { id: 'Registration Error', title: 'Registration Error' },
        { id: 'Registering', title: 'Registering' },
        { id: 'Match Profile', title: 'Match Profile' },
        { id: 'Ready', title: 'Ready' },
        { id: 'Provisioning', title: 'Provisioning' },
        { id: 'Provisioning Error', title: 'Provisioning Error' },
        { id: 'Provisioned', title: 'Provisioned' },
        { id: 'Externally Provisioned', title: 'Externally Provisioned' },
        { id: 'Deprovisioning', title: 'Deprovisioning' },
        { id: 'Inspecting', title: 'Inspecting' },
        { id: 'Power Management Error', title: 'Power Management Error' },
      ],
    },
  ];

export const BareMetalHostDetailsList: React.FC<BareMetalHostDetailsListProps> = ({ obj: bmh }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_3')} obj={bmh}>
        <Status status={bmh.status?.provisioning.state} />
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_1')} obj={bmh}>
        {bmh.status?.poweredOn ? t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_2') : t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_3')}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_4')} obj={bmh}>
        {bmh.spec?.online ? 'true' : 'false'}
      </DetailsItem>      
      <DetailsItem label={'BMC'} obj={bmh}>
        <ResourceLink kind="Secret" name={bmh.spec?.bmc?.credentialsName} namespace={bmh.metadata.namespace} title={bmh.spec?.bmc?.credentialsName} />        
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_1')} obj={bmh}>
        {bmh.spec?.image.url}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_9')} obj={bmh}>
        <ResourceLink kind="Secret" name={bmh.spec?.userData?.name} namespace={bmh.spec?.userData?.namespace} title={bmh.spec?.userData?.name} />        
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_5')} obj={bmh}>
        <div>{t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_6') + ' : '+ bmh.status?.hardware?.hostname}</div>
        <div>{'Nics IP : '}{bmh.status?.hardware?.nics?.map((nic, index) => { return <div key={`nic-ip-${index}`} style={{display: 'inline'}}>{nic.ip + ' '}</div> })}</div>        
        <div>{t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_7') + ' : '+ bmh.status?.hardware?.systemVendor?.manufacturer + ' ' + bmh.status?.hardware?.systemVendor?.productName}</div>
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_BAREMETALHOSTS_BAREMETALHOSTDETAILS_TABDETAILS_8')} obj={bmh}>
        <Timestamp timestamp={bmh.status?.lastUpdated} />
      </DetailsItem>
    </dl>
  );
};

const BareMetalHostDetails: React.FC<BareMetalHostDetailsProps> = ({ obj: bmh }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(bmh, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={bmh} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <BareMetalHostDetailsList obj={bmh} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const BareMetalHostsPage: React.FC = props => {
  const { t } = useTranslation();
  return <ListPage {...props} canCreate={true} kind={kind} rowFilters={filters.bind(null, t)()} tableProps={tableProps} />;
};

export const BareMetalHostsDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} getResourceStatus={BareMetalHostStatusReducer} pages={[details(detailsPage(BareMetalHostDetails)), editResource()]} />;
};

type BareMetalHostDetailsListProps = {
  obj: K8sResourceKind;
};

type BareMetalHostDetailsProps = {
  obj: K8sResourceKind;
};

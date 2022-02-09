import * as React from 'react';
import * as classNames from 'classnames';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { BareMetalHost2Model } from '../../models';
import { BareMetalHostStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { TableProps } from './utils/default-list-component';

const kind = BareMetalHost2Model.kind;

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
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} customData={{ label: 'URL', url: obj.spec?.tower_hostname ? `https://${obj.spec?.tower_hostname}` : null }} />,
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
      <DetailsItem label={'power'} obj={bmh}>
        {bmh.status?.poweredOn ? t('on') : t('off')}
      </DetailsItem>
      <DetailsItem label={'online'} obj={bmh}>
        {bmh.spec?.online ? 'true' : 'false'}
      </DetailsItem>      
      <DetailsItem label={'BMC'} obj={bmh}>
        <ResourceLink kind="Secret" name={bmh.spec?.bmc?.address} namespace={bmh.metadata.namespace} title={bmh.spec?.bmc?.address} />        
      </DetailsItem>
      <DetailsItem label={"imageURL"} obj={bmh}>
        {bmh.spec?.image.url}
      </DetailsItem>
      <DetailsItem label={'userdata'} obj={bmh}>
        <ResourceLink kind="Secret" name={bmh.spec?.userdata} namespace={bmh.metadata.namespace} title={bmh.spec?.userdata} />        
      </DetailsItem>
      <DetailsItem label={'hardwareprofile'} obj={bmh}>
        {bmh.spec?.hardwareProfile}
      </DetailsItem>
      <DetailsItem label={'updateTime'} obj={bmh}>
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
  const [url, setUrl] = React.useState(null);
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} customData={{ label: 'URL', url: url ? `https://${url}` : null }} customStatePath="spec.tower_hostname" setCustomState={setUrl} getResourceStatus={BareMetalHostStatusReducer} pages={[details(detailsPage(BareMetalHostDetails)), editResource()]} />;
};

type BareMetalHostDetailsListProps = {
  obj: K8sResourceKind;
};

type BareMetalHostDetailsProps = {
  obj: K8sResourceKind;
};

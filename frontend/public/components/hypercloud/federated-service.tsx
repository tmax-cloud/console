import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, LabelList, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Selector, ResourceIcon } from '../utils';
import { ResourceEventStream } from '../events';
import { FederatedServiceModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(FederatedServiceModel), ...Kebab.factory.common];

const kind = FederatedServiceModel.kind;
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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_15',
      sortField: 'metadata.labels',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_16',
      sortField: 'service.spec.template.spec.selector',
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
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: <LabelList kind={kind} labels={obj.metadata.labels} />,
    },
    {
      children: <Selector selector={obj.spec?.template?.spec?.selector} namespace={obj.metadata.namespace} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const ServicePortMapping = ({ ports }) => {
  return (
    <div>
      <div className="row co-ip-header">
        <div className="col-xs-3">Name</div>
        <div className="col-xs-3">Port</div>
        <div className="col-xs-3">Protocol</div>
        <div className="col-xs-3">Target Port</div>
      </div>
      <div className="rows">
        {ports.map((portObj, i) => {
          return (
            <div className="co-ip-row" key={i}>
              <div className="row">
                <div className="col-xs-3 co-text-service">
                  <p>{portObj.name || '-'}</p>
                  {portObj.nodePort && <p className="co-text-node">Node Port</p>}
                </div>
                <div className="col-xs-3 co-text-service">
                  <p>
                    <ResourceIcon kind="Service" />
                    <span>{portObj.port}</span>
                  </p>
                  {portObj.nodePort && (
                    <p className="co-text-node">
                      <ResourceIcon kind="Node" />
                      <span>{portObj.nodePort}</span>
                    </p>
                  )}
                </div>
                <div className="col-xs-3">
                  <p>{portObj.protocol}</p>
                </div>
                <div className="col-xs-3 co-text-pod">
                  <p>
                    <ResourceIcon kind="Pod" />
                    <span>{portObj.targetPort}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FederatedServiceDetails: React.FC<FederatedServiceDetailsProps> = ({ obj: service }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(service, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={service} />
          </div>
          <div className="col-sm-6">
            <SectionHeading text={t('SINGLE:MSG_SERVICES_SERVICESDETAILS_TABDETAILS_SERVICEROUTING_1')} />
            <dl>
              <DetailsItem label={t('SINGLE:MSG_SERVICES_SERVICESDETAILS_TABDETAILS_SERVICEROUTING_5')} obj={service} path="spec.ports">
                <div className="service-ips">{service.spec?.template?.spec?.ports ? <ServicePortMapping ports={service.spec.template.spec.ports} /> : '-'}</div>
              </DetailsItem>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource, events } = navFactory;

export const FederatedServicesPage: React.FC<FederatedServicesPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const FederatedServicesDetailsPage: React.FC<FederatedServicesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(FederatedServiceDetails)), editResource(), events(ResourceEventStream)]} />;

type FederatedServiceDetailsProps = {
  obj: K8sResourceKind;
};

type FederatedServicesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type FederatedServicesDetailsPageProps = {
  match: any;
};

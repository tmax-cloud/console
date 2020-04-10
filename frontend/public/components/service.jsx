import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { Cog, navFactory, LabelList, ResourceCog, SectionHeading, ResourceIcon, ResourceLink, ResourceSummary, Selector } from './utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyPodSelector, ...Cog.factory.common];

const ServiceIP = ({ s }) => {
  const children = _.map(s.spec.ports, (portObj, i) => {
    const clusterIP = s.spec.clusterIP === 'None' ? 'None' : `${s.spec.clusterIP}:${portObj.port}`;
    return <div key={i}>{clusterIP}</div>;
  });

  return children;
};

const ServiceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-2 col-md-2 col-sm-2 col-xs-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 col-sm-2 col-xs-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-lg-1 col-md-1 col-sm-1 col-xs-1" sortField="spec.type">
        {t('CONTENT:TYPE')}
      </ColHead>
      <ColHead {...props} className="col-lg-1 col-md-1 col-sm-1 col-xs-1" sortField="status.loadBalancer.ingress[0]">
        {t('CONTENT:EXTERNALIP')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 col-sm-2 hidden-xs" sortField="metadata.labels">
        {t('CONTENT:LABELS')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.selector">
        {t('CONTENT:PODSELECTOR')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs" sortField="spec.clusterIP">
        {t('CONTENT:LOCATION')}
      </ColHead>
    </ListHeader>
  );
};

const ServiceRow = ({ obj: s }) => (
  <ResourceRow obj={s}>
    <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2 co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind="Service" resource={s} />
      <ResourceLink kind="Service" name={s.metadata.name} namespace={s.metadata.namespace} title={s.metadata.uid} />
    </div>
    <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2 co-break-word">
      <ResourceLink kind="Namespace" name={s.metadata.namespace} title={s.metadata.namespace} />
    </div>
    <div className="col-xs-1 col-sm-1 hidden-xs">{s.spec.type}</div>
    <div className="col-xs-1 col-sm-1 hidden-xs">{(!_.isEmpty(s.status.loadBalancer) && s.status.loadBalancer.ingress.map(cur => cur.ip).join(', ')) || 'No External IP'}</div>
    <div className="col-lg-2 col-md-2 col-sm-4 hidden-xs">
      <LabelList kind="Service" labels={s.metadata.labels} />
    </div>
    <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
      <Selector selector={s.spec.selector} namespace={s.metadata.namespace} />
    </div>
    <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
      <ServiceIP s={s} />
    </div>
  </ResourceRow>
);

const ServiceAddress = ({ s }) => {
  const { t } = useTranslation();
  const ServiceIPsRow = (name, desc, ips, note = null) => (
    <div className="co-ip-row">
      <div className="row">
        <div className="col-xs-6">
          <p className="ip-name">{name}</p>
          <p className="ip-desc">{desc}</p>
        </div>
        <div className="col-xs-6">
          {note && <span className="text-muted">{note}</span>}
          {ips.join(', ')}
        </div>
      </div>
    </div>
  );

  const ServiceType = type => {
    switch (type) {
      case 'NodePort':
        return ServiceIPsRow(t('CONTENT:NODEPORT'), t('STRING:SERVICE_DETAIL_0'), _.map(s.spec.ports, 'nodePort'), '(all nodes): ');
      case 'LoadBalancer':
        return ServiceIPsRow(
          t('CONTENT:EXTERNALLOADBALANCERIP'),
          t('STRING:SERVICE_DETAIL_1'),
          _.map(s.status.loadBalancer.ingress, i => i.hostname || i.ip || '-'),
        );
      case 'ExternalName':
        return ServiceIPsRow(t('CONTENT:EXTERNALSERVICENAME'), t('STRING:SERVICE_DETAIL_2'), [s.spec.externalName]);
      default:
        return ServiceIPsRow(t('CONTENT:CLUSTERIP'), t('STRING:SERVICE_DETAIL_3'), [s.spec.clusterIP]);
    }
  };

  return (
    <div>
      <div className="row co-ip-header">
        <div className="col-xs-6">{t('CONTENT:TYPE')}</div>
        <div className="col-xs-6">{t('CONTENT:LOCATION')}</div>
      </div>
      <div className="rows">
        {ServiceType(s.spec.type)}
        {s.spec.externalIPs && ServiceIPsRow(t('CONTENT:EXTERNALIP'), t('STRING:SERVICE_DETAIL_4'), s.spec.externalIPs)}
      </div>
    </div>
  );
};

const ServicePortMapping = ({ ports }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="row co-ip-header">
        <div className="col-xs-3">{t('CONTENT:NAME')}</div>
        <div className="col-xs-3">{t('CONTENT:PORT')}</div>
        <div className="col-xs-3">{t('CONTENT:PROTOCOL')}</div>
        <div className="col-xs-3">{t('CONTENT:PODPORTORNAME')}</div>
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

const Details = ({ obj: s }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-sm-6">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Service', t) })} />
          <ResourceSummary resource={s} showNodeSelector={false}>
            <dt>{t('CONTENT:TYPE')}</dt>
            <dd>{s.spec.type}</dd>
            {/* <dt>External IP</dt>
        <dd>{(!_.isEmpty(s.status.loadBalancer) && s.status.loadBalancer.ingress.join(', ')) || 'No External IP'}</dd> */}
            <dt>{t('CONTENT:SESSIONAFFINITY')}</dt>
            <dd>{s.spec.sessionAffinity || '-'}</dd>
          </ResourceSummary>
        </div>
        <div className="col-sm-6">
          <SectionHeading text={t('CONTENT:SERVICEROUTING')} />
          <dl>
            <dt>{t('CONTENT:SERVICEADDRESS')}</dt>
            <dd className="service-ips">
              <ServiceAddress s={s} />
            </dd>
            <dt>{t('CONTENT:SERVICEPORTMAPPING')}</dt>
            <dd className="service-ips">{s.spec.ports ? <ServicePortMapping ports={s.spec.ports} /> : '-'}</dd>
            {/* <dt>Service Port Mapping</dt>
            <dd className="service-ips">{s.spec.ports ? <ServicePortMapping ports={s.spec.ports} /> : '-'}</dd> */}
          </dl>
        </div>
      </div>
    </div>
  );
};

const { details, pods, editYaml } = navFactory;
const ServicesDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[details(Details), editYaml(), pods()]} />;

const ServicesList = props => <List {...props} Header={ServiceHeader} Row={ServiceRow} />;
//const ServicesPage = props => <ListPage canCreate={true} ListComponent={ServicesList} {...props} />;
const ServicesPage = props => {
  const { t } = useTranslation();
  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/services/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  return <ListPage ListComponent={ServicesList} canCreate={true} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} createProps={createProps} {...props} />;
};

export { ServicesList, ServicesPage, ServicesDetailsPage };

import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { Cog, SectionHeading, LabelList, ResourceCog, ResourceIcon, detailsPage, EmptyBox, navFactory, ResourceLink, ResourceSummary } from './utils';

import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = Cog.factory.common;

export const ingressValidHosts = ingress => _.map(_.get(ingress, 'spec.rules', []), 'host').filter(_.isString);

const getHosts = ingress => {
  const hosts = ingressValidHosts(ingress);

  if (hosts.length) {
    return <div>{hosts.join(', ')}</div>;
  }

  return <div className="text-muted">No hosts</div>;
};

const getTLSCert = ingress => {
  const { t } = useTranslation();
  if (!_.has(ingress.spec, 'tls')) {
    return (
      <div>
        <span>{t('CONTENT:NOTFIGURED')}</span>
      </div>
    );
  }

  const certs = _.map(ingress.spec.tls, 'secretName');

  return (
    <div>
      <ResourceIcon kind="Secret" className="co-m-resource-icon--align-left" />
      <span>{certs.join(', ')}</span>
    </div>
  );
};

const IngressListHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-md-3 col-sm-4 hidden-xs" sortField="metadata.labels">
        {t('CONTENT:LABELS')}
      </ColHead>
      <ColHead {...props} className="col-md-3 hidden-sm hidden-xs" sortFunc="ingressValidHosts">
        {t('CONTENT:HOSTS')}
      </ColHead>
    </ListHeader>
  );
};

const IngressListRow = ({ obj: ingress }) => (
  <ResourceRow obj={ingress}>
    <div className="col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind="Ingress" resource={ingress} />
      <ResourceLink kind="Ingress" name={ingress.metadata.name} namespace={ingress.metadata.namespace} title={ingress.metadata.uid} />
    </div>
    <div className="col-md-3 col-sm-4 col-xs-6 co-break-word">
      <ResourceLink kind="Namespace" name={ingress.metadata.namespace} title={ingress.metadata.namespace} />
    </div>
    <div className="col-md-3 col-sm-4 hidden-xs">
      <LabelList kind="Ingress" labels={ingress.metadata.labels} />
    </div>
    <div className="col-md-3 hidden-sm hidden-xs">{getHosts(ingress)}</div>
  </ResourceRow>
);

const RulesHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="row co-m-table-grid__head">
      <div className="col-xs-3">{t('CONTENT:HOST')}</div>
      <div className="col-xs-3">{t('CONTENT:PATH')}</div>
      <div className="col-xs-3">{t('CONTENT:SERVICE')}</div>
      <div className="col-xs-2">{t('CONTENT:SERVICEHOST')}</div>
    </div>
  );
};

const RulesRow = ({ rule, namespace }) => {
  return (
    <div className="row co-resource-list__item">
      <div className="col-xs-3 co-break-word">
        <div>{rule.host}</div>
      </div>
      <div className="col-xs-3 co-break-word">
        <div>{rule.path}</div>
      </div>
      <div className="col-xs-3">{rule.serviceName ? <ResourceLink kind="Service" name={rule.serviceName} namespace={namespace} /> : '-'}</div>
      <div className="col-xs-2">
        <div>{rule.servicePort || '-'}</div>
      </div>
    </div>
  );
};

const RulesRows = props => {
  const rules = [];

  if (_.has(props.spec, 'rules')) {
    _.forEach(props.spec.rules, rule => {
      const paths = _.get(rule, 'http.paths');
      if (_.isEmpty(paths)) {
        rules.push({
          host: rule.host || '*',
          path: '*',
          serviceName: _.get(props.spec, 'backend.serviceName'),
          servicePort: _.get(props.spec, 'backend.servicePort'),
        });
      } else {
        _.forEach(paths, path => {
          rules.push({
            host: rule.host || '*',
            path: path.path || '*',
            serviceName: path.backend.serviceName,
            servicePort: path.backend.servicePort,
          });
        });
      }
    });

    const rows = _.map(rules, rule => {
      return <RulesRow rule={rule} key={rule.serviceName} namespace={props.namespace} />;
    });

    return <div className="co-m-table-grid__body"> {rows} </div>;
  }

  return <EmptyBox label="Rule" />;
};

const Details = ({ obj: ingress }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Ingress', t) })} />
        <ResourceSummary resource={ingress} showPodSelector={false} showNodeSelector={false}>
          <dt>{t('CONTENT:TLSCERTIFICATE')}</dt>
          <dd>{getTLSCert(ingress)}</dd>
        </ResourceSummary>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:INGRESSRULES')} />
        <p className="co-m-pane__explanation">{t('STRING:INGRESS_DETAIL_0')}</p>
        <div className="co-m-table-grid co-m-table-grid--bordered">
          <RulesHeader />
          <RulesRows spec={ingress.spec} namespace={ingress.metadata.namespace} />
        </div>
      </div>
    </React.Fragment>
  );
};

const IngressesDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(detailsPage(Details), t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};
const IngressesList = props => <List {...props} Header={IngressListHeader} Row={IngressListRow} />;
const IngressesPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={IngressesList} canCreate={true} kind="Ingress" createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};

// 미리: 인그레스 페이지는 폼 에디터 임시로 disable
// {
//   const createItems = {
//     form: '인그레스 (폼 에디터)',
//     yaml: '인그레스 (YAML 에디터)'
//   };

//   const createProps = {
//     items: createItems,
//     createLink: (type) => `/k8s/ns/${props.namespace || 'default'}/ingresses/new${type !== 'yaml' ? '/' + type : ''}`
//   };
//   return <ListPage ListComponent={IngressesList} canCreate={true} createButtonText="Create" createProps={createProps} {...props} />;
// };
export { IngressesList, IngressesPage, IngressesDetailsPage };

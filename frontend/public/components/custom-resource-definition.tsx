import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ColHead, List, ListHeader, ListPage } from './factory';
import { Cog, ResourceCog, ResourceIcon, kindObj } from './utils';
import { referenceForCRD } from '../module/k8s';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const CRDHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-lg-4 col-md-4 col-sm-4 col-xs-6" sortField="spec.names.kind">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 col-xs-6" sortField="spec.group">
        {t('CONTENT:GROUP')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 hidden-xs" sortField="spec.version">
        {t('CONTENT:VERSION')}
      </ColHead>
      <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.scope">
        {t('CONTENT:NAMESPACED')}
      </ColHead>
      <ColHead {...props} className="col-lg-1 hidden-md hidden-sm hidden-xs">
        {t('CONTENT:ESTABLISHED')}
      </ColHead>
    </ListHeader>
  );
};

const isEstablished = conditions => {
  const condition = _.find(conditions, c => c.type === 'Established');
  return condition && condition.status === 'True';
};

const namespaced = crd => crd.spec.scope === 'Namespaced';

const CRDRow = ({ obj: crd }) => {
  const { t } = useTranslation();
  let ko = kindObj(crd.spec.names.kind);
  let path;
  // default-resource 쓸건지, 따로 만든 페이지 쓸건지
  if (!_.isEmpty(ko)) {
    path = crd.spec && crd.spec.scope === 'Cluster' ? `/k8s/cluster/${crd.spec.names.plural}` : `/k8s/all-namespaces/${crd.spec.names.plural}`;
  } else {
    path = crd.spec && crd.spec.scope === 'Cluster' ? `/k8s/cluster/${referenceForCRD(crd)}` : `/k8s/all-namespaces/${referenceForCRD(crd)}`;
  }
  return (
    <div className="row co-resource-list__item">
      <div className="col-lg-4 col-md-4 col-sm-4 col-xs-6 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind="CustomResourceDefinition" resource={crd} />
        <ResourceIcon kind="CustomResourceDefinition" />
        <Link to={path}>{_.get(crd, 'spec.names.kind', crd.metadata.name)}</Link>
      </div>
      <div className="col-lg-3 col-md-4 col-sm-4 col-xs-6 co-break-word">{crd.spec.group}</div>
      <div className="col-lg-2 col-md-2 col-sm-4 hidden-xs">{crd.spec.version}</div>
      {/* <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{namespaced(crd) ? t('CONTENT:YES') : t('CONTENT:NO')}</div> */}
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{namespaced(crd) ? 'YES' : 'NO'}</div>
      <div className="col-lg-1 hidden-md hidden-sm hidden-xs">
        {isEstablished(crd.status.conditions) ? (
          <span className="node-ready">
            <i className="fa fa-check-circle"></i>
          </span>
        ) : (
          <span className="node-not-ready">
            <i className="fa fa-minus-circle"></i>
          </span>
        )}
      </div>
    </div>
  );
};

export const CustomResourceDefinitionsList = props => <List {...props} Header={CRDHeader} Row={CRDRow} />;
export const CustomResourceDefinitionsPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={CustomResourceDefinitionsList} kind="CustomResourceDefinition" canCreate={true} filterLabel="CRDs by name" createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};

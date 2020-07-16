import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { FLAGS, connectToFlags } from '../features';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, Selector, helpLink, HELP_TOPICS } from './utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyPodSelector, Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const Header = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-4" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-3" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-5" sortField="spec.podSelector">
        {t('CONTENT:PODSELECTOR')}
      </ColHead>
    </ListHeader>
  );
};

const kind = 'NetworkPolicy';
const Row = ({ obj: np }) => {
  const { t } = useTranslation();
  return (
    <div className="row co-resource-list__item">
      <div className="col-xs-4 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind={kind} resource={np} />
        <ResourceLink kind={kind} name={np.metadata.name} namespace={np.metadata.namespace} title={np.metadata.name} />
      </div>
      <div className="col-xs-3 co-break-word">
        <ResourceLink kind={'Namespace'} name={np.metadata.namespace} title={np.metadata.namespace} />
      </div>

      <div className="col-xs-5 co-break-word">{_.isEmpty(np.spec.podSelector) ? <Link to={`/search/ns/${np.metadata.namespace}?kind=Pod`}>{t('ADDITIONAL:PODSELECTOR-EMPTY_0', { something: np.metadata.namespace })}</Link> : <Selector selector={np.spec.podSelector} namespace={np.metadata.namespace} />}</div>
    </div>
  );
};

const NetworkPoliciesList = props => <List {...props} Header={Header} Row={Row} />;
export const NetworkPoliciesPage = props => {
  const { t } = useTranslation();

  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };
  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/networkpolicies/new${type !== 'yaml' ? '/' + type : ''}`,
  };

  console.log('props', props);

  return (
    <ListPage
      {...props}
      ListComponent={NetworkPoliciesList}
      kind={kind}
      canCreate={true}
      createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })}
      createProps={createProps}
      // tooltipTitle="네트워크 정책"
      // tooltipContentsElements={
      //   <React.Fragment>
      //     <p>네트워크 정책은 파드 그룹이 서로 간에 또는 다른 네트워크 엔드포인트와 통신할 수 있도록 허용합니다. </p>
      //     <p>네트워크 정책 리소스는 레이블을 사용해서 파드를 선택하고 선택한 파드에 허용되는 트래픽을 지정하는 규칙을 정의 합니다. </p>
      //     <p> 네트워크 정책은 네트워크 플러그인으로 구현되며, 네트워크 정책을 사용하려면 네트워크 정책을 지원하는 네트워킹 솔루션을 사용해야 합니다.</p>
      //   </React.Fragment>
      // }
      {...props}
    />
  );
};

const IngressHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="row co-m-table-grid__head">
      <div className="col-xs-4">{t('CONTENT:TARGETPODS')}</div>
      <div className="col-xs-5">{t('CONTENT:FROM')}</div>
      <div className="col-xs-3">{t('CONTENT:TOPORTS')}</div>
    </div>
  );
};

const IngressRow = ({ ingress, namespace, podSelector }) => {
  const podSelectors = [];
  const nsSelectors = [];
  let i = 0;
  const { t } = useTranslation();

  const style = { margin: '5px 0' };
  _.each(ingress.from, ({ namespaceSelector, podSelector: ps }) => {
    if (namespaceSelector) {
      nsSelectors.push(
        <div key={i++} style={style}>
          <Selector selector={namespaceSelector} kind="Namespace" />
        </div>,
      );
    } else {
      podSelectors.push(
        <div key={i++} style={style}>
          <Selector selector={ps} namespace={namespace} />
        </div>,
      );
    }
  });
  return (
    <div className="row co-resource-list__item">
      <div className="col-xs-4">
        <div>
          <span className="text-muted">{t('CONTENT:PODSELECTOR')}:</span>
        </div>
        <div style={style}>
          <Selector selector={podSelector} namespace={namespace} />
        </div>
      </div>
      <div className="col-xs-5">
        <div>
          {!podSelectors.length ? null : (
            <div>
              <span className="text-muted">{t('CONTENT:PODSELECTOR')}:</span>
              {podSelectors}
            </div>
          )}
          {!nsSelectors.length ? null : (
            <div style={{ paddingTop: podSelectors.length ? 10 : 0 }}>
              <span className="text-muted">{t('CONTENT:NAMESPACESELECTOR')}:</span>
              {nsSelectors}
            </div>
          )}
        </div>
      </div>
      <div className="col-xs-3">
        {_.map(ingress.ports, (port, k) => (
          <p key={k}>
            {port.protocol}/{port.port}
          </p>
        ))}
      </div>
    </div>
  );
};

const Details_ = ({ flags, obj: np }) => {
  const { t } = useTranslation();
  const networkPolicyDocs = flags[FLAGS.OPENSHIFT] ? helpLink(HELP_TOPICS.NETWORK_POLICY_GUIDE) : 'https://kubernetes.io/docs/concepts/services-networking/network-policies/';
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('NetworkPolicy', t) })} />
        <ResourceSummary resource={np} podSelector={'spec.podSelector'} showNodeSelector={false} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:INGRESSRULES')} />
        <p className="co-m-pane__explanation">
          {t('STRING:NETWORKPOLICY-DETAIL_0')}{' '}
          <a target="_blank" rel="noopener noreferrer" href={networkPolicyDocs}>
            {t('CONTENT:NETWORKPOLICIESDOCUMENTATION')}
          </a>
          .
        </p>
        {_.isEmpty(_.get(np, 'spec.ingress[0]', [])) ? (
          t('ADDITIONAL:INGRESSRULEEMPTY', { something: np.metadata.namespace })
        ) : (
          <div className="co-m-table-grid co-m-table-grid--bordered">
            <IngressHeader />
            <div className="co-m-table-grid__body">
              {_.map(np.spec.ingress, (ingress, i) => (
                <IngressRow key={i} ingress={ingress} podSelector={np.spec.podSelector} namespace={np.metadata.namespace} />
              ))}
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

const Details = connectToFlags(FLAGS.OPENSHIFT)(Details_);

export const NetworkPoliciesDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

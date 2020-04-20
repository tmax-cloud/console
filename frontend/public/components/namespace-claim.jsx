import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete, Cog.factory.EditStatus];

const NamespaceClaimHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="status.status">
        {t('CONTENT:STATUS')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="resourceName">
        {t('CONTENT:RESOURCENAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const NamespaceClaimRow = () =>
  // eslint-disable-next-line no-shadow
  function NamespaceClaimRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-3 col-sm-3 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="NamespaceClaim" resource={obj} />
          <ResourceLink kind="NamespaceClaim" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{obj.status && obj.status.status}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{obj.resourceName}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

// const DetailsForKind = kind =>
//   function DetailsForKind_({ obj }) {
//     return (
//       <React.Fragment>
//         <div className="co-m-pane__body">
//           <SectionHeading text={`${kindForReference(kind)} Overview`} />
//           <ResourceSummary
//             resource={obj}
//             podSelector="spec.podSelector"
//             showNodeSelector={false}
//           />
//         </div>
//       </React.Fragment>
//     );
//   };

const Details = ({ obj: namespaceinstance }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('NAMESPACECLAIM', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={namespaceinstance} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:RESOURCENAME')}</dt>
              <dd>{namespaceinstance.resourceName}</dd>
              <dt>{t('CONTENT:STATUS')}</dt>
              <dd>{namespaceinstance.status && namespaceinstance.status.status}</dd>
              {namespaceinstance.status && namespaceinstance.status.reason && <dt>{t('CONTENT:REASON')}</dt>}
              {namespaceinstance.status && namespaceinstance.status.reason && <dd>{namespaceinstance.status.reason}</dd>}
              {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const NamespaceClaimList = props => {
  const { kinds } = props;
  const Row = NamespaceClaimRow(kinds[0]);
  Row.displayName = 'NamespaceClaimRow';
  return <List {...props} Header={NamespaceClaimHeader} Row={Row} />;
};
NamespaceClaimList.displayName = NamespaceClaimList;

export const NamespaceClaimsPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={NamespaceClaimList} canCreate={true} kind="NamespaceClaim" createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
};
NamespaceClaimsPage.displayName = 'NamespaceClaimsPage';

export const NamespaceClaimsDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      // breadcrumbsFor={obj =>
      //   breadcrumbsForOwnerRefs(obj).concat({
      //     name: 'Namespace Claim Details',
      //     path: props.match.url,
      //   })
      // }
      kind="NamespaceClaim"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};

NamespaceClaimsDetailsPage.displayName = 'NamespaceClaimsDetailsPage';

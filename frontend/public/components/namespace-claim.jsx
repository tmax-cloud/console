import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { k8sList } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete, Cog.factory.EditStatus];
// let namespaceList = [];
// let flag = 0;

const NamespaceClaimHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="status.status">
        {t('CONTENT:STATUS')}
      </ColHead>
      {/* <ColHead {...props} className="col-xs-3 col-sm-3">
        {t('CONTENT:TRIALTIME')}
      </ColHead> */}
      <ColHead {...props} className="col-xs-3 col-sm-3" sortField="resourceName">
        {/* {t('ADDITIONAL:NAME', { something: t('RESOURCE:NAMESPACE') })} */}
        {t('RESOURCE:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

// const TrialTime = namespace => {
//   let createTime = new Date(namespace.metadata.creationTimestamp.iMillis);
//   let start = String(createTime.getFullYear()) + '.' + String(createTime.getMonth() + 1) + '.' + String(createTime.getDate());
//   let end = String(createTime.getFullYear()) + '.' + String(createTime.getMonth() + 2) + '.' + String(createTime.getDate());
//   return start + '~' + end;
// };

const NamespaceClaimRow = () =>
  // eslint-disable-next-line no-shadow
  function NamespaceClaimRow({ obj }) {
    // flag = flag + 1;
    // const namespace = namespaceList.filter(cur => cur.metadata.name === obj.resourceName)[0];
    // let time = namespace && TrialTime(namespace);
    return (
      <div className="row co-resource-list__item">
        <div className="col-md-3 col-xs-3 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="NamespaceClaim" resource={obj} />
          <ResourceLink kind="NamespaceClaim" name={obj.metadata.name} title={obj.metadata.name} />
        </div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{obj.status && obj.status.status}</div>
        {/* <div className="col-xs-3 col-sm-3 hidden-xs">{time}</div> */}
        <div className="col-md-3 col-xs-3 co-resource-link-wrapper">{obj.resourceName}</div>
        <div className="col-xs-3 col-sm-3 hidden-xs">{fromNow(new Date(obj.metadata.creationTimestamp.iMillis))}</div>
      </div>
    );
  };

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
  const createItems = {
    form: t('CONTENT:FORMEDITOR'),
    yaml: t('CONTENT:YAMLEDITOR'),
  };
  const createProps = {
    items: createItems,
    createLink: type => `/k8s/cluster/namespaceclaims/new${type !== 'yaml' ? '/' + type : ''}`,
  };
  // React.useEffect(() => {
  //   k8sList(kindObj('Namespace'))
  //     .then(reponse => reponse)
  //     .then(
  //       data => {
  //         if (flag && !namespaceList.length) {
  //           // 이유는 모르겠는데 맨처음 페이지 진입시에는 then으로 바로 안들어오고 다음에 옴. flag값으로 분기 처리.
  //           location.reload();
  //         }
  //         namespaceList = data;
  //       },
  //       err => {
  //         console.error(err);
  //       },
  //     );
  // }, []);
  return <ListPage {...props} ListComponent={NamespaceClaimList} canCreate={true} kind="NamespaceClaim" createProps={createProps} {...props} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} />;
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

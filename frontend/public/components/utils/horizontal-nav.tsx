import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { History, Location } from 'history';
import { connect } from 'react-redux';
import { Route, Switch, Link, withRouter, match, matchPath } from 'react-router-dom';
import { RootState } from '@console/internal/redux';
import { match as RouterMatch } from 'react-router';

import * as UIActions from '../../actions/ui';

import { EmptyBox, StatusBox } from './status-box';
import { PodsPage } from '../pod';
import NodesPage from '@console/app/src/components/nodes/NodesPage';
import { AsyncComponent } from './async';
import { modelFor, K8sResourceKindReference, K8sKind } from '@console/internal/module/k8s';
import { K8sResourceKind, K8sResourceCommon } from '../../module/k8s';
import { referenceForModel, referenceFor } from '../../module/k8s/k8s';
import { useExtensions, HorizontalNavTab, isHorizontalNavTab } from '@console/plugin-sdk';
import { EditDefaultPage } from '../hypercloud/crd/edit-resource';
import { CustomResourceDefinitionModel } from '@console/internal/models';
import { pluralToKind, isResourceSchemaBasedMenu, isCreateManual, resourceSchemaBasedMenuMap } from '../hypercloud/form';
import { getIdToken } from '../../hypercloud/auth';
import { getK8sAPIPath } from '@console/internal/module/k8s/resource.js';
import { useTranslation } from 'react-i18next';

const editYamlComponent = props => <AsyncComponent loader={() => import('../edit-yaml').then(c => c.EditYAML)} obj={props.obj} />;
export const viewYamlComponent = props => <AsyncComponent loader={() => import('../edit-yaml').then(c => c.EditYAML)} obj={props.obj} readOnly={true} />;

export class NodesComponent extends React.PureComponent<NodesComponentProps> {
  render() {
    return <NodesPage />;
  }
}
export class PodsComponent extends React.PureComponent<PodsComponentProps> {
  render() {
    const {
      metadata: { namespace },
      spec: { selector },
    } = this.props.obj;
    const { customData } = this.props;
    if (_.isEmpty(selector)) {
      return <EmptyBox label="Pods" />;
    }

    // Hide the create button to avoid confusion when showing pods for an object.
    // Otherwise it might seem like you click "Create Pod" to add replicas instead
    // of scaling the owner.
    return <PodsPage showTitle={false} namespace={namespace} selector={selector} canCreate={false} customData={customData} />;
  }
}

export type Page = {
  href?: string;
  path?: string;
  name: string;
  component?: React.ComponentType<PageComponentProps>;
  pageData?: any;
};

type NavFactory = { [name: string]: (c?: React.ComponentType<any>) => Page };
export const navFactory: NavFactory = {
  details: component => ({
    href: '',
    name: 'COMMON:MSG_DETAILS_TABOVERVIEW_1',
    component,
  }),
  events: component => ({
    href: 'events',
    name: 'COMMON:MSG_DETAILS_TAB_7',
    component,
  }),
  logs: component => ({
    href: 'logs',
    name: 'COMMON:MSG_DETAILS_TAB_6',
    component,
  }),
  editResource: (component = EditDefaultPage) => ({
    href: 'edit',
    name: 'COMMON:MSG_DETAILS_TAB_18',
    component,
  }),
  editYaml: (component = editYamlComponent) => ({
    href: 'yaml',
    name: 'COMMON:MSG_DETAILS_TAB_2',
    component,
  }),
  pods: component => ({
    href: 'pods',
    name: 'COMMON:MSG_DETAILS_TAB_10',
    component: component || PodsComponent,
  }),
  nodes: component => ({
    href: 'nodes',
    name: '노드',
    component: component || NodesComponent,
  }),
  roles: component => ({
    href: 'roles',
    name: 'COMMON:MSG_DETAILS_TAB_14',
    component,
  }),
  builds: component => ({
    href: 'builds',
    name: '빌드',
    component,
  }),
  envEditor: component => ({
    href: 'environment',
    name: '환경 변수',
    component,
  }),
  clusterServiceClasses: component => ({
    href: 'serviceclasses',
    name: '서비스 클래스',
    component,
  }),
  clusterServicePlans: component => ({
    href: 'serviceplans',
    name: 'COMMON:MSG_DETAILS_TAB_3',
    component,
  }),
  serviceBindings: component => ({
    href: 'servicebindings',
    name: '서비스 바인딩',
    component,
  }),
  clusterOperators: component => ({
    href: 'clusteroperators',
    name: '클러스터 오퍼레이터',
    component,
  }),
  machineConfigs: component => ({
    href: 'machineconfigs',
    name: '머신 컨피그',
    component,
  }),
  machines: component => ({
    href: 'machines',
    name: '머신',
    component,
  }),
  workloads: component => ({
    href: 'workloads',
    name: '워크로드',
    component,
  }),
  history: component => ({
    href: 'history',
    name: '히스토리',
    component,
  }),
  signerKey: component => ({
    href: 'signerkeys',
    name: 'COMMON:MSG_DETAILS_TABSIGNERKEY_1',
    component,
  }),
  repositoryTab: component => ({
    href: 'repository',
    name: 'COMMON:MSG_DETAILS_TABREPOSITORIES_1',
    component: component,
  }),
  notaryTab: component => ({
    href: 'notary',
    name: 'COMMON:MSG_DETAILS_TABNOTARY_1',
    component: component,
  }),
};

export const NavBar = withRouter<NavBarProps>(({ pages, baseURL, basePath }) => {
  basePath = basePath.replace(/\/$/, '');

  const { t } = useTranslation();
  const tabs = (
    <>
      {pages.map(({ name, href, path }) => {
        const matchURL = matchPath(location.pathname, {
          path: `${basePath}/${path || href}`,
          exact: true,
        });
        const klass = classNames('co-m-horizontal-nav__menu-item', {
          'co-m-horizontal-nav-item--active': matchURL?.isExact,
        });
        return (
          <li className={klass} key={name}>
            <Link to={`${baseURL.replace(/\/$/, '')}/${href}`} data-test-id={`horizontal-link-${name}`}>
              {t(name)}
            </Link>
          </li>
        );
      })}
    </>
  );

  return <ul className="co-m-horizontal-nav__menu">{tabs}</ul>;
});
NavBar.displayName = 'NavBar';

const HorizontalNav_ = React.memo((props: HorizontalNavProps) => {
  const renderContent = (routes: JSX.Element[]) => {
    const { noStatusBox, obj, EmptyMsg, label } = props;
    const content = <Switch> {routes} </Switch>;

    const skeletonDetails = (
      <div className="skeleton-detail-view">
        <div className="skeleton-detail-view--head" />
        <div className="skeleton-detail-view--grid">
          <div className="skeleton-detail-view--column">
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-plain" />
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-resource" />
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-labels" />
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-resource" />
          </div>
          <div className="skeleton-detail-view--column">
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-plain" />
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-plain" />
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-resource" />
            <div className="skeleton-detail-view--tile skeleton-detail-view--tile-plain" />
          </div>
        </div>
      </div>
    );

    if (noStatusBox) {
      return content;
    }

    return (
      <StatusBox skeleton={skeletonDetails} {...obj} EmptyMsg={EmptyMsg} label={label}>
        {content}
      </StatusBox>
    );
  };

  React.useEffect(() => {
    // let kind = pluralToKind(props.match.params.plural);
    // kind = 'AWSCluster';
    // if (kind) {
    let model = props.model;
    if (model) {
      let kind = model.kind;
      const isCustomResourceType = !isResourceSchemaBasedMenu(kind);
      const isStructuralSchemaType = !(isResourceSchemaBasedMenu(kind) || isCreateManual(kind));
      let url;
      if (isStructuralSchemaType) {
        // structural schema로 해야하는 거
        url = getK8sAPIPath({ apiGroup: CustomResourceDefinitionModel.apiGroup, apiVersion: CustomResourceDefinitionModel.apiVersion });
        url = `${document.location.origin}${url}/customresourcedefinitions/${model.plural}.${model.apiGroup}`;
      } else if (!isCreateManual(kind)) {
        // github에 저장해둔거로 해야하는 거
        const directory = resourceSchemaBasedMenuMap.get(model.kind)?.['directory'];
        const file = resourceSchemaBasedMenuMap.get(model.kind)?.['file'];
        url = `${document.location.origin}/api/resource/${directory}/${file}`;
      } else {
        // 직접 만든거
        return;
      }
      const xhrTest = new XMLHttpRequest();
      xhrTest.open('GET', url);
      xhrTest.setRequestHeader('Authorization', `Bearer ${getIdToken()}`);
      xhrTest.onreadystatechange = function() {
        if (xhrTest.readyState == XMLHttpRequest.DONE && xhrTest.status == 200) {
          let template = xhrTest.response;
          template = JSON.parse(template);
          template = isCustomResourceType ? template?.spec?.validation?.openAPIV3Schema : template;
          props.setActiveSchema(template);
        }
      };
      xhrTest.send();
    }
  }, []);

  const componentProps = {
    ..._.pick(props, ['filters', 'selected', 'match', 'loaded']),
    obj: _.get(props.obj, 'data'),
  };
  const extraResources = _.reduce(props.resourceKeys, (extraObjs, key) => ({ ...extraObjs, [key]: _.get(props[key], 'data') }), {});

  const objReference = props.obj?.data ? referenceFor(props.obj.data) : '';
  const navTabExtensions = useExtensions<HorizontalNavTab>(isHorizontalNavTab);

  const pluginPages = React.useMemo(
    () =>
      navTabExtensions
        .filter(tab => referenceForModel(tab.properties.model) === objReference)
        .map(tab => ({
          ...tab.properties.page,
          component: (params: PageComponentProps) => <AsyncComponent {...params} loader={tab.properties.loader} />,
        })),
    [navTabExtensions, objReference],
  );

  const pages = (props.pages || props.pagesFor(props.obj?.data)).concat(pluginPages);

  const routes = pages.map(p => {
    const path = `${props.match.path}/${p.path || p.href}`;
    const render = params => {
      return <p.component {...componentProps} {...extraResources} {...p.pageData} params={params} customData={props.customData} />;
    };
    return <Route path={path} exact key={p.name} render={render} />;
  });

  props.setCustomState && props.customStatePath && props.setCustomState(_.get(props.obj.data, props.customStatePath));

  return (
    <div className={classNames('co-m-page__body', props.className)}>
      <div className="co-m-horizontal-nav">{!props.hideNav && <NavBar pages={pages} baseURL={props.match.url} basePath={props.match.path} />}</div>
      {renderContent(routes)}
    </div>
  );
}, _.isEqual);

const stateToProps = (state: RootState, props: Omit<DefaultPageProps, 'model'>) => {
  let plural = props.match.params.plural;
  let kind = pluralToKind(props.match.params.plural);
  let model = kind && modelFor(kind);
  if (!plural) {
    return null;
  }
  // crd중에 hypercloud에서 사용안하는 경우에는 redux에서 관리하는 plural과 kind 값으로 model 참조해야함.
  if (kind && model) {
    plural = referenceForModel(model);
  } else {
    kind = plural.split('~')[2];
  }
  return { model: state.k8s.getIn(['RESOURCES', 'models', plural]) || (state.k8s.getIn(['RESOURCES', 'models', kind]) as K8sKind) };
};

export const HorizontalNav = connect(stateToProps, {
  setActiveSchema: UIActions.setActiveSchema,
})(HorizontalNav_);

export type PodsComponentProps = {
  obj: K8sResourceKind;
  customData?: any;
};
export type DefaultPageProps = {
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
};

export type NodesComponentProps = {
  obj: K8sResourceKind;
  customData?: any;
};

export type NavBarProps = {
  pages: Page[];
  baseURL: string;
  basePath: string;
  history: History;
  location: Location<any>;
  match: match<any>;
};

export type HorizontalNavProps = {
  className?: string;
  obj?: { loaded: boolean; data: K8sResourceKind };
  label?: string;
  pages: Page[];
  pagesFor?: (obj: K8sResourceKind) => Page[];
  match: any;
  resourceKeys?: string[];
  hideNav?: boolean;
  EmptyMsg?: React.ComponentType<any>;
  noStatusBox?: boolean;
  customData?: any;
  setActiveSchema?: any;
  model?: K8sKind;
  setCustomState?: any;
  customStatePath?: string;
};

export type PageComponentProps<R extends K8sResourceCommon = K8sResourceKind> = {
  filters?: any;
  selected?: any;
  match?: any;
  obj?: R;
  params?: any;
  customData?: any;
  showTitle?: boolean;
  fieldSelector?: string;
};

HorizontalNav.displayName = 'HorizontalNav';

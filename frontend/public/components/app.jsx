import * as _ from 'lodash-es';
import React from 'react';
import { render } from 'react-dom';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import * as PropTypes from 'prop-types';

import store from '../redux';
import { productName } from '../branding';
import { AuditPage } from './audits';
import { ALL_NAMESPACES_KEY } from '../const';
import { connectToFlags, featureActions, flagPending, FLAGS } from '../features';
import { detectMonitoringURLs } from '../monitoring';
import { analyticsSvc } from '../module/analytics';
import { GlobalNotifications } from './global-notifications';
import { Masthead } from './masthead';
import { NamespaceSelector } from './namespace';
import CustomNav from './customNav';
import { ResourceDetailsPage, ResourceListPage } from './resource-list';
import { history, AsyncComponent, Loading } from './utils';
import { namespacedPrefixes } from './utils/link';
import { UIActions, getActiveNamespace } from '../ui/ui-actions';
import k8sActions from '../module/k8s/k8s-actions';
import '../vendor.scss';
import '../style.scss';
import { useTranslation } from 'react-i18next';
import { getAccessToken, resetLoginState, setAccessToken, setId } from './utils/auth';
import { NoNamespace } from './nonamespaces';
import Keycloak from 'keycloak-js';
import keycloakJSON from '../keycloak.json';

import './utils/i18n';

// Edge lacks URLSearchParams
import 'url-search-params-polyfill';

// React Router's proptypes are incorrect. See https://github.com/ReactTraining/react-router/pull/5393
Route.propTypes.path = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]);

const RedirectComponent = props => {
  const to = `/k8s${props.location.pathname}`;

  return <Redirect to={to} />;
};

// Ensure a *const* function wrapper for each namespaced Component so that react router doesn't recreate them
const Memoized = new Map();
function NamespaceFromURL(Component) {
  let C = Memoized.get(Component);
  if (!C) {
    C = function NamespaceInjector(props) {
      return <Component namespace={props.match.params.ns} {...props} />;
    };
    Memoized.set(Component, C);
  }
  return C;
}

const namespacedRoutes = [];

const NamespaceRedirect = connectToFlags(FLAGS.CAN_LIST_NS)(({ flags }) => {
  let to;
  if (flagPending(flags[FLAGS.CAN_LIST_NS])) {
    // CAN_LIST_NS 로딩 될때까지 기다리기
    return null;
  }
  let activeNamespace = getActiveNamespace();
  if (flags[FLAGS.CAN_LIST_NS]) {
    // admin
    activeNamespace = ALL_NAMESPACES_KEY;
  } else if (activeNamespace === ALL_NAMESPACES_KEY) {
    //user이면서 allnamespace 가 activenamespace인 경우
    return null;
  }

  if (activeNamespace === ALL_NAMESPACES_KEY) {
    to = '/status/all-namespaces';
  } else if (activeNamespace) {
    to = `/status/ns/${activeNamespace}`;
  }
  // TODO: check if namespace exists
  return <Redirect to={to} />;
});

const ActiveNamespaceRedirect = ({ location }) => {
  const activeNamespace = getActiveNamespace();
  let to;
  if (activeNamespace === ALL_NAMESPACES_KEY) {
    to = `${location.pathname}/all-namespaces`;
  } else if (activeNamespace) {
    to = `${location.pathname}/ns/${activeNamespace}`;
  }
  to += location.search;
  return <Redirect to={to} />;
};

// The default page component lets us connect to flags without connecting the entire App.
const DefaultPage = connectToFlags(FLAGS.OPENSHIFT)(({ flags }) => {
  const openshiftFlag = flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return <Loading />;
  }

  if (openshiftFlag) {
    return <Redirect to="/k8s/cluster/projects" />;
  }

  return <NamespaceRedirect />;
});

const LazyRoute = props => {
  const { t } = useTranslation();
  return <Route {...props} component={componentProps => <AsyncComponent loader={props.loader} t={t} kind={props.kind} {...componentProps} />} />;
};
function searchParam(key) {
  return new URLSearchParams(location.search).get(key);
}

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    // HDC 모델
    if (window.SERVER_FLAGS.HDCModeFlag && !getAccessToken()) {
      // tmaxcloud portal 에서 로그인 안하고 넘어온 상태
      window.location.href = window.SERVER_FLAGS.TmaxCloudPortalURL + '/#!/sign-in?redirect=console';
      return;
    }

    if (window.location.search === '?first') {
      window.location.href = window.location.href.split('?')[0];
      localStorage.removeItem('bridge/last-namespace-name');
    }

    this.state = {
      isAdmin: true,
      isLoading: false,
    };

    // 임시 로직
    if (window.localStorage.getItem('accessToken') || window.localStorage.getItem('refreshToken') || window.localStorage.getItem('logouted') || window.localStorage.getItem('role')) {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('logouted');
      window.localStorage.removeItem('role');
    }

    // this.changeRole = () => this.changeRole_();
    this.setLoading = () => this.setLoading_();

    window.addEventListener(
      'storage',
      function(evt) {
        if (evt.key === 'forceLogout' && !document.hasFocus()) {
          resetLoginState();
        }
      },
      false,
    );
  }

  setLoading_() {
    this.setState({
      isLoading: !this.state.isLoading,
    });
  }

  componentDidUpdate(prevProps) {
    const props = this.props;
    // Prevent infinite loop in case React Router decides to destroy & recreate the component (changing key)
    const oldLocation = _.omit(prevProps.location, ['key']);
    const newLocation = _.omit(props.location, ['key']);
    if (_.isEqual(newLocation, oldLocation) && _.isEqual(props.match, prevProps.match)) {
      return;
    }
    // two way data binding :-/
    const { pathname } = props.location;
    store.dispatch(UIActions.setCurrentLocation(pathname));
    analyticsSvc.route(pathname);
  }

  render() {
    // if (props.location.pathname.indexOf('new') > 0) {
    //   console.log('여기서 ns selector없애야함 ')
    // }
    return (
      <React.Fragment>
        <Helmet titleTemplate={`%s · ${productName}`} defaultTitle={productName} />
        <Masthead setLoading={this.setLoading} keycloak={keycloak} />
        <CustomNav />
        <div id="content">
          <Route path={namespacedRoutes} component={NamespaceSelector} />
          <GlobalNotifications />
          {this.state.isLoading && <Loading className="loading-box" />}
          <Switch>
            <Route path={['/all-namespaces', '/ns/:ns']} component={RedirectComponent} />
            <LazyRoute
              path="/status/all-namespaces"
              exact
              loader={() =>
                import('./cluster-overview' /* webpackChunkName: "cluster-overview" */).then(m => {
                  return m.ClusterOverviewPage;
                })
              }
            />
            <LazyRoute
              path="/status/ns/:ns"
              exact
              loader={() =>
                import('./cluster-overview' /* webpackChunkName: "cluster-overview" */).then(m => {
                  if (!localStorage.getItem('bridge/last-namespace-name')) {
                    return;
                  } else {
                    return m.ClusterOverviewPage;
                  }
                })
              }
            />
            <Route path="/status" exact component={NamespaceRedirect} />
            {/* <Route path="/noNamespace" exact loader={() => import('./nonamespaces').then(m => m.NoNamespace)} /> */}
            <Route path="/noNamespace" exact component={NoNamespace} />
            {/* <Route path="/grafana" exact component={Grafana} /> */}
            <LazyRoute path="/cluster-health" exact loader={() => import('./cluster-health' /* webpackChunkName: "cluster-health" */).then(m => m.ClusterHealth)} />
            {/* <LazyRoute path="/start-guide" exact loader={() => import('./start-guide' ).then(m => m.StartGuidePage)} /> */}
            {/* <LazyRoute path={`/k8s/ns/:ns/${SubscriptionModel.plural}/new`} exact loader={() => import('./cloud-services').then(m => NamespaceFromURL(m.CreateSubscriptionYAML))} /> */}
            {/* <Route path="/k8s/ns/:ns/alertmanagers/:name" exact render={({ match }) => <Redirect to={`/k8s/ns/${match.params.ns}/${referenceForModel(AlertmanagerModel)}/${match.params.name}`} />} /> */}
            {/* <LazyRoute path={`/k8s/ns/:ns/${ClusterServiceVersionModel.plural}/:appName/:plural/new`} exact loader={() => import('./cloud-services/create-crd-yaml').then(m => m.CreateCRDYAML)} /> */}
            {/* <Route path={`/k8s/ns/:ns/${ClusterServiceVersionModel.plural}/:appName/:plural/:name`} component={ResourceDetailsPage} /> */}
            <LazyRoute path="/k8s/all-namespaces/events" exact loader={() => import('./events').then(m => NamespaceFromURL(m.EventStreamPage))} />
            <LazyRoute path="/k8s/ns/:ns/events" exact loader={() => import('./events').then(m => NamespaceFromURL(m.EventStreamPage))} />
            {/* search페이지 i18n적용을 위해 LazyRoute으로 변경  */}
            {/* <Route path="/search/all-namespaces" exact component={NamespaceFromURL(SearchPage)} /> */}
            {/* <Route path="/search/ns/:ns" exact component={NamespaceFromURL(SearchPage)} /> */}
            <Route path="/search" exact component={ActiveNamespaceRedirect} />
            <LazyRoute path="/search/all-namespaces" exact loader={() => import('./search').then(m => NamespaceFromURL(m.SearchPage))} />
            <LazyRoute path="/search/ns/:ns" exact loader={() => import('./search').then(m => NamespaceFromURL(m.SearchPage))} />

            <Route path="/grafana" exact component={ActiveNamespaceRedirect} />
            <LazyRoute path="/grafana/all-namespaces" exact loader={() => import('./grafana').then(m => NamespaceFromURL(m.GrafanaPage))} />
            <LazyRoute path="/grafana/ns/:ns" exact loader={() => import('./grafana').then(m => NamespaceFromURL(m.GrafanaPage))} />

            <Route path="/kiali" exact component={ActiveNamespaceRedirect} />
            <LazyRoute path="/kiali/all-namespaces" exact loader={() => import('./kiali').then(m => NamespaceFromURL(m.KialiPage))} />
            <LazyRoute path="/kiali/ns/:ns" exact loader={() => import('./kiali').then(m => NamespaceFromURL(m.KialiPage))} />

            <Route path="/k8s/ns/:ns/customresourcedefinitions/:plural" exact component={ResourceListPage} />
            <Route path="/k8s/ns/:ns/customresourcedefinitions/:plural/:name" component={ResourceDetailsPage} />
            <Route path="/k8s/all-namespaces/customresourcedefinitions/:plural" exact component={ResourceListPage} />
            <Route path="/k8s/all-namespaces/customresourcedefinitions/:plural/:name" component={ResourceDetailsPage} />
            {
              // These pages are temporarily disabled. We need to update the safe resources list.
              // <LazyRoute path="/k8s/cluster/clusterroles/:name/add-rule" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.EditRulePage)} />
              // <LazyRoute path="/k8s/cluster/clusterroles/:name/:rule/edit" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.EditRulePage)} />
            }
            <Route path="/k8s/cluster/clusterroles/:name" component={props => <ResourceDetailsPage {...props} plural="clusterroles" />} />
            {/* clusteroles/new를 detail페이지로 인식해서 순서 이동 */}
            {
              // <LazyRoute path="/k8s/ns/:ns/roles/:name/add-rule" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.EditRulePage)} />
              // <LazyRoute path="/k8s/ns/:ns/roles/:name/:rule/edit" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.EditRulePage)} />
            }
            <LazyRoute path="/k8s/cluster/tasks/new/:type" exact kind="Task" loader={() => import('./tasks/create-task').then(m => m.CreateTask)} />
            <LazyRoute path="/k8s/cluster/jobs/new/:type" exact kind="Job" loader={() => import('./jobs/create-job').then(m => m.CreateJob)} />
            <LazyRoute path="/k8s/cluster/daemonsets/new/:type" exact kind="Daemonset" loader={() => import('./daemonsets/create-daemonset').then(m => m.CreateDaemonSet)} />
            <LazyRoute path="/k8s/cluster/statefulsets/new/:type" exact kind="StatefulSet" loader={() => import('./statefulsets/create-statefulset').then(m => m.CreateStatefulSet)} />
            <LazyRoute path="/k8s/cluster/roles/new/:type" exact kind="role" loader={() => import('./roles/create-role').then(m => m.CreateRole)} />
            <LazyRoute path="/k8s/cluster/configmaps/new/:type" exact kind="ConfigMap" loader={() => import('./configmaps/create-configmap').then(m => m.CreateConfigMap)} />
            <LazyRoute path="/k8s/cluster/usergroups/new/:type" exact kind="Usergroup" loader={() => import('./usergroups/create-usergroup').then(m => m.CreateUserGroup)} />
            <LazyRoute path="/k8s/cluster/users/new/:type" exact kind="User" loader={() => import('./users/create-user').then(m => m.CreateUser)} />
            <LazyRoute path="/k8s/cluster/serviceaccounts/new/:type" exact kind="ServiceAccount" loader={() => import('./serviceAccounts/create-serviceAccount').then(m => m.CreateServiceAccount)} />
            <LazyRoute path="/k8s/cluster/resourcequotas/new/:type" exact kind="ResourceQuota" loader={() => import('./resourceQuota/create-resourceQuota').then(m => m.CreateResourceQuota)} />
            <LazyRoute path="/k8s/cluster/limitranges/new/:type" exact kind="LimitRange" loader={() => import('./limitRanges/create-limitRange').then(m => m.CreateLimitRange)} />
            <LazyRoute path="/k8s/cluster/namespaces/new/:type" exact kind="Namespace" loader={() => import('./namespaces/create-namespace').then(m => m.CreateNamespace)} />
            <LazyRoute path="/k8s/cluster/registries/new/:type" exact kind="Registry" loader={() => import('./registries/create-registry').then(m => m.CreateRegistry)} />
            <LazyRoute path="/k8s/cluster/resourcequotaclaims/new/:type" exact kind="ResourceQuotaClaim" loader={() => import('./resourceQuotaClaims/create-resourceQuotaClaim').then(m => m.CreateResouceQuotaClaim)} />
            <LazyRoute path="/k8s/ns/:ns/rolebindingclaims/new/:type" exact kind="RoleBindingClaim" loader={() => import('./roleBindingClaims/create-roleBindingClaim').then(m => m.CreateRoleBindingClaim)} />
            <LazyRoute path="/k8s/cluster/namespaceclaims/new/:type" exact kind="NamespaceClaim" loader={() => import('./namespaceClaims/create-namespaceClaim').then(m => m.CreateNamespaceClaim)} />

            <LazyRoute path="/k8s/ns/:ns/deployments/new/:type" exact kind="Deployment" loader={() => import('./deployments/create-deployment').then(m => m.CreateDeployment)} />
            <LazyRoute path="/k8s/ns/:ns/ingresses/new/:type" exact kind="Ingress" loader={() => import('./ingresses/create-ingress').then(m => m.CreateIngress)} />
            {/* <LazyRoute path="/k8s/ns/:ns/taskruns/new/:type" exact kind="TaskRun" loader={() => import('./taskruns/create-taskrun').then(m => m.CreateTaskRun)} /> */}
            <LazyRoute path="/k8s/cluster/taskruns/new/:type" exact kind="TaskRun" loader={() => import('./taskruns/create-taskrun').then(m => m.CreateTaskRun)} />
            <LazyRoute path="/k8s/ns/:ns/pipelines/new/:type" exact kind="Pipeline" loader={() => import('../../packages/dev-console/src/components/pipelines/pipeline-builder/PipelineBuilderPage').then(m => m.PipelineBuilderPage)} />
            <LazyRoute path="/k8s/ns/:ns/pipelineruns/new/:type" exact kind="PipelineRun" loader={() => import('./pipelineRuns/create-pipelineRun').then(m => m.CreatePipelineRun)} />
            <LazyRoute path="/k8s/ns/:ns/pipelineresources/new/:type" exact kind="PipelineResource" loader={() => import('./pipelineResources/create-pipelineResource').then(m => m.CreatePipelineResources)} />
            <LazyRoute path="/k8s/ns/:ns/services/new/:type" exact kind="Service" loader={() => import('./services/create-service').then(m => m.CreateService)} />
            <LazyRoute path="/k8s/ns/:ns/serviceinstances/new/:type" exact kind="ServiceInstance" loader={() => import('./service-instances/create-service-instance').then(m => m.CreateServiceInstance)} />
            <LazyRoute path="/k8s/cluster/serviceinstances/new/:type" exact kind="ServiceInstance" loader={() => import('./service-instances/create-service-instance').then(m => m.CreateServiceInstance)} />
            <LazyRoute path="/k8s/ns/:ns/templateinstances/new/:type" exact kind="TemplateInstance" loader={() => import('./templateInstances/create-templateInstance').then(m => m.CreateTemplateInstance)} />
            <LazyRoute path="/k8s/ns/:ns/secrets/new/:type" exact kind="Secret" loader={() => import('./secrets/create-secret' /* webpackChunkName: "create-secret" */).then(m => m.CreateSecret)} />
            <LazyRoute path="/k8s/ns/:ns/secrets/:name/edit" exact kind="Secret" loader={() => import('./secrets/create-secret' /* webpackChunkName: "create-secret" */).then(m => m.EditSecret)} />
            <LazyRoute path="/k8s/ns/:ns/secrets/:name/edit-yaml" exact kind="Secret" loader={() => import('./create-yaml').then(m => m.EditYAMLPage)} />
            <LazyRoute path="/k8s/cluster/rolebindings/new" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.CreateRoleBinding)} kind="RoleBinding" />
            <LazyRoute path="/k8s/ns/:ns/rolebindings/new" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.CreateRoleBinding)} kind="RoleBinding" />
            <LazyRoute path="/k8s/cluster/clusterrolebindings/new" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.CreateClusterRoleBinding)} kind="ClusterRoleBinding" />
            <LazyRoute path="/k8s/ns/:ns/clusterrolebindings/new" exact loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.CreateClusterRoleBinding)} kind="ClusterRoleBinding" />
            <LazyRoute path="/k8s/ns/:ns/rolebindings/:name/copy" exact kind="RoleBinding" loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.CopyRoleBinding)} />
            <LazyRoute path="/k8s/ns/:ns/rolebindings/:name/edit" exact kind="RoleBinding" loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.EditRoleBinding)} />
            <LazyRoute path="/k8s/cluster/clusterrolebindings/:name/copy" exact kind="ClusterRoleBinding" loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.CopyRoleBinding)} />
            <LazyRoute path="/k8s/cluster/clusterrolebindings/:name/edit" exact kind="ClusterRoleBinding" loader={() => import('./RBAC' /* webpackChunkName: "rbac" */).then(m => m.EditRoleBinding)} />
            {/* <Route path="/login" exact component={LoginComponent} /> */}
            <Route path="/k8s/cluster/:plural" exact component={ResourceListPage} />
            <LazyRoute path="/k8s/cluster/:plural/new" exact loader={() => import('./create-yaml' /* webpackChunkName: "create-yaml" */).then(m => m.CreateYAML)} />
            <Route path="/k8s/cluster/:plural/:name" component={ResourceDetailsPage} />
            <LazyRoute path="/k8s/ns/:ns/pods/:podName/containers/:name" loader={() => import('./container').then(m => m.ContainersDetailsPage)} />
            <LazyRoute path="/k8s/ns/:ns/:plural/new" exact loader={() => import('./create-yaml' /* webpackChunkName: "create-yaml" */).then(m => NamespaceFromURL(m.CreateYAML))} />
            <Route path="/k8s/ns/:ns/audits" exact component={AuditPage} />
            <Route path="/k8s/all-namespaces/audits" exact component={AuditPage} />
            <Route path="/k8s/ns/:ns/:plural/:name" component={ResourceDetailsPage} />
            <Route path="/k8s/ns/:ns/:plural" exact component={ResourceListPage} />
            <Route path="/k8s/all-namespaces/:plural" exact component={ResourceListPage} />
            <Route path="/k8s/all-namespaces/:plural/:name" component={ResourceDetailsPage} />
            <LazyRoute path="/settings/profile" exact loader={() => import('./profile').then(m => m.ProfilePage)} />
            <LazyRoute path="/settings/ldap" exact loader={() => import('./cluster-settings/ldap').then(m => m.LDAPPage)} />
            <LazyRoute path="/settings/cluster" exact loader={() => import('./cluster-settings/cluster-settings').then(m => m.ClusterSettingsPage)} />
            <LazyRoute path="/error" exact loader={() => import('./error').then(m => m.ErrorPage)} />
            <Route path="/" exact component={DefaultPage} />
            <LazyRoute loader={() => import('./error').then(m => m.ErrorPage404)} />
          </Switch>
        </div>
      </React.Fragment>
    );
  }
}

// Used by GUI tests to check for unhandled exceptions
window.windowError = false;

window.onerror = function(message, source, lineno, colno, optError = {}) {
  try {
    const e = `${message} ${source} ${lineno} ${colno}`;
    analyticsSvc.error(e, null, optError.stack);
  } catch (err) {
    try {
      // eslint-disable-next-line no-console
      console.error(err);
    } catch (ignored) {
      // ignore
    }
  }
  window.windowError = true;
};

window.onunhandledrejection = function(e) {
  try {
    analyticsSvc.error(e, null);
  } catch (err) {
    try {
      // eslint-disable-next-line no-console
      console.error(err);
    } catch (ignored) {
      // ignore
    }
  }
  window.windowError = true;
};

if ('serviceWorker' in navigator) {
  if (window.SERVER_FLAGS.loadTestFactor && window.SERVER_FLAGS.loadTestFactor > 1) {
    import('file-loader?name=load-test.sw.js!../load-test.sw.js')
      .then(() => navigator.serviceWorker.register('/load-test.sw.js'))
      .then(() => new Promise(r => (navigator.serviceWorker.controller ? r() : navigator.serviceWorker.addEventListener('controllerchange', () => r()))))
      .then(() => navigator.serviceWorker.controller.postMessage({ topic: 'setFactor', value: window.SERVER_FLAGS.loadTestFactor }));
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then(registrations => registrations.forEach(reg => reg.unregister()))
      // eslint-disable-next-line no-console
      .catch(e => console.warn('Error unregistering service workers', e));
  }
}

//keycloak init options
const keycloak = new Keycloak({
  realm: window.SERVER_FLAGS.KeycloakRealm,
  url: window.SERVER_FLAGS.KeycloakAuthURL,
  clientId: window.SERVER_FLAGS.KeycloakClientId,
});

keycloak.logout = keycloak.logout.bind(keycloak, { redirectUri: document.location.origin + '?first' });

keycloak
  .init()
  .then(auth => {
    if (!auth) {
      keycloak.login();
      return;
    }

    setAccessToken(keycloak.idToken);
    setId(keycloak.idTokenParsed.preferred_username);

    _.each(namespacedPrefixes, p => {
      namespacedRoutes.push(`${p}/ns/:ns`);
      namespacedRoutes.push(`${p}/all-namespaces`);
    });

    _.each(featureActions, store.dispatch);
    store.dispatch(k8sActions.getResources());
    store.dispatch(detectMonitoringURLs);

    analyticsSvc.push({ tier: 'tectonic' });

    render(
      <Provider store={store}>
        <Router history={history} basename={window.SERVER_FLAGS.basePath}>
          <Route path="/" component={App} />
        </Router>
      </Provider>,
      document.getElementById('app'),
    );
  })
  .catch(function() {
    render(<div>Failed to initialize Keycloak</div>, document.getElementById('app'));
  });

keycloak.onReady = function() {
  console.log('[keycloak] onReady');
};
keycloak.onAuthSuccess = function() {
  console.log('[keycloak] onAuthSuccess');
};
keycloak.onAuthError = function() {
  console.log('[keycloak] onAuthError');
};
keycloak.onAuthRefreshSuccess = function() {
  console.log('[keycloak] onAuthRefreshSuccess');
};
keycloak.onAuthRefreshError = function() {
  console.log('[keycloak] onAuthRefreshError');
};
keycloak.onAuthLogout = function() {
  console.log('[keycloak] onAuthLogout');
  keycloak.logout();
};
keycloak.onTokenExpired = function() {
  console.log('[keycloak] onTokenExpired ');
  keycloak.logout();
};

console.log('keycloak', keycloak);

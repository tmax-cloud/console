import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as classNames from 'classnames';
import * as _ from 'lodash-es';
import * as PropTypes from 'prop-types';

import { FLAGS, connectToFlags, featureReducerName, flagPending } from '../features';
import { MonitoringRoutes, connectToURLs } from '../monitoring';
import { formatNamespacedRouteForResource } from '../ui/ui-actions';
import { BuildConfigModel, BuildModel, ClusterServiceVersionModel, DeploymentConfigModel, ImageStreamModel, SubscriptionModel, InstallPlanModel, CatalogSourceModel } from '../models';
import { referenceForModel } from '../module/k8s';
import { authSvc } from '../module/auth';

import { ClusterPicker } from './cluster-picker';

import * as operatorImg from '../imgs/operator.svg';
import * as operatorActiveImg from '../imgs/operator-active.svg';
import * as routingImg from '../imgs/routing.svg';
import * as routingActiveImg from '../imgs/routing-active.svg';
import { history, stripBasePath } from './utils';

export const matchesPath = (resourcePath, prefix) => resourcePath === prefix || _.startsWith(resourcePath, `${prefix}/`);
export const matchesModel = (resourcePath, model) => model && matchesPath(resourcePath, referenceForModel(model));

const stripNS = href => {
  href = stripBasePath(href);
  return href.replace(/^\/?k8s\//, '').replace(/^\/?(cluster|all-namespaces|ns\/[^/]*)/, '').replace(/^\//, '');
};

class NavLink extends React.PureComponent {
  static isActive() {
    throw new Error('not implemented');
  }

  get to() {
    throw new Error('not implemented');
  }

  static startsWith(resourcePath, someStrings) {
    return _.some(someStrings, s => resourcePath.startsWith(s));
  }

  render() {
    const { isActive, isExternal, id, name, target, onClick } = this.props;

    return <li className={classNames('co-m-nav-link', { active: isActive, 'co-m-nav-link__external': isExternal })}>
      <Link id={id} to={this.to} target={target} onClick={onClick} className={classNames({'co-external-link': isExternal})}>{name}</Link>
    </li>;
  }
}

NavLink.defaultProps = {
  required: '',
  disallowed: ''
};

NavLink.propTypes = {
  required: PropTypes.string,
  disallowed: PropTypes.string
};


class ResourceNSLink extends NavLink {
  static isActive (props, resourcePath, activeNamespace) {
    const href = stripNS(formatNamespacedRouteForResource(props.resource, activeNamespace));
    return matchesPath(resourcePath, href) || matchesModel(resourcePath, props.model);
  }

  get to () {
    const { resource, activeNamespace } = this.props;
    return formatNamespacedRouteForResource(resource, activeNamespace);
  }
}

ResourceNSLink.propTypes = {
  name: PropTypes.string.isRequired,
  startsWith: PropTypes.arrayOf(PropTypes.string),
  resource: PropTypes.string.isRequired,
  model: PropTypes.object,
  activeNamespace: PropTypes.string,
};

class ResourceClusterLink extends NavLink {
  static isActive (props, resourcePath) {
    return resourcePath === props.resource || _.startsWith(resourcePath, `${props.resource}/`);
  }

  get to () {
    return `/k8s/cluster/${this.props.resource}`;
  }
}

ResourceClusterLink.propTypes = {
  name: PropTypes.string.isRequired,
  startsWith: PropTypes.arrayOf(PropTypes.string),
  resource: PropTypes.string.isRequired,
};

class HrefLink extends NavLink {
  static isActive (props, resourcePath) {
    const noNSHref = stripNS(props.href);
    return resourcePath === noNSHref || _.startsWith(resourcePath, `${noNSHref}/`);
  }

  get to () {
    return this.props.href;
  }
}

HrefLink.propTypes = {
  name: PropTypes.string.isRequired,
  startsWith: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.string.isRequired,
};

const navSectionStateToProps = (state, {required}) => {
  const flags = state[featureReducerName];
  const canRender = required ? flags.get(required) : true;

  return {
    flags, canRender,
    activeNamespace: state.UI.get('activeNamespace'),
    location: state.UI.get('location'),
  };
};

const NavSection = connect(navSectionStateToProps)(
  class NavSection extends React.Component {
    constructor (props) {
      super(props);
      this.toggle = e => this.toggle_(e);
      this.open = () => this.open_();
      this.state = { isOpen: false, activeChild: null };

      const activeChild = this.getActiveChild();
      if (activeChild) {
        this.state.activeChild = activeChild;
        this.state.isOpen = true;
      }
    }

    shouldComponentUpdate (nextProps, nextState) {
      const { isOpen } = this.state;

      if (isOpen !== nextProps.isOpen) {
        return true;
      }

      if (!isOpen && !nextState.isOpen) {
        return false;
      }

      return nextProps.location !== this.props.location || nextProps.flags !== this.props.flags;
    }

    getActiveChild () {
      const { activeNamespace, location, children } = this.props;

      if (!children) {
        return stripBasePath(location).startsWith(this.props.activePath);
      }

      const resourcePath = location ? stripNS(location) : '';
      if (Array.isArray(children)) {
        return children.filter(c => {
          if (!c) {
            return false;
          }
          if (c.props.startsWith) {
            return c.type.startsWith(resourcePath, c.props.startsWith);
          }
          return c.type.isActive && c.type.isActive(c.props, resourcePath, activeNamespace);
        }).map(c => c.props.name)[0];
      } else if (children.props.startsWith) { // 하나만 있을 때 처리
        return children.type.startsWith(resourcePath, children.props.startsWith) ? children.props.name : null;
      }
      return children.type.isActive && children.type.isActive(children.props, resourcePath, activeNamespace) ? children.props.name : null;
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.location === this.props.location) {
        return;
      }

      const activeChild = this.getActiveChild();
      const state = {activeChild};
      if (activeChild && !prevState.activeChild) {
        state.isOpen = true;
      }
      this.setState(state);
    }

    open_ () {
      this.setState({isOpen: true});
    }

    toggle_(e) {
      const { href, onClick } = this.props;

      if (href) {
        e && e.stopPropagation();
        history.push(href);
      }

      if (onClick) {
        onClick();
      }

      this.setState({isOpen: !this.state.isOpen});
    }

    render () {
      if (!this.props.canRender) {
        return null;
      }

      const { id, icon, img, text, children, activeNamespace, flags, href = null, activeImg, klass } = this.props;
      const isActive = !!this.state.activeChild;
      // WARNING:
      // we transition on max-height because you can't transition to height 'inherit'
      // however, the transition animiation is calculated on the actual max-height, so it must be roughly equal to the actual height
      // we could use scaleY, but that literally scales along the Y axis, ie shrinks
      // we could use flexbox or the equivalent to get an actual height, but this is the easiest solution :-/

      const maxHeight = !this.state.isOpen ? 0 : 29 * _.get(this.props.children, 'length', 1);

      const iconClassName = icon && `${icon} navigation-container__section__title__icon ${isActive ? 'navigation-container__section__title__icon--active' : ''}`;
      const secionTitleClassName = `navigation-container__section__title ${isActive ? 'navigation-container__section__title--active' : ''}`;
      const sectionClassName = isActive && href ? 'navigation-container__section navigation-container__section--active' : 'navigation-container__section';

      const Children = React.Children.map(children, c => {
        if (!c) {
          return null;
        }
        const {name, required, disallowed} = c.props;
        if (required && (flagPending(flags.get(required)) || !flags.get(required))) {
          return null;
        }
        if (disallowed && (flagPending(flags.get(disallowed)) || flags.get(disallowed))) {
          return null;
        }
        return React.cloneElement(c, {key: name, isActive: name === this.state.activeChild, activeNamespace});
      });

      return <div className={classNames(sectionClassName, klass)}>
        <div id={id} className={secionTitleClassName} onClick={this.toggle}>
          {icon && <i className={iconClassName} aria-hidden="true"></i>}
          {img && <img src={isActive && activeImg ? activeImg : img} />}
          { !href
            ? text
            : <Link className="navigation-container__section__title__link" to={href} onClick={this.open}>{text}</Link>
          }
        </div>
        {Children && <ul className="navigation-container__list" style={{maxHeight}}>{Children}</ul>}
      </div>;
    }
  }
);

const Sep = () => <div className="navigation-container__section__separator" />;

// HrefLinks are PureComponents...
const searchStartsWith = ['search'];
const rolesStartsWith = ['roles', 'clusterroles'];
const rolebindingsStartsWith = ['rolebindings', 'clusterrolebindings'];
const imagestreamsStartsWith = ['imagestreams', 'imagestreamtags'];
const clusterSettingsStartsWith = ['settings/cluster', 'settings/ldap'];

const ClusterPickerNavSection = connectToFlags(FLAGS.OPENSHIFT)(({flags}) => {
  // Hide the cluster picker on OpenShift clusters. Make sure flag detection is
  // complete before showing the picker.


  const openshiftFlag = flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag) || openshiftFlag) {
    return null;
  }

  return <div className="navigation-container__section navigation-container__section--cluster-picker">
    <ClusterPicker />
  </div>;
});

const MonitoringNavSection_ = ({urls, closeMenu}) => {
  const prometheusURL = urls[MonitoringRoutes.Prometheus];
  const alertManagerURL = urls[MonitoringRoutes.AlertManager];
  const grafanaURL = urls[MonitoringRoutes.Grafana];
  return prometheusURL || alertManagerURL || grafanaURL
    ? <NavSection text="Monitoring" icon="pficon pficon-screen">
      {prometheusURL && <HrefLink href={prometheusURL} target="_blank" name="Metrics" onClick={closeMenu} isExternal={true} />}
      {alertManagerURL && <HrefLink href={alertManagerURL} target="_blank" name="Alerts" onClick={closeMenu} isExternal={true} />}
      {grafanaURL && <HrefLink href={grafanaURL} target="_blank" name="Dashboards" onClick={closeMenu} isExternal={true} />}
    </NavSection>
    : null;
};
const MonitoringNavSection = connectToURLs(MonitoringRoutes.Prometheus, MonitoringRoutes.AlertManager, MonitoringRoutes.Grafana)(MonitoringNavSection_);

const UserNavSection = connectToFlags(FLAGS.AUTH_ENABLED, FLAGS.OPENSHIFT)(({flags, closeMenu}) => {
  if (!flags[FLAGS.AUTH_ENABLED] || flagPending(flags[FLAGS.OPENSHIFT])) {
    return null;
  }

  const logout = e => {
    e && e.preventDefault();
    if (flags[FLAGS.OPENSHIFT]) {
      authSvc.deleteOpenShiftToken().then(() => authSvc.logout());
    } else {
      authSvc.logout();
    }
  };

  if (flags[FLAGS.OPENSHIFT]) {
    return <NavSection text="Logout" icon="pficon pficon-user" klass="visible-xs-block" onClick={logout} />;
  }

  return <NavSection text="User" icon="pficon pficon-user" klass="visible-xs-block">
    <HrefLink href="/settings/profile" name="My Account" onClick={closeMenu} key="myAccount" />
    <HrefLink href="#" name="Logout" onClick={logout} key="logout" />
  </NavSection>;
});

export class Nav extends React.Component {
  constructor (props) {
    super(props);
    this.scroller = React.createRef();
    this.preventScroll = e => this.preventScroll_(e);
    this.close = () => this.close_();
    this.toggle = () => this.toggle_();
    this.state = {
      isOpen: false,
    };
  }

  // Edge disobeys the spec and doesn't fire off wheel events: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7134034/
  // TODO maybe bind to touch events or something? (onpointermove)
  preventScroll_ (e) {
    const elem = this.scroller.current;

    const scrollTop = elem.scrollTop; // scroll position
    const scrollHeight = elem.scrollHeight; // height of entire area
    const height = elem.offsetHeight; // height of visible area
    const delta = e.deltaY; // how far we scrolled up/down

    const atBottom = delta > 0 && delta + scrollTop + height >= scrollHeight;
    const atTop = delta < 0 && scrollTop + delta <= 0;
    if (atTop || atBottom) {
      // Prevent scroll on body
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }

  close_ () {
    this.setState({isOpen: false});
  }

  toggle_ () {
    const { isOpen } = this.state;
    this.setState({isOpen: !isOpen});
  }

  render () {
    const { isOpen } = this.state;
    const { isAdmin } = this.props;


    return <React.Fragment>
      <button type="button" className="sidebar-toggle" aria-controls="sidebar" aria-expanded={isOpen} onClick={this.toggle}>
        <span className="sr-only">Toggle navigation</span>
        <span className="icon-bar" aria-hidden="true"></span>
        <span className="icon-bar" aria-hidden="true"></span>
        <span className="icon-bar" aria-hidden="true"></span>
      </button>
      <div id="sidebar" className={classNames({'open': isOpen})}>
        {/* <ClusterPickerNavSection /> */}
        <div ref={this.scroller} onWheel={this.preventScroll} className="navigation-container">
          <NavSection text="홈" icon="pficon pficon-home">
            <HrefLink href="/status" name="Status" activePath="/status/" onClick={this.close} />
            <HrefLink href="/search" name="Search" onClick={this.close} startsWith={searchStartsWith} />
            <ResourceNSLink resource="events" name="Events" onClick={this.close} />
          </NavSection>
          {/* Service Catalog 전체 추가 */}
          <NavSection text="Service Catalogs" icon="pficon pficon-catalog">
            <ResourceNSLink resource="clusterservicebrokers" name="Cluster Service Brokers" onClick={this.close} />
            <ResourceNSLink resource="clusterserviceclasses" name="Cluster Service Classes" onClick={this.close} />
            <ResourceNSLink resource="clusterserviceplans" name="Cluster Service Plans" onClick={this.close} />
            <ResourceNSLink resource="serviceinstances" name="Service Instances" onClick={this.close} />
            <ResourceNSLink resource="servicebindings" name="Service Bindings" onClick={this.close} />
            <ResourceNSLink resource="templates" name="Templates" onClick={this.close} />
            <ResourceNSLink resource="templateinstances" name="Template Instances" onClick={this.close} />
          </NavSection>

          {/* <NavSection required={FLAGS.OPERATOR_LIFECYCLE_MANAGER} text="Operators" img={operatorImg} activeImg={operatorActiveImg} >
            <ResourceNSLink model={ClusterServiceVersionModel} resource={ClusterServiceVersionModel.plural} name="Cluster Service Versions" onClick={this.close} />
            <Sep />
            <ResourceNSLink model={CatalogSourceModel} resource={CatalogSourceModel.plural} name="Catalog Sources" onClick={this.close} />
            <ResourceNSLink model={SubscriptionModel} resource={SubscriptionModel.plural} name="Subscriptions" onClick={this.close} />
            <ResourceNSLink model={InstallPlanModel} resource={InstallPlanModel.plural} name="Install Plans" onClick={this.close} />
          </NavSection> */}

          <NavSection text="Workloads" icon="fa fa-briefcase">
            <ResourceNSLink resource="pods" name="Pods" onClick={this.close} />
            <ResourceNSLink resource="daemonsets" name="Daemon Sets" onClick={this.close} />
            <ResourceNSLink resource="deployments" name="Deployments" onClick={this.close} />
            <ResourceNSLink resource="statefulsets" name="Stateful Sets" onClick={this.close} />
            {/* VM 추가 */}
            <ResourceNSLink resource="virtualmachineinstances" name="Virtual Machine Instances" onClick={this.close} /> 
            <ResourceNSLink resource="virtualmachines" name="Virtual Machines" onClick={this.close} />
            <ResourceNSLink resource="configmaps" name="Config Maps" onClick={this.close} />
            <ResourceNSLink resource="secrets" name="Secrets" onClick={this.close} />
            <ResourceNSLink resource="replicasets" name="Replica Sets" onClick={this.close} />
            <ResourceNSLink resource="replicationcontrollers" name="Replication Controllers" onClick={this.close} />
            <ResourceNSLink resource="horizontalpodautoscalers" name="HPAs" onClick={this.close} />
            <ResourceNSLink resource="jobs" name="Jobs" onClick={this.close} />
            <ResourceNSLink resource="cronjobs" name="Cron Jobs" onClick={this.close} />
            {/* <ResourceNSLink resource="deploymentconfigs" name={DeploymentConfigModel.labelPlural} onClick={this.close} required={FLAGS.OPENSHIFT} /> */}
            {/* <Sep /> */}
          </NavSection>

          <NavSection text="Networks" icon="pficon pficon-network">
            {/* istio, virtual service 추가 */}
            <ResourceNSLink resource="istiogateways" name="Istio Gateways" onClick={this.close} />
            <ResourceNSLink resource="virtualservices" name="Virtual Services" onClick={this.close} />
            <ResourceNSLink resource="ingresses" name="Ingresses" onClick={this.close} />
            <ResourceNSLink resource="services" name="Services" onClick={this.close} />
            {/* <ResourceNSLink resource="routes" name="Routes" onClick={this.close} required={FLAGS.OPENSHIFT} /> */}
            {/* <ResourceNSLink resource="networkpolicies" name="Network Policies" onClick={this.close} /> */}
          </NavSection>

          <NavSection text="Storages" icon="fa fa-database">
            { isAdmin && <ResourceClusterLink resource="storageclasses" name="Storage Classes" onClick={this.close} required={FLAGS.CAN_LIST_STORE} /> }
            {/* data volume 추가 */}
            <ResourceNSLink resource="datavolumes" name="Data Volumes" onClick={this.close} />
            <ResourceClusterLink resource="persistentvolumes" name="Persistent Volumes" onClick={this.close} required={FLAGS.CAN_LIST_PV} />
            <ResourceNSLink resource="persistentvolumeclaims" name="Persistent Volume Claims" onClick={this.close} />
          </NavSection>

          {/* <NavSection text="Builds" icon="pficon pficon-build">
            <ResourceNSLink resource="buildconfigs" name={BuildConfigModel.labelPlural} onClick={this.close} required={FLAGS.OPENSHIFT} />
            <ResourceNSLink resource="builds" name={BuildModel.labelPlural} onClick={this.close} required={FLAGS.OPENSHIFT} />
            <ResourceNSLink resource="imagestreams" name={ImageStreamModel.labelPlural} onClick={this.close} required={FLAGS.OPENSHIFT} startsWith={imagestreamsStartsWith} />
          </NavSection> */}

          <MonitoringNavSection closeMenu={this.close} />

          {/* CI/CD 전체 추가 */}
          <NavSection text="CI/CD" icon="pficon pficon-process-automation">
            <ResourceNSLink resource="tasks" name="Tasks" onClick={this.close} />
            <ResourceNSLink resource="taskruns" name="Task Runs" onClick={this.close} />
            <ResourceNSLink resource="pipelines" name="Pipelines" onClick={this.close} />
            <ResourceNSLink resource="pipelineruns" name="Pipeline Runs" onClick={this.close} />
            <ResourceNSLink resource="pipelineresources" name="Pipeline Resources" onClick={this.close} />
          </NavSection>

          <NavSection text="Securities" icon="fa fa-shield">
            { isAdmin && <ResourceNSLink resource="podsecuritypolicies" name="Pod Security Policies" onClick={this.close} /> }
            <ResourceNSLink resource="networkpolicies" name="Network Policies" onClick={this.close} />
          </NavSection>

          <NavSection text="Managements" icon="pficon pficon-services">
            <ResourceNSLink resource="metering" name="Metering" onClick={this.close} />
            <ResourceNSLink resource="imageregistries" name="Image Registries" onClick={this.close} />
            <ResourceNSLink resource="kubeevents" name="Events" onClick={this.close} />
            { !isAdmin && <ResourceNSLink resource="controllerrevisions" name="Controller Revisions" onClick={this.close} /> }
            { isAdmin && <ResourceClusterLink resource="projects" name="Projects" onClick={this.close} /> }
            {/* <ResourceClusterLink resource="projects" name="Projects" onClick={this.close} required={FLAGS.OPENSHIFT} /> */}
            { isAdmin && <ResourceClusterLink resource="namespaces" name="Namespaces" onClick={this.close} required={FLAGS.CAN_LIST_NS} /> }
            <ResourceNSLink resource="resourcequotas" name="Resource Quotas" onClick={this.close} />
            { !isAdmin && <ResourceNSLink resource="limitrange" name="Limit Range" onClick={this.close} /> }
          </NavSection>

          <NavSection text="Auth" icon="fa fa-id-card-o">
            { isAdmin && <ResourceNSLink resource="clusterrolebindings" name="Cluster Role Bindings" onClick={this.close} /> }
            { isAdmin && <ResourceNSLink resource="clusterroles" name="Cluster Roles" onClick={this.close} /> }
            <ResourceNSLink resource="rolebindings" name="Role Bindings" onClick={this.close} startsWith={rolebindingsStartsWith} />
            <ResourceNSLink resource="roles" name="Roles" startsWith={rolesStartsWith} onClick={this.close} />
            { isAdmin && <ResourceNSLink resource="users" name="Users" onClick={this.close} /> }
            <ResourceNSLink resource="serviceaccounts" name="Service Accounts" onClick={this.close} />
          </NavSection>

          <NavSection text="Hosts" icon="pficon pficon-server">
            {/* <ResourceClusterLink resource="nodes" name="Nodes" onClick={this.close} /> */}
            <ResourceClusterLink resource="nodes" name="Nodes" onClick={this.close} required={FLAGS.CAN_LIST_NODE} />
          </NavSection>

          {/* <NavSection text="Administration" icon="fa fa-cog">
            <HrefLink href="/settings/cluster" name="Cluster Settings" onClick={this.close} startsWith={clusterSettingsStartsWith} disallowed={FLAGS.OPENSHIFT} />
            <ResourceNSLink resource="chargeback.coreos.com:v1alpha1:Report" name="Chargeback" onClick={this.close} disallowed={FLAGS.OPENSHIFT} />
            <ResourceClusterLink resource="customresourcedefinitions" name="CRDs" onClick={this.close} required={FLAGS.CAN_LIST_CRD} />
          </NavSection> */}

          <UserNavSection closeMenu={this.close} />
          <i style={{fontSize: '10px', color:'#7878783d', cursor: 'pointer'}}className={`fa fa-${isAdmin ? 'star':'star-o'}`} onClick={this.props.changeRole} aria-hidden="true"></i>
        </div>
      </div>
    </React.Fragment>;
  }
}

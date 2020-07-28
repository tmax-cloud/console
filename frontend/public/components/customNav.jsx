import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as classNames from 'classnames';
import * as _ from 'lodash-es';
import * as PropTypes from 'prop-types';
import { featureReducerName, flagPending } from '../features';
import { formatNamespacedRouteForResource } from '../ui/ui-actions';
import { referenceForModel } from '../module/k8s';
import * as aiOpsImg from '../imgs/ic_lnb_aiops.svg';
import { history, stripBasePath, kindObj } from './utils';
import { withTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
import { safeLoad } from 'js-yaml';
import { k8sGet } from '../module/k8s';
import { getAccessToken, getId } from './utils/auth';

export const matchesPath = (resourcePath, prefix) => resourcePath === prefix || _.startsWith(resourcePath, `${prefix}/`);
export const matchesModel = (resourcePath, model) => model && matchesPath(resourcePath, referenceForModel(model));

// HrefLinks are PureComponents...
const searchStartsWith = ['search'];
const rolesStartsWith = ['roles', 'clusterroles'];
const rolebindingsStartsWith = ['rolebindings', 'clusterrolebindings'];

const iconList = { home: 'pficon pficon-home', servicecatalog: 'pficon pficon-catalog', workload: 'fa fa-briefcase', servicemesh: 'pficon pficon-infrastructure', network: 'pficon pficon-network', storage: 'fa fa-database', cicd: 'pficon pficon-process-automation', aiops: `${aiOpsImg}`, security: 'fa fa-shield', image: 'pficon pficon-image', management: 'pficon pficon-services', host: 'pficon pficon-server', auth: 'fa fa-id-card-o' };

const defaultMenu = `
- name: home
  menu:
    - name: status
      type: hreflink
      href: /status
      activePath: /status
    - name: search
      type: hreflink
      href: /search
    - name: audit
      type: resourcenslink
    - name: event
      type: resourcenslink
    - name: grafana
      type: hreflink
      href: /grafana
- name: servicecatalog
  menu:
    - name: ServiceBroker
      type: resourcenslink
    - name: ServiceClass
      type: resourcenslink
    - name: ServicePlan
      type: resourcenslink
    - name: ClusterServiceBroker
      type: resourceclusterlink
    - name: ClusterServiceClass
      type: resourceclusterlink
    - name: ClusterServicePlan
      type: resourceclusterlink
    - name: ServiceInstance
      type: resourcenslink
    - name: ServiceBinding
      type: resourcenslink
    - name: CatalogServiceClaim
      type: resourcenslink
    - name: Template
      type: resourcenslink
    - name: TemplateInstance
      type: resourcenslink
- name: workload
  menu:
    - name: Pod
      type: resourcenslink
    - name: Deployment
      type: resourcenslink
    - name: ReplicaSet
      type: resourcenslink
    - name: horizontalpodautoscaler
      type: resourcenslink
    - name: DaemonSet
      type: resourcenslink
    - name: StatefulSet
      type: resourcenslink
    - name: VirtualMachine
      type: resourcenslink
    - name: VirtualMachineInstance
      type: resourcenslink
    - name: ConfigMap
      type: resourcenslink
    - name: Secret
      type: resourcenslink
    - name: Job
      type: resourcenslink
    - name: CronJob
      type: resourcenslink
- name: servicemesh
  menu:
    - name: VirtualService
      type: resourcenslink
    - name: DestinationRule
      type: resourcenslink
    - name: EnvoyFilter
      type: resourcenslink
    - name: Gateway
      type: resourcenslink
    - name: Sidecar
      type: resourcenslink
    - name: ServiceEntry
      type: resourcenslink
    - name: RequestAuthentication
      type: resourcenslink
    - name: PeerAuthentication
      type: resourcenslink
    - name: AuthorizationPolicy
      type: resourcenslink
    - name: kiali
      type: hreflink
      href: /kiali
- name: network
  menu:
    - name: Ingress
      type: resourcenslink
    - name: Service
      type: resourcenslink
- name: storage
  menu:
    - name: StorageClass
      type: resourceclusterlink
    - name: DataVolume
      type: resourcenslink
    - name: PersistentVolumeClaim
      type: resourcenslink
    - name: PersistentVolume
      type: resourceclusterlink
- name: cicd
  menu:
    - name: Task
      type: resourcenslink
    - name: TaskRun
      type: resourcenslink
    - name: Pipeline
      type: resourcenslink
    - name: PipelineRun
      type: resourcenslink
    - name: PipelineApproval
      type: resourcenslink
    - name: PipelineResource
      type: resourcenslink
    - name: Condition
      type: resourcenslink
- name: aiops
  menu:
    - name: Notebook
      type: resourcenslink
    - name: Experiment
      type: resourcenslink
    - name: TrainingJob
      type: resourcenslink
    - name: InferenceService
      type: resourcenslink
    - name: WorkflowTemplate
      type: resourcenslink
    - name: Workflow
      type: resourcenslink
- name: security
  menu:
    - name: PodSecurityPolicy
      type: resourceclusterlink
    - name: NetworkPolicy
      type: resourcenslink
- name: image
  menu:
    - name: Registry
      type: resourcenslink
- name: management
  menu:
    - name: Namespace
      type: resourceclusterlink
    - name: NamespaceClaim
      type: resourceclusterlink
    - name: LimitRange
      type: resourcenslink
    - name: ResourceQuota
      type: resourcenslink
    - name: ResourceQuotaClaim
      type: resourcenslink
    - name: CustomResourceDefinition
      type: resourceclusterlink
- name: host
  menu:
    - name: Node
      type: resourceclusterlink
- name: auth
  menu:
    - name: Role
      type: resourcenslink
    - name: RoleBinding
      type: resourcenslink
    - name: RoleBindingClaim
      type: resourcenslink
    - name: User
      type: resourceclusterlink
    - name: Usergroup
      type: resourceclusterlink
    - name: Usersecuritypolicy
      type: resourceclusterlink
    - name: ServiceAccount
      type: resourcenslink
`;

const stripNS = href => {
  href = stripBasePath(href);
  return href
    .replace(/^\/?k8s\//, '')
    .replace(/^\/?(cluster|all-namespaces|ns\/[^/]*)/, '')
    .replace(/^\//, '');
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

    return (
      <li className={classNames('co-m-nav-link', { active: isActive, 'co-m-nav-link__external': isExternal })}>
        <Link id={id} to={this.to} target={target} onClick={onClick} className={classNames({ 'co-external-link': isExternal })}>
          {name}
        </Link>
      </li>
    );
  }
}

NavLink.defaultProps = {
  required: '',
  disallowed: '',
};

NavLink.propTypes = {
  required: PropTypes.string,
  disallowed: PropTypes.string,
};

class ResourceNSLink extends NavLink {
  static isActive(props, resourcePath, activeNamespace) {
    const href = stripNS(formatNamespacedRouteForResource(props.resource, activeNamespace));
    return matchesPath(resourcePath, href) || matchesModel(resourcePath, props.model);
  }

  get to() {
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
  static isActive(props, resourcePath) {
    return resourcePath === props.resource || _.startsWith(resourcePath, `${props.resource}/`);
  }

  get to() {
    return `/k8s/cluster/${this.props.resource}`;
  }
}

ResourceClusterLink.propTypes = {
  name: PropTypes.string.isRequired,
  startsWith: PropTypes.arrayOf(PropTypes.string),
  resource: PropTypes.string.isRequired,
};

class HrefLink extends NavLink {
  static isActive(props, resourcePath) {
    const noNSHref = stripNS(props.href);
    return resourcePath === noNSHref || _.startsWith(resourcePath, `${noNSHref}/`);
  }

  get to() {
    return this.props.href;
  }
}

HrefLink.propTypes = {
  name: PropTypes.string.isRequired,
  startsWith: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.string.isRequired,
};

const navSectionStateToProps = (state, { required }) => {
  const flags = state[featureReducerName];
  const canRender = required ? flags.get(required) : true;

  return {
    flags,
    canRender,
    activeNamespace: state.UI.get('activeNamespace'),
    location: state.UI.get('location'),
  };
};

class NavSection_ extends React.Component {
  constructor(props) {
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

  shouldComponentUpdate(nextProps, nextState) {
    const { isOpen } = this.state;

    if (isOpen !== nextProps.isOpen) {
      return true;
    }

    if (!isOpen && !nextState.isOpen) {
      return false;
    }

    return nextProps.location !== this.props.location || nextProps.flags !== this.props.flags;
  }

  getActiveChild() {
    const { activeNamespace, location, children } = this.props;

    if (!children) {
      console.log(stripBasePath(location).startsWith(this.props.activePath));
      return stripBasePath(location).startsWith(this.props.activePath);
    }

    const resourcePath = location ? stripNS(location) : '';
    if (Array.isArray(children)) {
      return children
        .filter(c => {
          if (!c) {
            return false;
          }
          if (c.props.startsWith) {
            return c.type.startsWith(resourcePath, c.props.startsWith);
          }
          return c.type.isActive && c.type.isActive(c.props, resourcePath, activeNamespace);
        })
        .map(c => c.props.name)[0];
    } else if (children.props.startsWith) {
      // 하나만 있을 때 처리
      return children.type.startsWith(resourcePath, children.props.startsWith) ? children.props.name : null;
    }
    return children.type.isActive && children.type.isActive(children.props, resourcePath, activeNamespace) ? children.props.name : null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location === this.props.location) {
      return;
    }

    const activeChild = this.getActiveChild();
    const state = { activeChild };
    if (activeChild && !prevState.activeChild) {
      state.isOpen = true;
    }
    this.setState(state);
  }

  open_() {
    this.setState({ isOpen: true });
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

    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    if (!this.props.canRender) {
      return null;
    }

    const { id, icon, img, text, children, activeNamespace, flags, href = null, activeImg, klass } = this.props;
    const isActive = !!this.state.activeChild;
    const maxHeight = !this.state.isOpen ? 0 : 29 * _.get(this.props.children, 'length', 1);

    const iconClassName = icon && `${icon} navigation-container__section__title__icon ${isActive ? 'navigation-container__section__title__icon--active' : ''}`;
    const secionTitleClassName = `navigation-container__section__title ${isActive ? 'navigation-container__section__title--active' : ''}`;
    const sectionClassName = isActive && href ? 'navigation-container__section navigation-container__section--active' : 'navigation-container__section';

    const Children = React.Children.map(children, c => {
      if (!c) {
        return null;
      }
      const { name, required, disallowed } = c.props;
      if (required && (flagPending(flags.get(required)) || !flags.get(required))) {
        return null;
      }
      if (disallowed && (flagPending(flags.get(disallowed)) || flags.get(disallowed))) {
        return null;
      }
      return React.cloneElement(c, { key: name, isActive: name === this.state.activeChild, activeNamespace });
    });

    return (
      <div className={classNames(sectionClassName, klass)}>
        <div id={id} className={secionTitleClassName} onClick={this.toggle}>
          {icon && <i className={iconClassName} aria-hidden="true"></i>}
          {img && <img style={{ color: '#72767B', opacity: '0.65' }} src={isActive && activeImg ? activeImg : img} />}
          {!href ? (
            text
          ) : (
            <Link className="navigation-container__section__title__link" to={href} onClick={this.open}>
              {text}
            </Link>
          )}
        </div>
        {Children && (
          <ul className="navigation-container__list" style={{ maxHeight }}>
            {Children}
          </ul>
        )}
      </div>
    );
  }
}

const NavSection = connect(navSectionStateToProps)(NavSection_);

class CustomNav extends React.Component {
  constructor(props) {
    super(props);
    this.scroller = React.createRef();
    this.preventScroll = e => this.preventScroll_(e);
    this.toggle = () => this.toggle_();
    this.setNav = (data, t) => this.setNav_(data, t);
    this.state = {
      isOpen: false,
      nav: [],
    };
    this.close = () => this.close_();
  }

  preventScroll_(e) {
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

  close_() {
    this.setState({ isOpen: false });
  }

  toggle_() {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  componentDidMount() {
    if (!getAccessToken() || this.state.nav.length !== 0) {
      return;
    }

    const ko = kindObj('ClusterMenuPolicy');
    const { t } = this.props;

    k8sGet(ko, getId())
      .then(response => {
        this.setNav(response.menus, t);
      })
      .catch(err => {
        k8sGet(ko, 'default')
          .then(response => {
            this.setNav(response.menus, t);
          })
          .catch(err => {
            const obj = safeLoad(defaultMenu);
            if (obj === this.state.nav) {
              return;
            }
            this.setNav(obj, t);
          });
      });
  }

  setNav_(data, t) {
    data.forEach(item => {
      item.name === 'aiops' ? (item.img = iconList[item.name]) : (item.icon = iconList[item.name]);
      item.text = t(`RESOURCE:${item.name.toUpperCase()}`);

      let menu_ = item.menu.map(menuItem => {
        let temp = t(`RESOURCE:${menuItem.name.toUpperCase()}`);
        switch (menuItem.type) {
          case 'hreflink':
            if (menuItem.name === 'search') {
              menuItem.startsWith = searchStartsWith;
            }
            return <HrefLink {...menuItem} name={temp} onClick={this.close} />;
          case 'resourcenslink': {
            let resource;
            switch (menuItem.name) {
              case 'event':
                resource = 'events';
                break;
              case 'audit':
                resource = 'audits';
                break;
              case 'PipelineApproval':
                resource = 'approvals';
                break;
              case 'horizontalpodautoscaler':
                resource = 'horizontalpodautoscalers';
                break;
              default:
                resource = ResourcePlural(menuItem.name)
                  .replace(/ /g, '')
                  .toLowerCase();
                break;
            }

            switch (resource) {
              case 'catalogserviceclaim':
                resource = 'catalogserviceclaims';
                break;
              case 'pipelineconditions':
                resource = 'conditions';
                break;
              case 'notebookserver':
                resource = 'notebooks';
                break;
              case 'katib':
                resource = 'experiments';
                break;
              case 'kfserving':
                resource = 'inferenceservices';
                break;
              default:
                break;
            }

            let startsWith;
            if (menuItem.name.indexOf('role') !== -1) {
              menuItem.name === 'roles' ? (startsWith = rolesStartsWith) : (startsWith = rolebindingsStartsWith);
            }
            return <ResourceNSLink resource={resource} name={temp} onClick={this.close} startsWith={startsWith} />;
          }
          case 'resourceclusterlink':
            return (
              <ResourceClusterLink
                resource={ResourcePlural(menuItem.name)
                  .replace(/ /g, '')
                  .toLowerCase()}
                name={temp}
                onClick={this.close}
              />
            );
          default:
            return;
        }
      });

      item.menu = menu_;
    });

    this.setState({
      nav: data.map((item, idx) => (
        <NavSection key={idx} text={item.text} icon={item.icon} img={item.img}>
          {item.menu}
        </NavSection>
      )),
    });
  }

  render() {
    const { isOpen, nav } = this.state;

    return (
      <React.Fragment>
        <button type="button" className="sidebar-toggle" aria-controls="sidebar" aria-expanded={isOpen} onClick={this.toggle}>
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar" aria-hidden="true"></span>
          <span className="icon-bar" aria-hidden="true"></span>
          <span className="icon-bar" aria-hidden="true"></span>
        </button>
        <div id="sidebar" className={classNames({ open: isOpen })}>
          <div ref={this.scroller} onWheel={this.preventScroll} className="navigation-container">
            {nav}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withTranslation()(CustomNav);

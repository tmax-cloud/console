import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate } from '../../module/k8s';
import { NetworkPolicyModel } from '../../models';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { SelectKeyValueEditor } from '../utils/select-key-value-editor';

const allow = 'allow';
const deny = 'deny';

const defaultDeny = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'NetworkPolicy',
  spec: {
    podSelector: null,
  },
};

const Section = ({ label, children, isRequired, paddingTop }) => {
  return <div className={`row form-group ${isRequired ? 'required' : ''}`}>
    <div className="col-xs-2 control-label" style={{paddingTop: paddingTop}}>
      <strong>{label}</strong>
    </div>
    <div className="col-xs-10">{children}</div>
  </div>;
};


class NamespaceFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingNamespace = _.pick(props.obj, ['metadata', 'type']);
    const namespace = _.defaultsDeep({}, props.fixed, existingNamespace, {
      metadata: {
        name: '',
      },
      spec: {
        hard: {},
        limits: [
          {
            type: 'Container'
          }
        ],
      },
    });

    this.state = {
      namespaceTypeAbstraction: this.props.namespaceTypeAbstraction,
      namespace: namespace,
      inProgress: false,
      type: 'form',
      quota: [['', '']],
      limit: [['', '']],
      np: allow
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this._updateQuota = this._updateQuota.bind(this);
    this._updateLimit = this._updateLimit.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChanged(event) {
    let namespace = { ...this.state.namespace };
    namespace.metadata.name = String(event.target.value);
    this.setState({ namespace: namespace });
  }
  onLabelChanged(event) {
    let namespace = { ...this.state.namespace };
    namespace.metadata.labels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        namespace.metadata.labels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ namespace: namespace });
  }
  _updateQuota(quota) {
    this.setState({
      quota: quota.keyValuePairs
    });
  }
  _updateLimit(limit) {
    this.setState({
      limit: limit.keyValuePairs
    });
  }
  save(e) {
    e.preventDefault();
    const { metadata } = this.state.namespace;
    this.setState({ inProgress: true });
    const newNamespace = _.assign({}, this.state.namespace);

    if (this.state.np === deny) {
      const policy = Object.assign({}, defaultDeny, { metadata: { namespace: this.state.namespace.metadata.name, name: 'default-deny' } });
      k8sCreate(NetworkPolicyModel, policy).then(() => {
        history.push(`/k8s/ns/${metadata.name}/networkpolicies/default-deny`);
      });
    }

    let quota = {};
    this.state.quota.forEach(arr => {
      if (arr[0] === 'etc') {
        quota[arr[1]] = arr[2];
      } else {
        quota[arr[0]] = arr[2];
      }
    });

    if ( quota !== {}) {
      newNamespace.spec.hard = quota;
    }

    let limit = {};
    this.state.limit.forEach(arr => {
      if (arr[0] === 'etc') {
        limit[arr[1]] = arr[2];
      } else {
        const minOrMax = arr[0].split('.')[0];
        const key = arr[0].split('.')[2];
        limit[minOrMax] = {};
        limit[minOrMax][key] = arr[2];
      }
    });

    if ( limit !== {}) {
      Object.assign(newNamespace.spec.limits[0], limit);
    }

    const ko = kindObj('Namespace');
    (this.props.isCreate
      ? k8sCreate(ko, newNamespace)
      : ''
    ).then(() => {
      this.setState({ inProgress: false });
      history.push(`/k8s/cluster/namespaces/${metadata.name}`);
    }, err => this.setState({ error: err.message, inProgress: false }));
  }

  render() {
    const { t } = this.props;

    return <div className="rbac-edit-binding co-m-pane__body">
      <Helmet>
        <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Namespace', t) })}</title>
      </Helmet >
      <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
        <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Namespace', t) })}</h1>
        <p className="co-m-pane__explanation">{t('STRING:NAMESPACE-CREATE-0')}</p>
        <fieldset disabled={!this.props.isCreate}>
          <Section label={t('CONTENT:NAME')} isRequired={true}>
            <input className="form-control"
              type="text"
              onChange={this.onNameChanged}
              value={this.state.namespace.metadata.name}
              id="namespace-name"
              required />
          </Section>
          <Section label={t('CONTENT:LABELS')} isRequired={false}>
            <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
            <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
              <p>{t('VALIDATION:LABEL_FORM')}</p>
            </div>
          </Section>
          <Section label={t('CONTENT:DEFAULTNETWORKPOLICY')} isRequired={false}>
            <div className="modal-body__field ">
              <select id="network-policy" onChange={e => this.setState({ np: e.target.value })} value={this.state.np} className="form-control">
                <option value={allow}>{t('CONTENT:NORESTRICTIONS(DEFAULT)')}</option>
                <option value={deny}>{t('CONTENT:DENYALLINBOUNDTRAFFIC')}</option>
              </select>
            </div>
          </Section>
          <Section label={t('CONTENT:NAMESPACERESOURCEQUOTA')} isRequired={false} paddingTop={'5px'}>
            <SelectKeyValueEditor desc={t('STRING:RESOURCEQUOTA-CREATE-2')} t={t} options={NamespaceFormComponent.resourceQuotaOptions} keyValuePairs={this.state.quota} keyString="resourcetype" valueString="value" updateParentData={this._updateQuota} />
          </Section>
          <Section label={t('CONTENT:PODRESOURCELIMITSRANGE')} isRequired={false} paddingTop={'5px'}>
            <SelectKeyValueEditor desc={t('STRING:LIMITRANGE-CREATE-2')} t={t} options={NamespaceFormComponent.limitRangeOptions} keyValuePairs={this.state.limit} keyString="resourcetype" valueString="value" updateParentData={this._updateLimit} />
          </Section>
          <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
            <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
            <Link to={formatNamespacedRouteForResource('namespaces')} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
          </ButtonBar>
        </fieldset>
      </form>
    </div >;
  }
}

NamespaceFormComponent.resourceQuotaOptions = [
  {
    value: 'limits.cpu',
    label: 'CPU Limits',
  },
  {
    value: 'limits.memory',
    label: 'Memory Limits',
  },
  {
    value: 'requests.cpu',
    label: 'CPU Requests',
  },
  {
    value: 'requests.memory',
    label: 'Memory Requests',
  },
  {
    value: 'pods',
    label: '파드 수',
  },
  {
    value: 'etc',
    label: '기타',
  },
];

NamespaceFormComponent.limitRangeOptions = [
  {
    value: 'max.limits.cpu',
    label: 'Max CPU Limits',
  },
  {
    value: 'min.limits.cpu',
    label: 'Min CPU Limits',
  },
  {
    value: 'max.limits.memory',
    label: 'Max Memory Limits',
  },
  {
    value: 'min.limits.memory',
    label: 'Min Memory Limits',
  },
  {
    value: 'etc',
    label: '기타',
  },
];



export const CreateNamespace = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <NamespaceFormComponent
    t={t}
    fixed={{ metadata: { namespace: params.ns } }}
    namespaceTypeAbstraction={params.type}
    titleVerb="Create"
    isCreate={true}
  />;
};

import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { SelectKeyValueEditor } from '../utils/select-key-value-editor';

const Section = ({ label, children, isRequired, paddingTop }) => {
  return (
    <div className={`row form-group ${isRequired ? 'required' : ''}`}>
      <div className="col-xs-2 control-label" style={{ paddingTop: paddingTop }}>
        <strong>{label}</strong>
      </div>
      <div className="col-xs-10">{children}</div>
    </div>
  );
};

class ResourceQuotaFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingResourceQuota = _.pick(props.obj, ['metadata', 'type']);
    const resourceQuota = _.defaultsDeep({}, props.fixed, existingResourceQuota, {
      apiVersion: 'v1',
      kind: 'ResourceQuota',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        hard: {},
      },
    });

    this.state = {
      resourceQuotaTypeAbstraction: this.props.resourceQuotaTypeAbstraction,
      resourceQuota: resourceQuota,
      inProgress: false,
      type: 'form',
      quota: [['', '']],
      isDuplicated: false,
      inputError: {
        name: null,
        namespace: null,
      },
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this._updateQuota = this._updateQuota.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChanged(event) {
    let resouceQuota = { ...this.state.resourceQuota };
    resouceQuota.metadata.name = String(event.target.value);
    this.setState({ resourceQuota: resouceQuota });
  }
  onNamespaceChanged(namespace) {
    let resourceQuota = { ...this.state.resourceQuota };
    resourceQuota.metadata.namespace = String(namespace);
    this.setState({ resourceQuota: resourceQuota });
  }
  onLabelChanged(event) {
    let resourceQuota = { ...this.state.resourceQuota };
    resourceQuota.metadata.labels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        resourceQuota.metadata.labels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ resourceQuota: resourceQuota });
  }
  _updateQuota(quota) {
    this.setState({
      quota: quota.keyValuePairs,
      isDuplicated: quota.isDuplicated,
    });
  }

  isRequiredFilled = (k8sResource, item, element) => {
    const { t } = this.props;
    if (k8sResource.metadata[item] === '') {
      switch (item) {
        case 'name':
          this.setState({ inputError: { name: t(`VALIDATION:EMPTY-${element}`, { something: t(`CONTENT:NAME`) }) } });
          return false;
        case 'namespace':
          this.setState({ inputError: { namespace: t(`VALIDATION:EMPTY-${element}`, { something: t(`CONTENT:NAMESPACE`) }) } });
          return false;
      }
    } else {
      this.setState({
        inputError: {
          [item]: null,
        },
      });
      return true;
    }
  };

  onFocusName = () => {
    this.setState({
      inputError: {
        name: null,
      },
    });
  };

  onFocusNamespace = () => {
    this.setState({
      inputError: {
        namespace: null,
      },
    });
  };

  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.resourceQuota;
    this.setState({ inProgress: true });
    const newResourceQuota = _.assign({}, this.state.resourceQuota);

    if (!this.isRequiredFilled(newResourceQuota, 'name', 'INPUT') || !this.isRequiredFilled(newResourceQuota, 'namespace', 'SELECT')) {
      this.setState({ inProgress: false });
      return;
    }

    if (this.state.isDuplicated) {
      this.setState({ inProgress: false });
      return;
    }

    let quota = {};
    this.state.quota.forEach(arr => {
      const key = arr[0] === 'etc' ? arr[1] : arr[0];
      quota[key] = arr[2];
    });

    if (quota !== {}) {
      newResourceQuota.spec.hard = quota;
    }

    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newResourceQuota) : k8sUpdate(ko, newResourceQuota, metadata.namespace, newResourceQuota.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push(`/k8s/ns/${metadata.namespace}/resourcequotas/${metadata.name}`);
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;

    const resourceQuotaOptions = [
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
        label: t('CONTENT:NUMBEROFPODS'),
      },
      {
        value: 'etc',
        label: t('CONTENT:OTHERS'),
      },
    ];

    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:${this.state.resourceQuota.kind.toUpperCase()}`) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:${this.state.resourceQuota.kind.toUpperCase()}`) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:RESOURCEQUOTA-CREATE-0')}</p>
          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onNameChanged} onFocus={this.onFocusName} value={this.state.resourceQuota.metadata.name} id="resource-quota-name" />
              {this.state.inputError.name && <p className="cos-error-title">{this.state.inputError.name}</p>}
            </Section>
            <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="resource-quota-namespace" t={t} onChange={this.onNamespaceChanged} onFocus={this.onFocusNamespace} />
              {this.state.inputError.namespace && <p className="cos-error-title">{this.state.inputError.namespace}</p>}
            </Section>
            <Section label={t('CONTENT:LABELS')} isRequired={false}>
              <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
              <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                <p>{t('VALIDATION:LABEL_FORM')}</p>
              </div>
            </Section>
            <Section label={t('CONTENT:NAMESPACERESOURCEQUOTA')} isRequired={false} paddingTop={'5px'}>
              <SelectKeyValueEditor desc={t('STRING:RESOURCEQUOTA-CREATE-2')} t={t} anotherDesc={t('STRING:RESOURCEQUOTA-CREATE-3')} options={resourceQuotaOptions} keyValuePairs={this.state.quota} keyString="resourcetype" valueString="value" updateParentData={this._updateQuota} isDuplicated={this.state.isDuplicated} />
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('resourcequotas')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateResourceQuota = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <ResourceQuotaFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} resourceQuotaTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

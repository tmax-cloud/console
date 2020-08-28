/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
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

class NamespaceClaimFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingNamespaceClaim = _.pick(props.obj, ['metadata', 'type']);
    const namespaceclaim = _.defaultsDeep({}, props.fixed, existingNamespaceClaim, {
      apiVersion: 'tmax.io/v1',
      kind: 'NamespaceClaim',
      metadata: {
        name: '',
        labels: {
          handled: 'f',
        },
      },
      resourceName: '',
      spec: {
        hard: {},
        limits: [
          {
            type: 'Container',
          },
        ],
      },
    });

    this.state = {
      namespaceClaimTypeAbstraction: this.props.namespaceClaimTypeAbstraction,
      namespaceclaim: namespaceclaim,
      inProgress: false,
      type: 'form',
      quota: [['', '']],
      isDuplicated: false,
      inputError: {
        name: null,
        resourceName: null,
      },
    };
    this.onResourceNameChanged = this.onResourceNameChanged.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this._updateQuota = this._updateQuota.bind(this);
    this.save = this.save.bind(this);
  }

  onResourceNameChanged(event) {
    let namespaceclaim = { ...this.state.namespaceclaim };
    namespaceclaim.resourceName = String(event.target.value);
    this.setState({ namespaceclaim });
  }
  onNameChanged(event) {
    let namespaceclaim = { ...this.state.namespaceclaim };
    namespaceclaim.metadata.name = String(event.target.value);
    this.setState({ namespaceclaim });
  }
  onLabelChanged(event) {
    let namespaceclaim = { ...this.state.namespaceclaim };
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        namespaceclaim.metadata.labels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ namespaceclaim });
  }
  _updateQuota(quota) {
    this.setState({
      quota: quota.keyValuePairs,
      isDuplicated: quota.isDuplicated,
    });
  }
  isRequiredFilled = (k8sResource, item, element) => {
    console.log('isRequiredFilled', k8sResource, item, element);
    const { t } = this.props;
    if (k8sResource.metadata[item] === '') {
      switch (item) {
        case 'name':
          this.setState({ inputError: { name: t(`VALIDATION:EMPTY-${element}`, { something: t(`CONTENT:NAME`) }) } });
          return false;
      }
    } else if (k8sResource[item] === '') {
      this.setState({ inputError: { resourceName: t(`VALIDATION:EMPTY-${element}`, { something: t(`CONTENT:RESOURCENAME`) }) } });
      return false;
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

  onFocusResourceName = () => {
    this.setState({
      inputError: {
        resourceName: null,
      },
    });
  };

  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.namespaceclaim;
    this.setState({ inProgress: true });
    const newNamespaceclaim = _.assign({}, this.state.namespaceclaim);

    if (!this.isRequiredFilled(newNamespaceclaim, 'name', 'INPUT') || !this.isRequiredFilled(newNamespaceclaim, 'resourceName', 'INPUT')) {
      this.setState({ inProgress: false });
      return;
    }

    if (this.state.isDuplicated) {
      this.setState({ inProgress: false });
      return;
    }

    // quota 데이터 가공
    let quota = {};
    this.state.quota.forEach(arr => {
      const key = arr[0] === 'etc' ? arr[1] : arr[0];
      quota[key] = arr[2];
    });

    if (quota !== {}) {
      Object.assign(newNamespaceclaim.spec.hard, quota);
    }

    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newNamespaceclaim) : k8sUpdate(ko, newNamespaceclaim, metadata.namespace, newNamespaceclaim.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        console.log(this.state);
        history.push('/k8s/cluster/namespaceclaims');
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;

    const resourceQuotaClaimOptions = [
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
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:${this.state.namespaceclaim.kind.toUpperCase()}`) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:${this.state.namespaceclaim.kind.toUpperCase()}`) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:NAMESPACECLAIM-CREATE-0')}</p>
          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onNameChanged} onFocus={this.onFocusName} value={this.state.namespaceclaim.metadata.name} id="namespace-claim-name" />
              {this.state.inputError.name && <p className="cos-error-title">{this.state.inputError.name}</p>}
            </Section>
            <Section label={t('CONTENT:LABELS')} isRequired={false}>
              <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
              <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                <p>{t('VALIDATION:LABEL_FORM')}</p>
              </div>
            </Section>
            <Section label={t('CONTENT:RESOURCENAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onResourceNameChanged} value={this.state.namespaceclaim.resourceName} onFocus={this.onFocusResourceName} id="namespace-claim-resource-name" />
              {this.state.inputError.resourceName && <p className="cos-error-title">{this.state.inputError.resourceName}</p>}
            </Section>
            <Section label={t('CONTENT:NAMESPACERESOURCEQUOTA')} isRequired={false} paddingTop={'5px'}>
              <SelectKeyValueEditor desc={t('STRING:NAMESPACECLAIM-CREATE-1')} t={t} anotherDesc={t('STRING:RESOURCEQUOTA-CREATE-3')} options={resourceQuotaClaimOptions} keyValuePairs={this.state.quota} keyString="resourcetype" valueString="value" updateParentData={this._updateQuota} isDuplicated={this.state.isDuplicated} />
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={'/k8s/cluster/namespaceclaims'} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateNamespaceClaim = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <NamespaceClaimFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} namespaceClaimTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

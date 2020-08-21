import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown, ListDropdown } from '../RBAC/bindings';
import { RadioGroup } from '../radio';
import { connectToFlags, FLAGS, flagPending } from '../../features';
import SingleSelect from '../utils/select';

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

const LabelInput = ({ label, placeholder, onChange, value, id, half, isPassword, children }) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex' }}>
        <input className={half ? 'form-control half' : 'form-control'} type={isPassword ? 'password' : 'text'} onChange={onChange} value={value} id={id} style={{ marginBottom: '10px' }} placeholder={placeholder} required />
        {children ? <span style={{ width: '40px' }}>{children}</span> : ''}
      </div>
    </>
  );
};

class RegistryFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingRegistry = _.pick(props.obj, ['metadata', 'type']);
    const registry = _.defaultsDeep({}, props.fixed, existingRegistry, {
      apiVersion: 'tmax.io/v1',
      kind: 'Registry',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        image: '',
        loginId: '',
        loginPassword: '',
        persistentVolumeClaim: {},
        service: {},
      },
    });

    this.state = {
      registryTypeAbstraction: this.props.registryTypeAbstraction,
      registry: registry,
      inProgress: false,
      type: 'form',
      loginPwdConfirm: '',
      serviceType: 'ingress',
      pvcType: 'exist',
      pvc: '',
      domainName: '',
      port: '',
      accessModes: 'ReadWriteOnce',
      storageSize: '',
      storageSizeUnit: 'Gi',
      storageClassName: '',
    };
  }

  onNameChanged = e => {
    const registry = { ...this.state.registry };
    registry.metadata.name = String(e.target.value);
    this.setState({ registry });
  };
  onNamespaceChanged = namespace => {
    const registry = { ...this.state.registry };
    registry.metadata.namespace = String(namespace);
    this.setState({ registry });
  };
  onImageChanged = e => {
    const registry = { ...this.state.registry };
    registry.spec.image = String(e.target.value);
    this.setState({ registry });
  };
  onIdChanged = e => {
    const registry = { ...this.state.registry };
    registry.spec.loginId = String(e.target.value);
    this.setState({ registry });
  };
  onPwdChanged = e => {
    const registry = { ...this.state.registry };
    registry.spec.loginPassword = String(e.target.value);
    this.setState({ registry });
  };
  onPwdConfirmChanged = e => {
    this.setState({ loginPwdConfirm: e.target.value });
  };
  onServiceTypeChanged = e => {
    this.setState({ serviceType: e.target.value });
  };
  onServiceDomainNameChanged = e => {
    this.setState({ domainName: e.target.value });
  };
  onServicePortChanged = e => {
    this.setState({ port: e.target.value });
  };
  onPvcTypeChanged = e => {
    this.setState({ pvcType: e.target.value });
  };
  onPvcChanged = pvc => {
    this.setState({ pvc: String(pvc) });
  };
  onPVCAccessModeChanged = e => {
    this.setState({ accessModes: e.target.value });
  };
  onPVCStorageSizeChanged = e => {
    this.setState({ storageSize: e.target.value });
  };
  onPVCStorageSizeUnitChanged = e => {
    this.setState({ storageSizeUnit: e.value });
  };
  onPVCStorageClassNameChanged = storageClassName => {
    this.setState({ storageClassName: String(storageClassName) });
  };
  onLabelChanged = e => {
    const registry = { ...this.state.registry };
    registry.metadata.labels = {};
    if (e.length !== 0) {
      e.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          e.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        registry.metadata.labels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ registry });
  };

  save = e => {
    const { t } = this.props;
    e.preventDefault();
    const { kind, metadata } = this.state.registry;
    this.setState({ error: undefined, inProgress: true });
    const newRegistry = _.assign({}, this.state.registry);

    if (this.state.registry.spec.loginPassword !== this.state.loginPwdConfirm) {
      this.setState({ error: t('STRING:REGISTRY-CREATE_7'), inProgress: false });
    } else {
      let service = {};
      const serviceType = this.state.serviceType;
      service[serviceType] = {};
      if (serviceType === 'ingress') {
        service[serviceType]['domainName'] = this.state.domainName;
      }
      service[serviceType]['port'] = Number(this.state.port);
      newRegistry.spec.service = service;

      let pvc = {};
      const pvcType = this.state.pvcType;
      pvc[pvcType] = {};
      if (pvcType === 'create') {
        pvc[pvcType]['accessModes'] = [this.state.accessModes];
        pvc[pvcType]['storageSize'] = this.state.storageSize.concat(this.state.storageSizeUnit);
        pvc[pvcType]['storageClassName'] = this.state.storageClassName;
      } else {
        pvc[pvcType]['pvcName'] = this.state.pvc;
      }
      newRegistry.spec.persistentVolumeClaim = pvc;

      const ko = kindObj(kind);
      (this.props.isCreate ? k8sCreate(ko, newRegistry) : k8sUpdate(ko, newRegistry, metadata.namespace, newRegistry.metadata.name)).then(
        () => {
          this.setState({ inProgress: false });
          history.push(`/k8s/ns/${metadata.namespace}/registries/${metadata.name}`);
        },
        err => this.setState({ error: err.message, inProgress: false }),
      );
    }
  };

  render() {
    const { t } = this.props;
    const serviceTypes = [
      { value: 'ingress', title: t('RESOURCE:INGRESS') },
      { value: 'loadBalancer', title: t('CONTENT:LOADBALANCER') },
    ];

    const PVCTypes = [
      { value: 'exist', title: t('CONTENT:SELECTEXISTPVC') },
      { value: 'create', title: t('CONTENT:CREATENEWPVC') },
    ];

    const aceessModes = [
      { value: 'ReadWriteOnce', title: t('CONTENT:READWRITEONCE') },
      { value: 'ReadWriteMany', title: t('CONTENT:READWRITEMANY') },
    ];

    return (
      <div className="registry-edit co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:${this.state.registry.kind.toUpperCase()}`) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:${this.state.registry.kind.toUpperCase()}`) })}</h1>
          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onNameChanged} value={this.state.registry.metadata.name} id="registry-name" required />
            </Section>
            <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="registy-namespace" t={t} onChange={this.onNamespaceChanged} />
            </Section>
            <Section label={t('CONTENT:REGISTRYCREATIONIMAGE')} isRequired={true}>
              <input className="form-control" placeholder={t('STRING:REGISTRY-CREATE_0')} type="text" onChange={this.onImageChanged} value={this.state.registry.spec.image} id="registry-image" required />
              <span>{t('STRING:REGISTRY-CREATE_1')}</span>
            </Section>
            <Section label={t('CONTENT:LOGININFORMATION')} isRequired={true}>
              <LabelInput label={t('CONTENT:ID')} onChange={this.onIdChanged} value={this.state.registry.spec.loginId} id="registry-id" />
              <LabelInput label={t('CONTENT:PASSWORD')} onChange={this.onPwdChanged} value={this.state.registry.spec.loginPassword} id="registry-password" isPassword={true} />
              <LabelInput label={t('CONTENT:PASSWORDCONFIRM')} onChange={this.onPwdConfirmChanged} value={this.state.loginPwdConfirm} id="registry-password-confirm" isPassword={true} />
              <span>{t('STRING:REGISTRY-CREATE_2')}</span>
            </Section>
            <Section label={t('CONTENT:SERVICE')} isRequired={true}>
              <label>{t('CONTENT:SERVICETYPE')}</label>
              <RadioGroup currentValue={this.state.serviceType} items={serviceTypes} onChange={this.onServiceTypeChanged} formRow={true} />
              {this.state.serviceType === 'ingress' ? <LabelInput label={t('CONTENT:DOMAINNAME')} onChange={this.onServiceDomainNameChanged} value={this.state.domainName} id="registry-domain-name" placeholder="192.168.6.110.nip.io" /> : ''}
              <LabelInput label={t('CONTENT:PORT')} onChange={this.onServicePortChanged} value={this.state.port} id="registry-port" placeholder="1~65535" half />
              <span>{t('STRING:REGISTRY-CREATE_3')}</span>
            </Section>
            <Section label={t('CONTENT:PVC')} isRequired={true}>
              <RadioGroup currentValue={this.state.pvcType} items={PVCTypes} onChange={this.onPvcTypeChanged} formRow={true} />
              {this.state.pvcType === 'exist' ? (
                <PvcDropdown id="registy-pvc" t={t} onChange={this.onPvcChanged} namespace={this.state.registry.metadata.namespace} />
              ) : (
                <>
                  <label>{t('CONTENT:ACCESSMODES')}</label>
                  <RadioGroup currentValue={this.state.accessModes} items={aceessModes} onChange={this.onPVCAccessModeChanged} formRow={true} />
                  <LabelInput label={t('RESOURCE:STORAGESIZE')} onChange={this.onPVCStorageSizeChanged} value={this.state.storageSize} id="registry-storage-size" placeholder="10" half>
                    <SingleSelect options={RegistryFormComponent.storageSizeUnitOptions} value={this.state.storageSizeUnit} onChange={this.onPVCStorageSizeUnitChanged} />
                  </LabelInput>
                  <label>{t('CONTENT:STORAGECLASSNAME')}</label>
                  <ScDropdown id="registy-sc" t={t} onChange={this.onPVCStorageClassNameChanged} />
                </>
              )}
              <span style={{ marginTop: '5px' }}>{t('STRING:REGISTRY-CREATE_4')}</span>
            </Section>
            <Section label={t('CONTENT:LABELS')} isRequired={false}>
              <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
              <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                <p>{t('VALIDATION:LABEL_FORM')}</p>
              </div>
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('registries')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateRegistry = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <RegistryFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} registryTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

const PvcDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }
  const kind = openshiftFlag ? 'Project' : 'PersistentVolumeClaim';
  const resources = [{ kind, namespace: props.namespace }];
  const { t } = props;
  return <ListDropdown {...props} desc="PersistentVolumeClaim" resources={resources} selectedKeyKind={kind} placeholder={t('STRING:REGISTRY-CREATE_5')} />;
};

const PvcDropdown = connectToFlags(FLAGS.OPENSHIFT)(PvcDropdown_);

const ScDropdown_ = props => {
  const openshiftFlag = props.flags[FLAGS.OPENSHIFT];
  if (flagPending(openshiftFlag)) {
    return null;
  }
  const kind = openshiftFlag ? 'Project' : 'StorageClass';
  const resources = [{ kind }];
  const { t } = props;
  return <ListDropdown {...props} desc="StorageClass" resources={resources} selectedKeyKind={kind} placeholder={t('STRING:REGISTRY-CREATE_6')} />;
};

const ScDropdown = connectToFlags(FLAGS.OPENSHIFT)(ScDropdown_);

RegistryFormComponent.storageSizeUnitOptions = [
  { value: 'Mi', label: 'Mi' },
  { value: 'Gi', label: 'Gi' },
  { value: 'Ti', label: 'Ti' },
  { value: 'Pi', label: 'Pi' },
  { value: 'Ei', label: 'Ei' },
  { value: 'M', label: 'M' },
  { value: 'G', label: 'G' },
  { value: 'T', label: 'T' },
  { value: 'P', label: 'P' },
  { value: 'E', label: 'E' },
];

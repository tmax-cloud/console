/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
// import { NsDropdown } from '../RBAC/bindings';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';

// const Section = ({ label, children, isRequired }) => {
//   return (
//     <div className={'row form-group ' + (isRequired ? 'required' : '')}>
//       <div className="col-xs-2 control-label">
//         <strong>{label}</strong>
//       </div>
//       <div className="col-xs-10">{children}</div>
//     </div>
//   );
// };

const FirstSection = ({ label, children, isRequired }) => (
  <div className={'row form-group ' + (isRequired ? 'required' : '')}>
    <label className="col-xs-2 control-label" htmlFor="secret-type">
      {label}
    </label>
    <div className="col-xs-10">{children}</div>
  </div>
);

const SecondSection = ({ label, children, id }) => (
  <div className="row">
    <div className="col-xs-2">
      <div>{label}</div>
    </div>
    <div className="col-xs-2" id={id}>
      {children}
    </div>
  </div>
);

class StatefulSetFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingStatefulSet = _.pick(props.obj, ['metadata', 'type']);
    const statefulSet = _.defaultsDeep({}, props.fixed, existingStatefulSet, {
      apiVersion: 'v1',
      kind: 'StatefulSet',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        serviceName: '',
        replicas: '',
        selector: {
          matchLabels: {},
        },
        template: {
          // metadata: {
          //   labels: {},
          // },
        },
        volumeClaimTemplates: {
          metadata: {
            name: '',
          },
          spec: {
            accessModes: [],
            storageClassName: '',
            resources: {
              requests: {
                storage: '',
              },
            },
          },
        },
      },
    });

    this.state = {
      statefulSetTypeAbstraction: this.props.statefulSetTypeAbstraction,
      statefulSet: statefulSet,
      inProgress: false,
      type: 'form',
      quota: [['', '']],
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChanged(event) {
    let serviceAccount = { ...this.state.serviceAccount };
    serviceAccount.metadata.name = String(event.target.value);
    this.setState({ serviceAccount });
  }
  onNamespaceChanged(namespace) {
    let serviceAccount = { ...this.state.serviceAccount };
    serviceAccount.metadata.namespace = String(namespace);
    this.setState({ serviceAccount });
  }
  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.serviceAccount;
    this.setState({ inProgress: true });
    const newServiceAccount = _.assign({}, this.state.serviceAccount);

    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newServiceAccount) : k8sUpdate(ko, newServiceAccount, metadata.namespace, newServiceAccount.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push('/k8s/ns/' + metadata.namespace + '/serviceaccounts/' + metadata.name);
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;
    // let options = pipelineList.map(cur => {
    //   return <option value={cur.name}>{cur.name}</option>;
    // });
    let options = [<option>hi</option>];
    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:STATEFULSET-CREATE_0')}</p>

          <fieldset disabled={!this.props.isCreate}>
            <FirstSection label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.statefulSet.metadata.name} id="service-account-name" required />
            </FirstSection>
            <FirstSection label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="stateful-set-namespace" t={t} onChange={this.onNamespaceChanged} />
            </FirstSection>
            <FirstSection
              label={t('CONTENT:LABELS')}
              children={
                <div>
                  <div>
                    <div>
                      <SelectorInput labelClassName="co-text-namespace form-control" onChange={this.onLabelChanged} tags={[]} t={t} />
                    </div>
                  </div>
                  <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                    <p>{t('VALIDATION:LABEL_FORM')}</p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#696969' }}>
                    <p>{t('STRING:STATEFULSET-CREATE_1')}</p>
                  </div>
                </div>
              }
            />
            <FirstSection label={t('CONTENT:SERVICENAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={} value={} id="service-name" required />
            </FirstSection>
            <FirstSection label={t('CONTENT:REPLICA')} isRequired={true}>
              <input className="form-control" type="text" onChange={} value={} id="replica" required />
              <div style={{ fontSize: '12px', color: '#696969' }}>
                <p>{t('STRING:STATEFULSET-CREATE_2')}</p>
              </div>
            </FirstSection>
            <FirstSection label={t('CONTENT:PODTEMPLATE')} isRequired={false}>
              <div className="row">
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input type="radio" name="pod-template" onChange={} checked={} />
                  {t('CONTENT:IMAGEREGISTRY')}
                </div>
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input type="radio" name="pod-template" onChange={} checked={} />
                  {t('CONTENT:BYSELF')}
                </div>
              </div>
            </FirstSection>
            <FirstSection label={t('CONTENT:VOLUMECLAIMTEMPLATE')} isRequired={false}>
              <div className="row">
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input type="radio" name="volumeclaim-template" onChange={} checked={} />
                  {t('CONTENT:USE')}
                </div>
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input type="radio" name="volumeclaim-template" onChange={} checked={} />
                  {t('CONTENT:UNUSE')}
                </div>
              </div>
            </FirstSection>
            <FirstSection label={t('CONTENT:PERSISTENEVOLUMECLAIM')} isRequired={false}>
              <select className="form-control" onChange={} id="pipeline">
                {options}
              </select>
            </FirstSection>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('serviceaccounts')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateStatefulSet = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <StatefulSetFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} statefulSetTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

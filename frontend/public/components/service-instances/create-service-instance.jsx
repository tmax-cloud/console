/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Stepper from 'react-stepper-horizontal';
import { CardList } from '../card';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';

import { ButtonBar, Firehose, StatusBox, kindObj, history, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import * as k8sModels from '../../models';
import { coFetch } from '../../co-fetch';
import { k8sCreate } from '../../module/k8s';
import { NsDropdown } from '../RBAC';
import { TextFilter } from '../factory';
// import { element } from 'prop-types';

const ServiceInstanceTypeAbstraction = {
  generic: 'generic',
  form: 'form',
};

const determineServiceInstanceTypeAbstraction = () => {
  return 'form';
};

const Section = ({ label, children,  isRequired }) => (
  <div className={'row form-group ' + (isRequired ? 'required' : '')}>
    <div className="col-xs-2 control-label">
      <strong>{label}</strong>
    </div>
    <div className="col-xs-10">{children}</div>
  </div>
);

// withServiceInstanceForm returns SubForm which is a Higher Order Component for all the types of secret forms.
const withServiceInstanceForm = SubForm =>
  class ServiceInstanceFormComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        inProgress: false,
        serviceClass: 'Cluster',
        error: null,
        steps: this.props.steps,
        currentStep: 0,
        serviceInstance: {
          apiVersion: 'servicecatalog.k8s.io/v1beta1',
          kind: 'ServiceInstance',
          metadata: {
            name: '',
            namespace: props.namespace,
            labels: {},
          },
          spec: {
            clusterServiceClassName: '',
            clusterServicePlanName: '',
            parameters: {},
          },
        },
        NamespaceServiceInstance: {
          apiVersion: 'servicecatalog.k8s.io/v1beta1',
          kind: 'ServiceInstance',
          metadata: {
            name: '',
            namespace: props.namespace,
            labels: {},
          },
          spec: {
            serviceClassName: '',
            servicePlanName: '',
            parameters: {},
          },
        },
        classList: [],
        selectedClass: null,
        planList: [],
        selectedPlan: null,
        paramList: [],
        namespace: 'default'
      };
      // stepper
      this.onClickNext = this.onClickNext.bind(this);
      this.onClickBack = this.onClickBack.bind(this);

      // step1
      this.setKind = this.setKind.bind(this);
      this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
      this.getClassList = this.getClassList.bind(this);
      this.onChangeClass = this.onChangeClass.bind(this);

      // step2 서비스 플랜 선택
      this.onChangePlan = this.onChangePlan.bind(this);
      this.getPlanList = this.getPlanList.bind(this);

      // step3
      this.onNameChanged = this.onNameChanged.bind(this);
      this.getParams = this.getParams.bind(this);
      this.onParamValueChanged = this.onParamValueChanged.bind(this);
      this.onLabelChanged = this.onLabelChanged.bind(this);

      this.save = this.save.bind(this);
    }
    getClassList() {

      const url = this.state.serviceClass === 'Cluster' ? 'clusterserviceclasses' : `namespaces/${this.state.namespace}/serviceclasses`;

      coFetch(`/api/kubernetes/apis/${k8sModels.ClusterServiceBrokerModel.apiGroup}/${k8sModels.ClusterServiceBrokerModel.apiVersion}/${url}`)
        .then(res => res.json())
        .then(res => {
          const classListData = res.items.map(item => {
            return {
              name: _.get(item, 'metadata.name'),
              externalName: _.get(item, 'spec.externalName'),
              uid: _.get(item, 'metadata.uid'),
              description: _.get(item, 'spec.description') || '',
              imageUrl: _.get(item, 'spec.externalMetadata.imageUrl') || '',
              markdownDescription: _.get(item, 'spec.externalMetadata.markdownDescription') || '',
              urlDescription: _.get(item, 'spec.externalMetadata.urlDescription') || '',
              providerDisplayName: _.get(item, 'spec.externalMetadata.providerDisplayName') || '',
              recommend: _.get(item, 'spec.externalMetadata.recommend') || false,
              isNew: _.get(item, 'spec.externalMetadata.isNew') || false,
              ...item,
            };
          });
          this.setState({ classList: classListData });
        })
        .catch(error => {
          console.log('error', error);
        });
    }
    getPlanList() {

      const url = this.state.serviceClass === 'Cluster' ? 'clusterserviceplans' : `namespaces/${this.state.namespace}/serviceplans`;
      const ref = this.state.serviceClass === 'Cluster' ? 'spec.clusterServiceClassRef.name' : 'spec.serviceClassRef.name';

      coFetch(`/api/kubernetes/apis/${k8sModels.ClusterServicePlanModel.apiGroup}/${k8sModels.ClusterServicePlanModel.apiVersion}/${url}`)
        // coFetch(`/api/kubernetes/apis/${k8sModels.ServicePlanModel.apiGroup}/${k8sModels.ServicePlanModel.apiVersion}/serviceplans`)
        .then(res => res.json())
        .then(res => {
          const planListData = _.filter(res.items, [ref, this.state.selectedClass.name]).map(item => {
            return {
              name: _.get(item, 'metadata.name'),
              uid: _.get(item, 'metadata.uid'),
              description: _.get(item, 'spec.description') || '',
              bullets: _.get(item, 'spec.externalMetadata.bullets') || [],
              amount: _.get(item, 'spec.externalMetadata.costs.amount') || '',
              unit: _.get(item, 'spec.externalMetadata.costs.unit') || '$',
              ...item,
            };
          });
          this.setState({ planList: planListData });
        })
        .catch(error => {
          console.log('error', error);
        });
    }
    getParams() {
      const selectedClass = this.state.selectedClass;
      if (!selectedClass) {
        return;
      }
      coFetch(`/api/kubernetes/apis/${k8sModels.TemplateModel.apiGroup}/${k8sModels.TemplateModel.apiVersion}/namespaces/${this.state.namespace}/templates/${selectedClass.name}`)
        .then(res => res.json())
        .then(res => {
          let paramList = res.parameters.map(function (parm) {
            return { name: parm.name, defaultValue: parm.value, value: '', description: parm.description, required: parm.required, displayName: parm.displayName };
          });
          if (paramList.length) {
            this.setState({
              paramList: paramList,
            });
          }
        });
    }
    onClickBack(e) {
      e.preventDefault();
      const { currentStep } = this.state;
      this.setState({
        error: null,
        currentStep: currentStep - 1,
      });
    }
    onClickNext(e) {
      e.preventDefault();
      this.setState(prevState => {
        let resource = '';
        //step별 validation추가
        //step1 에서 service class선택 안한 경우
        if (prevState.currentStep === 0 && prevState.selectedClass) {
          return {
            error: null,
            currentStep: 1,
          };
        } else if (prevState.currentStep === 1 && prevState.selectedPlan) {
          return {
            error: null,
            currentStep: 2,
          };
        } else {
          return (prevState.error = prevState.currentStep === 0 ? 'Select Service Class' : 'Select Service Plan');
        }
      });
    }
    onChangeClass(selectedClass) {
      this.setState(
        () => {
          return { selectedClass: _.cloneDeep(selectedClass) };
        },
        () => {
          this.getPlanList();
          this.getParams();
        },
      );
    }
    onChangePlan(selectedPlan) {
      this.setState({
        selectedPlan: _.cloneDeep(selectedPlan),
      });
    }
    onNameChanged(e) {
      const serviceInstance = _.cloneDeep(this.state.serviceInstance);
      serviceInstance.metadata.name = e.target.value;
      this.setState({ serviceInstance });
    }
    onParamValueChanged(e) {
      let key = event.target.id;
      const serviceInstance = _.cloneDeep(this.state.serviceInstance);
      _.set(serviceInstance, `spec.parameters.${key}`, e.target.value);
      this.setState({
        serviceInstance: serviceInstance,
      });
    }
    onLabelChanged(event) {
      const serviceInstance = _.cloneDeep(this.state.serviceInstance);
      serviceInstance.metadata.labels = {};
      if (event.length !== 0) {
        event.forEach(item => {
          if (item.split('=')[1] === undefined) {
            document.getElementById('labelErrMsg').style.display = 'block';
            event.pop(item);
            return;
          }
          document.getElementById('labelErrMsg').style.display = 'none';
          serviceInstance.metadata.labels[item.split('=')[0]] = item.split('=')[1];
        });
      }
      this.setState({ serviceInstance });
    }
    save(e) {
      e.preventDefault();
      const { kind } = this.state.serviceInstance;
      const newServiceInstance = _.cloneDeep(this.state.serviceInstance);

      if(this.state.serviceClass==="Cluster"){
        newServiceInstance.spec.clusterServiceClassName = this.state.selectedClass.name;
        newServiceInstance.spec.clusterServicePlanName = this.state.selectedPlan.name;
        newServiceInstance.metadata.namespace = this.state.namespace;
        
        const ko = kindObj(kind);
        //     if (this.state.serviceInstance.metadata.name) {
        this.setState({ inProgress: true });
  
  
        k8sCreate(ko, newServiceInstance).then(
          () => {
            this.setState({ inProgress: false });
            history.push(formatNamespacedRouteForResource('serviceinstances'));
          },
          err => this.setState({ error: err.message, inProgress: false }),
        );
      }
      else {
        const newNamespaceInstance = _.cloneDeep(this.state.NamespaceServiceInstance);
        newNamespaceInstance.metadata = newServiceInstance.metadata;
        newNamespaceInstance.metadata.namespace = this.state.namespace;
        newNamespaceInstance.spec.parameters = newServiceInstance.spec.parameters;
        newNamespaceInstance.spec.serviceClassName = this.state.selectedClass.name;
        newNamespaceInstance.spec.servicePlanName = this.state.selectedPlan.name;

        const ko = kindObj(kind);
        //     if (this.state.serviceInstance.metadata.name) {
        this.setState({ inProgress: true });
  
  
        k8sCreate(ko, newNamespaceInstance).then(
          () => {
            this.setState({ inProgress: false });
            history.push(formatNamespacedRouteForResource('serviceinstances'));
          },
          err => this.setState({ error: err.message, inProgress: false }),
        );
      }
    }
    componentDidMount() {
      this.getClassList();
      // this.getPlanList();
      // this.getParams();
    }

    componentDidUpdate(prevProps, prevState) {
      if ( !_.isEqual(prevState.namespace, this.state.namespace) || !_.isEqual(prevState.serviceClass, this.state.serviceClass)) {
        this.getClassList();
      }  
      return;
    }

    setKind(e){
      this.setState({
        serviceClass: e.target.value,
        namespace : 'default'
      });
    }

    onNamespaceChanged(namespace) {
      this.setState({
        namespace : String(namespace)
      });
    }

    render() {
      const { t } = this.props;
      const title = t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('ServiceInstance', t) });
      const { steps, currentStep, selectedClass, selectedPlan, paramList, errorMessage } = this.state;
      const ServicePlanList = ({ planList, onChangePlan, selectedPlan }) => {
        return (
          <div className="row">
            <div className="col-xs-2">
              <strong>{t('CONTENT:SERVICEPLAN')}</strong>
            </div>
            <div className="col-xs-10">
              {planList.map(item => (
                <ServicePlanItem item={item} key={item.uid} onChangePlan={onChangePlan} selectedPlan={selectedPlan} />
              ))}
            </div>
          </div>
        );
      };
      return (
        <div className="co-m-pane__body">
          <Helmet>
            <title>{title}</title>
          </Helmet>
          {/* <form className="co-m-pane__body-group co-create-service-instance-form" onSubmit={() => this.save}> */}
          <div className="co-m-pane__body-group co-create-service-instance-form form-group">
            <h1 className="co-m-pane__heading">{title}</h1>
            {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}
            <Stepper steps={steps} activeStep={currentStep} />
            <div className="separator"></div>
            {/* stepper */}
            {currentStep === 0 && (
              <div className="rbac-edit-binding">
                <Section label={'서비스 클래스 분류'}>
                  <form>
                    <label className="radio-inline" style={{ marginRight: '50px' }}>
                      <input type="radio" name = "ServiceClass" value="Cluster" checked={this.state.serviceClass === 'Cluster'} 
                      onChange={this.setKind}/> {t('RESOURCE:CLUSTERSERVICECLASS')}
                    </label>
                    <label className="radio-inline" style={{ marginRight: '50px' }}>
                      <input type="radio" name = "ServiceClass" value="Namespace" checked={this.state.serviceClass === 'Namespace'}
                      onChange={this.setKind}/> {'네임스페이스 서비스 클래스'}
                    </label>
                  </form>
                </Section>
                {this.state.serviceClass === "Namespace" && (
                  <Section label={t('CONTENT:NAMESPACE')}>
                    <NsDropdown id="namespace" t={t} defaultValue={this.state.namespace} onChange={this.onNamespaceChanged} />
                    <p style={{color: '#777'}}>{"접근 권한이 있는 네임스페이스에서 서비스 클래스를 선택합니다."}</p>
                  </Section>
                )}
                <div className="separator"></div>
                {this.state.classList.length > 0 ? (
                <div>
                  <div className = "row form-group">
                    <div className = "col-xs-2 control-label">
                      <b style={{fontSize : "16px"}}>{"서비스 클래스 목록"}</b>
                    </div>
                    {/* <div className = "co-m-pane__filter-bar-group co-m-pane__filter-bar-group--filter">
                      <TextFilter id="serviceClass" autoFocus={true} onChange={e => this.applyFilter(textFilter, e.target.value)}></TextFilter>
                    </div> */}
                  </div>
                  <CardList classList={this.state.classList} onChangeClass={this.onChangeClass} selectedClass={selectedClass} />
                  <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
                    <div style={{ marginTop: '15px' }}>
                      <button type="button" className="btn btn-primary" onClick={this.onClickNext}>
                        {t('CONTENT:NEXT')}
                      </button>
                      <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                        {t('CONTENT:CANCEL')}
                      </Link>
                    </div>
                  </ButtonBar>
                </div>
              ) : (
                <div>{t('STRING:SERVICEINSTANCE-CREATE_3')}</div>
              )}
              </div>
            )}
            {currentStep === 1 &&
              (this.state.classList.length > 0 ? (
                <div>
                  <ServicePlanList planList={this.state.planList} onChangePlan={this.onChangePlan} selectedPlan={selectedPlan} />
                  <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
                    <div style={{ marginTop: '15px' }}>
                      <button type="button" className="btn btn-default" onClick={this.onClickBack}>
                        {t('CONTENT:BACK')}
                      </button>
                      <button type="button" className="btn btn-primary" onClick={this.onClickNext}>
                        {t('CONTENT:NEXT')}
                      </button>
                      <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                        {t('CONTENT:CANCEL')}
                      </Link>
                    </div>
                  </ButtonBar>
                </div>
              ) : (
                <div>{t('STRING:SERVICEINSTANCE-CREATE_4')}</div>
              ))}
            {currentStep === 2 && (
              <form onSubmit={this.save}>
                <Section label={t('RESOURCE:SERVICEINSTANCE')}>
                  <div className = "registry-edit " >
                    <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                      {t('CONTENT:NAME')}
                    </label>
                    <input className="form-control" type="text" onChange={this.onNameChanged} id="application-name" required />
                    <p className="help-block" id="secret-name-help"></p>
                    <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                      {t('CONTENT:NAMESPACE')}
                    </label >
                    <NsDropdown id="namespace" fixed={this.state.serviceClass==="Namespace"} t={t}
                    selectedKey={this.state.namespace} t={t} onChange={this.onNamespaceChanged} />
                  </div>
                </Section>
                <div className="separator"></div>
                {paramList.length > 0 && (
                  <Section label={t('CONTENT:PARAMETERS')} key="params">
                    {paramList.map((parameter, index) => {
                      let defaultValue = parameter.defaultValue ? `${parameter.defaultValue}` : '';
                      let isRequired = parameter.required ? true : false;
                      return (
                        <div>
                          <div className="row">
                            <div className={'col-xs-2 form-group ' + (isRequired ? 'required' : '')}>
                              <div className="control-label">{parameter.displayName}</div>
                            </div>
                            <div className="col-xs-5" id={parameter.name}>
                              <input onChange={this.onParamValueChanged} className="form-control" type="text" placeholder={defaultValue} id={parameter.name} required={isRequired} />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-xs-2" />
                            <p className="col-xs-10" style={{color: '#777'}}>{parameter.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </Section>
                )}
                <div className="separator"></div>
                <Section label={t('CONTENT:LABELS')} isRequired={false}>
                  <div className = "registry-edit " >
                    <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
                    <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                      <p>{t('VALIDATION:LABEL_FORM')}</p>
                    </div>
                  </div>
                </Section>
                <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
                  <div style={{ marginTop: '15px' }}>
                    <button type="button" className="btn btn-default" onClick={this.onClickBack}>
                      {t('CONTENT:BACK')}
                    </button>
                    <button type="submit" className="btn btn-primary" id="save-changes">
                      {t('CONTENT:CREATE')}
                    </button>
                    <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                      {t('CONTENT:CANCEL')}
                    </Link>
                  </div>
                </ButtonBar>
              </form>
            )}
          </div>
          {/* <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
            <div style={{ marginTop: '15px' }}>
              {currentStep !== 0 && (
                <button type="button" className="btn btn-default" onClick={this.onClickBack}>
                  {t('CONTENT:BACK')}
                </button>
              )}
              {currentStep !== 2 && (
                <button type="button" className="btn btn-primary" onClick={this.onClickNext}>
                  {t('CONTENT:NEXT')}
                </button>
              )}
              {currentStep === 2 && !errorMessage && (
                <button type="submit" className="btn btn-primary" id="save-changes">
                  {t('CONTENT:CREATE')}
                </button>
              )}
              <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </div>
          </ButtonBar> */}
        </div>
      );
    }
  };

class BasicServiceInstanceForm extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <React.Fragment>
        <div className="form-group">
          <label className="control-label" htmlFor="secret-type">
            구현예정
          </label>
          <div>
            <select className="form-control" id="secret-type">
              {/* <option value={1}>Basic Authentication</option>
            <option value={2}>SSH Key</option> */}
            </select>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const serviceInstanceFormFactory = serviceInstanceType => {
  return serviceInstanceType === ServiceInstanceTypeAbstraction.form ? withServiceInstanceForm(BasicServiceInstanceForm) : withServiceInstanceForm(BasicServiceInstanceForm);
};

const ServiceInstanceLoadingWrapper = props => {
  const ServiceInstanceTypeAbstraction = determineServiceInstanceTypeAbstraction(_.get(props.obj.data, 'data'));
  const ServiceInstanceFormComponent = serviceInstanceFormFactory(ServiceInstanceTypeAbstraction);
  const { t } = useTranslation();
  // const fixed = _.reduce(props.fixedKeys, (acc, k) => ({...acc, k: _.get(props.obj.data, k)}), {});
  return (
    <StatusBox {...props.obj}>
      <ServiceInstanceFormComponent
        t={t}
        {...props}
        ServiceInstanceTypeAbstraction={ServiceInstanceTypeAbstraction}
        obj={props.obj.data}
        // fixed={fixed}
        // explanation={serviceInstanceFormExplanation[ServiceInstanceTypeAbstraction]}
      />
    </StatusBox>
  );
};

export const CreateServiceInstance = ({ match: { params } }) => {
  const { t } = useTranslation();
  const steps = [
    {
      title: t('STRING:SERVICEINSTANCE-CREATE_0'),
    },
    {
      title: t('STRING:SERVICEINSTANCE-CREATE_1'),
    },
    {
      title: t('STRING:SERVICEINSTANCE-CREATE_2'),
    },
  ];
  const ServiceInstanceFormComponent = serviceInstanceFormFactory(params.type);
  return <ServiceInstanceFormComponent namespace={params.ns} t={t} steps={steps} />;
};

export const EditServiceInstance = ({ match: { params }, kind }) => (
  <Firehose resources={[{ kind: kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
    <ServiceInstanceLoadingWrapper fixedKeys={['kind', 'metadata']} titleVerb="Edit" saveButtonText="Save Changes" />
  </Firehose>
);

const ServicePlanItem = ({ item, onChangePlan, selectedPlan }) => {
  const { description, bullets, amount, unit } = item;
  const bulletList = bullets.map((bullet, index) => <li key={index}>{bullet}</li>);
  const paramObj = item.spec.instanceCreateParameterSchema ? item.spec.instanceCreateParameterSchema : [];
  let paramList = Object.keys(paramObj).map(function (key) {
    return `${key}:${paramObj[key]}`;
  });
  paramList = paramList.map((param, index) => <li key={index}>{param}</li>);
  const _onClickPlan = servicePlan => {
    onChangePlan(servicePlan);
  };
  return (
    <div>
      <div style={{ display: 'inline-flex' }}>
        <input type="radio" name="servicePlan" onChange={() => _onClickPlan(item)} checked={selectedPlan && selectedPlan.uid === item.uid}></input>
        <div onClick={() => _onClickPlan(item)}>
          <b>{item.spec.externalName}</b>
          <br></br>
          <span>{description}</span>
          <br></br>
          {bullets.length > 0 && (
            <div>
              <span>제공 기능</span>
              <br></br>
              {bulletList}
            </div>
          )}
          {paramList.length > 0 && (
            <div>
              <span>파라미터</span>
              <br></br>
              {paramList}
            </div>
          )}
          {amount !== '' && amount !== 0 && (
            <div>
              <span>플랜 요금</span>
              <br></br>
              <span>{amount}</span>
              <span>{unit}</span>
            </div>
          )}
        </div>
      </div>
      <div className="separator"></div>
    </div>
  );
};

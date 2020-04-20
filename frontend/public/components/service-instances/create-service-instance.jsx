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
// import { element } from 'prop-types';

const ServiceInstanceTypeAbstraction = {
  generic: 'generic',
  form: 'form',
};

const determineServiceInstanceTypeAbstraction = () => {
  return 'form';
};

const Section = ({ label, children }) => (
  <div className="row">
    <div className="col-xs-2">
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
        classList: [],
        selectedClass: null,
        planList: [],
        selectedPlan: null,
        paramList: [],
      };
      // stepper
      this.onClickNext = this.onClickNext.bind(this);
      this.onClickBack = this.onClickBack.bind(this);

      // step1
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
      coFetch(`/api/kubernetes/apis/${k8sModels.ClusterServiceBrokerModel.apiGroup}/${k8sModels.ClusterServiceBrokerModel.apiVersion}/clusterserviceclasses`)
        .then(res => res.json())
        .then(res => {
          const classListData = res.items.map(item => {
            return {
              name: _.get(item, 'metadata.name'),
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
      coFetch(`/api/kubernetes/apis/${k8sModels.ClusterServicePlanModel.apiGroup}/${k8sModels.ClusterServicePlanModel.apiVersion}/clusterserviceplans`)
        // coFetch(`/api/kubernetes/apis/${k8sModels.ServicePlanModel.apiGroup}/${k8sModels.ServicePlanModel.apiVersion}/serviceplans`)
        .then(res => res.json())
        .then(res => {
          const planListData = _.filter(res.items, ['spec.clusterServiceClassRef.name', this.state.selectedClass.name]).map(item => {
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
      coFetch(`/api/kubernetes/apis/${k8sModels.TemplateModel.apiGroup}/${k8sModels.TemplateModel.apiVersion}/namespaces/default/templates/${selectedClass.name}`)
        .then(res => res.json())
        .then(res => {
          let paramList = res.parameters.map(function (parm) {
            return { name: parm.name, value: '' };
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
            currentStep: 1
          };
        } else if (prevState.currentStep === 1 && prevState.selectedPlan) {
          return {
            error: null,
            currentStep: 2
          };
        }
        else {
          return prevState.error = prevState.currentStep === 0 ? 'Select Service Class' : 'Select Service Plan'
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
      newServiceInstance.spec.clusterServiceClassName = this.state.selectedClass.name;
      newServiceInstance.spec.clusterServicePlanName = this.state.selectedPlan.name;
      const ko = kindObj(kind);
      if (this.state.serviceInstance.metadata.name) {
        this.setState({ inProgress: true });
        k8sCreate(ko, newServiceInstance).then(
          () => {
            this.setState({ inProgress: false });
            history.push(formatNamespacedRouteForResource('serviceinstances'));
          },
          err => this.setState({ error: err.message, inProgress: false }),
        );
      } else {
        this.setState({ error: "Name is required." });
      }

    }
    componentDidMount() {
      this.getClassList();
      // this.getPlanList();
      // this.getParams();
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
          <form className="co-m-pane__body-group co-create-service-instance-form">
            <h1 className="co-m-pane__heading">{title}</h1>
            {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}
            <Stepper steps={steps} activeStep={currentStep} />
            <div className="separator"></div>
            {/* stepper */}
            {currentStep === 0 && (this.state.classList.length > 0 ? <CardList classList={this.state.classList} onChangeClass={this.onChangeClass} selectedClass={selectedClass} /> : <div>{t('STRING:SERVICEINSTANCE-CREATE_3')}</div>)}
            {currentStep === 1 && (this.state.classList.length > 0 ? <ServicePlanList planList={this.state.planList} onChangePlan={this.onChangePlan} selectedPlan={selectedPlan} /> : <div>{t('STRING:SERVICEINSTANCE-CREATE_4')}</div>)}
            {currentStep === 2 && (
              <React.Fragment>
                <div className="row">
                  <div className="col-xs-2">
                    <strong>{t('RESOURCE:SERVICEINSTANCE')}</strong>
                  </div>
                  <div className="col-xs-10">
                    <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                      {t('CONTENT:NAME')}
                    </label>
                    <input className="form-control" type="text" onChange={this.onNameChanged} id="application-name" required />
                    <p className="help-block" id="secret-name-help"></p>
                  </div>
                </div>
                {paramList.length > 0 && (
                  <React.Fragment>
                    <div className="separator"></div>
                    <Section label={t('CONTENT:PARAMETERS')} key="params">
                      {paramList.map((parameter, index) => (
                        <React.Fragment key={index}>
                          <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                            {parameter.name}
                          </label>
                          <input className="form-control" type="text" placeholder={t('CONTENT:VALUE')} id={parameter.name} onChange={this.onParamValueChanged} required />
                        </React.Fragment>
                      ))}
                    </Section>
                  </React.Fragment>
                )}
                <div className="separator"></div>
                <div className="row">
                  <div className="col-xs-2">
                    <strong>{t('CONTENT:LABELS')}</strong>
                  </div>
                  <div className="col-xs-10">
                    <SelectorInput labelClassName="co-text-namespace" onChange={this.onLabelChanged} tags={[]} />
                    <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                      <p>{t('VALIDATION:LABEL_FORM')}</p>
                    </div>
                  </div>
                </div>
                {/* <SubForm /> */}
              </React.Fragment>
            )}
          </form>
          <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
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
                <button type="submit" className="btn btn-primary" id="save-changes" onClick={this.save}>
                  {t('CONTENT:CREATE')}
                </button>
              )}
              <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </div>
          </ButtonBar>
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
  const { name, description, bullets, amount, unit } = item;
  const bulletList = bullets.map((bullet, index) => <li key={index}>{bullet}</li>);
  const _onClickPlan = servicePlan => {
    onChangePlan(servicePlan);
  };
  return (
    <div>
      <div style={{ display: 'inline-flex' }}>
        <input type="radio" name="servicePlan" onChange={() => _onClickPlan(item)} checked={selectedPlan && selectedPlan.uid === item.uid}></input>
        <div onClick={() => _onClickPlan(item)}>
          <b>{name}</b>
          <br></br>
          <span>{description}</span>
          {bullets.length > 0 && bulletList}
          <span>{amount}</span>
          <span> {unit}</span>
        </div>
      </div>
      <div className="separator"></div>
    </div>
  );
};

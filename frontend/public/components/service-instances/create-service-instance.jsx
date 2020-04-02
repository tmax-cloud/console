/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Stepper from 'react-stepper-horizontal';
import { CardList } from '../card';

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

// export enum SecretType {
//   basicAuth = 'kubernetes.io/basic-auth',
//   dockercfg = 'kubernetes.io/dockercfg',
//   dockerconfigjson = 'kubernetes.io/dockerconfigjson',
//   opaque = 'Opaque',
//   serviceAccountToken = 'kubernetes.io/service-account-token',
//   sshAuth = 'kubernetes.io/ssh-auth',
//   tls = 'kubernetes.io/tls',
// }

// export type BasicAuthSubformState = {
//   username: string,
//   password: string,
// };

// const serviceInstanceFormExplanation = {
//   [ServiceInstanceTypeAbstraction.form]: '클러스터 서비스 인스턴스 생성을 위한 폼 에디터.',
// };

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
        steps: [
          {
            title: 'Select Service Class',
          },
          {
            title: 'Select Service Plan',
          },
          {
            title: 'Service Instance Settings',
          },
        ],
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
      coFetch(
        `/api/kubernetes/apis/${k8sModels.ClusterServiceBrokerModel.apiGroup}/${k8sModels.ClusterServiceBrokerModel.apiVersion}/clusterserviceclasses`,
      )
        // coFetch(`/api/kubernetes/apis/${k8sModels.ServiceInstanceModel.apiGroup}/${k8sModels.ServiceInstanceModel.apiVersion}/serviceclasses`)
        .then(res => res.json())
        .then(res => {
          const classListData = res.items.map(item => {
            return {
              name: _.get(item, 'metadata.name'),
              uid: _.get(item, 'metadata.uid'),
              description: _.get(item, 'spec.description') || '',
              imageUrl: _.get(item, 'spec.externalMetadata.imageUrl') || '',
              longDescription: _.get(item, 'spec.externalMetadata.longDescription') || '',
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
      coFetch(
        `/api/kubernetes/apis/${k8sModels.ClusterServicePlanModel.apiGroup}/${k8sModels.ClusterServicePlanModel.apiVersion}/clusterserviceplans`,
      )
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
      coFetch(
        `/api/kubernetes/apis/${k8sModels.TemplateModel.apiGroup}/${k8sModels.TemplateModel.apiVersion}/namespaces/default/templates/${selectedClass.name}`,
      )
        .then(res => res.json())
        .then(res => {
          let stringobj = JSON.stringify(res.objects);
          let param = [];
          for (let i = 0; i < stringobj.length; i++) {
            let word = '';
            if (stringobj[i] === '$') {
              let n = i + 2;
              if (stringobj[n - 1] === '{') {
                while (stringobj[n] !== '}') {
                  word = word + stringobj[n];
                  n++;
                }
                param.push(word);
              }
            }
          }
          let paramList = Array.from(new Set(param));
          if (paramList.length) {
            let parameters = [];
            paramList.forEach(key => {
              let newObj = { name: key, value: '' };
              parameters.push(newObj);
            });
          }
          this.setState({
            paramList: paramList,
          });
        });
    }
    onClickBack(e) {
      e.preventDefault();
      const { currentStep } = this.state;
      this.setState({
        currentStep: currentStep - 1,
      });
    }
    onClickNext(e) {
      e.preventDefault();
      this.setState(prevState => {
        return {
          currentStep: prevState.currentStep + 1,
        };
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
      this.setState({ inProgress: true });
      const newServiceInstance = _.cloneDeep(this.state.serviceInstance);
      newServiceInstance.spec.clusterServiceClassName = this.state.selectedClass.name;
      newServiceInstance.spec.clusterServicePlanName = this.state.selectedPlan.name;
      const ko = kindObj(kind);

      k8sCreate(ko, newServiceInstance).then(
        () => {
          this.setState({ inProgress: false });
          history.push(formatNamespacedRouteForResource('serviceinstances'));
        },
        err => this.setState({ error: err.message, inProgress: false }),
      );
    }
    componentDidMount() {
      this.getClassList();
      // this.getPlanList();
      // this.getParams();
    }
    render() {
      const title = 'Create Service Instance';
      const { steps, currentStep, selectedClass, selectedPlan, paramList } = this.state;
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
            {currentStep === 0 &&
              (this.state.classList.length > 0 ? (
                <CardList classList={this.state.classList} onChangeClass={this.onChangeClass} selectedClass={selectedClass} />
              ) : (
                  <div>No Service Class Found</div>
                ))}
            {currentStep === 1 &&
              (this.state.classList.length > 0 ? (
                <ServicePlanList planList={this.state.planList} onChangePlan={this.onChangePlan} selectedPlan={selectedPlan} />
              ) : (
                  <div>No Service Plan Found</div>
                ))}
            {currentStep === 2 && (
              <React.Fragment>
                <div className="row">
                  <div className="col-xs-2">
                    <strong>Service Instance</strong>
                  </div>
                  <div className="col-xs-10">
                    <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                      Service Instance Name
                    </label>
                    <input className="form-control" type="text" onChange={this.onNameChanged} id="application-name" required />
                    <p className="help-block" id="secret-name-help"></p>
                  </div>
                </div>
                {paramList.length > 0 && (
                  <React.Fragment>
                    <div className="separator"></div>
                    <Section label="Parameter" key="params">
                      {paramList.map((parameter, index) => (
                        <React.Fragment key={index}>
                          <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                            {parameter}
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="value"
                            id={parameter}
                            onChange={this.onParamValueChanged}
                            required
                          />
                        </React.Fragment>
                      ))}
                    </Section>
                  </React.Fragment>
                )}
                <div className="separator"></div>
                <div className="row">
                  <div className="col-xs-2">
                    <strong>Label</strong>
                  </div>
                  <div className="col-xs-10">
                    <SelectorInput labelClassName="co-text-namespace" onChange={this.onLabelChanged} tags={[]} />
                    <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                      <p>Lables must be "key=value" form.</p>
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
                  Back
                </button>
              )}
              {currentStep !== 2 && (
                <button type="button" className="btn btn-primary" onClick={this.onClickNext}>
                  Next
                </button>
              )}
              {currentStep === 2 && (
                <button type="submit" className="btn btn-primary" id="save-changes" onClick={this.save}>
                  Create
                </button>
              )}
              <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                Cancel
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
  return serviceInstanceType === ServiceInstanceTypeAbstraction.form
    ? withServiceInstanceForm(BasicServiceInstanceForm)
    : withServiceInstanceForm(BasicServiceInstanceForm);
};

const ServiceInstanceLoadingWrapper = props => {
  const ServiceInstanceTypeAbstraction = determineServiceInstanceTypeAbstraction(_.get(props.obj.data, 'data'));
  const ServiceInstanceFormComponent = serviceInstanceFormFactory(ServiceInstanceTypeAbstraction);
  // const fixed = _.reduce(props.fixedKeys, (acc, k) => ({...acc, k: _.get(props.obj.data, k)}), {});
  return (
    <StatusBox {...props.obj}>
      <ServiceInstanceFormComponent
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
  const ServiceInstanceFormComponent = serviceInstanceFormFactory(params.type);
  return <ServiceInstanceFormComponent namespace={params.ns} />;
};

export const EditServiceInstance = ({ match: { params }, kind }) => (
  <Firehose resources={[{ kind: kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
    <ServiceInstanceLoadingWrapper fixedKeys={['kind', 'metadata']} titleVerb="Edit" saveButtonText="Save Changes" />
  </Firehose>
);

const ServicePlanList = ({ planList, onChangePlan, selectedPlan }) => {
  return (
    <div className="row">
      <div className="col-xs-2">
        <strong>Service Plan</strong>
      </div>
      <div className="col-xs-10">
        {planList.map(item => (
          <ServicePlanItem item={item} key={item.uid} onChangePlan={onChangePlan} selectedPlan={selectedPlan} />
        ))}
      </div>
    </div>
  );
};

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

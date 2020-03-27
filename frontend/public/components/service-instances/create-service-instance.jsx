/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Stepper from 'react-stepper-horizontal';
import { CardList } from '../card';

import { ButtonBar, Firehose, StatusBox, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import * as k8sModels from '../../models';
import { coFetch } from '../../co-fetch';
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

const determineServiceInstanceTypeAbstraction = data => {
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
      const serviceInstance = {
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
      };
      this.state = {
        inProgress: false,
        error: null,
        steps: [
          {
            title: '서비스 클래스 선택',
          },
          {
            title: '서비스 플랜 선택',
          },
          {
            title: '서비스 인스턴스 설정',
          },
        ],
        currentStep: 0,
        serviceInstance: serviceInstance,
        classList: [],
        selectedClassId: null,
        planList: [],
        selectedPlanId: null,
        paramList: [],
      };
      this.onClickNext = this.onClickNext.bind(this);
      this.onClickBack = this.onClickBack.bind(this);
      this.onChangeClass = this.onChangeClass.bind(this);
      this.onChangePlan = this.onChangePlan.bind(this);
      this.getParams = this.getParams.bind(this);
      this.getClassList = this.getClassList.bind(this);
      this.getPlanList = this.getPlanList.bind(this);
      this.onParamValueChanged = this.onParamValueChanged.bind(this);
      this.onLabelChanged = this.onLabelChanged.bind(this);
    }
    getClassList() {
      coFetch(`/api/kubernetes/apis/${k8sModels.ServiceInstanceModel.apiGroup}/${k8sModels.ServiceInstanceModel.apiVersion}/namespaces/${this.props.namespace}/serviceclasses`)
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
      coFetch(`/api/kubernetes/apis/${k8sModels.ServicePlanModel.apiGroup}/${k8sModels.ServicePlanModel.apiVersion}/namespaces/${this.props.namespace}/serviceplans`)
        // coFetch(`/api/kubernetes/apis/${k8sModels.ServicePlanModel.apiGroup}/${k8sModels.ServicePlanModel.apiVersion}/serviceplans`)
        .then(res => res.json())
        .then(res => {
          const planListData = res.items.map(item => {
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
      const selectedClass = _.find(this.state.classList, { uid: this.state.selectedClassId });
      if (!selectedClass) {
        return;
      }
      coFetch(`/api/kubernetes/apis/${k8sModels.TemplateModel.apiGroup}/${k8sModels.TemplateModel.apiVersion}/namespaces/${this.props.namespace}/templates/${selectedClass.name}`)
        .then(res => res.json())
        .then(res => {
          console.log('params', res);
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
            //paramList가 ['key1','key2']인경우 [{name: key1, value : 'value'},{name: key2, value : 'value'}]로 만들어야 함
            let parameters = [];
            paramList.forEach(key => {
              let newObj = { name: key, value: '' };
              parameters.push(newObj);
            });
          }
          console.log('parameters', paramList);
          this.setState({
            paramList: paramList,
          });
        });
    }
    onClickBack() {
      const { currentStep } = this.state;
      this.setState({
        currentStep: currentStep - 1,
      });
    }
    onClickNext() {
      const { currentStep } = this.state;
      this.setState({
        currentStep: currentStep + 1,
      });
    }
    onChangeClass(id) {
      this.setState(
        () => {
          return { selectedClassId: id };
        },
        () => {
          this.getParams();
        },
      );
    }
    onChangePlan(id) {
      this.setState({
        selectedPlanId: id,
      });
    }
    onParamValueChanged(e) {
      let key = event.target.id;
      const serviceInstance = _.cloneDeep(this.state.serviceInstance);
      _.set(serviceInstance, `spec.parameters.${key}`, e.target.value);
      // serviceInstance.spec.template.parameters.forEach(obj => {
      //   if (obj.name === key) {
      //     obj.value = event.target.value;
      //   }
      // });
      this.setState({
        serviceInstance: serviceInstance,
      });
    }
    onLabelChanged(event) {
      const serviceInstance = { ...this.state.serviceInstance };
      //console.log(event);
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
      // const { kind, metadata } = this.state.serviceInstance;
      //   this.setState({ inProgress: true });

      //   const newSecret = _.assign({}, this.state.serviceInstance);
      //   const ko = kindObj(kind);
      //   // console.log(_.assign({}, this.state.serviceInstance));
      //   // return;
      //   (this.props.isCreate
      //       ? k8sCreate(ko, newSecret)
      //       : k8sUpdate(ko, newSecret, metadata.namespace, newSecret.metadata.name)
      //   ).then(() => {
      //       this.setState({ inProgress: false });
      //       console.log(this.state)
      //       history.push(formatNamespacedRouteForResource('serviceinstances'));
      //   }, err => this.setState({ error: err.message, inProgress: false }));
    }
    componentDidMount() {
      this.getClassList();
      this.getPlanList();
      // this.getParams();
    }
    render() {
      const title = '서비스 인스턴스 생성';
      const { steps, currentStep, selectedClassId, selectedPlanId, paramList } = this.state;
      console.log('paramList', paramList);
      return (
        <div className="co-m-pane__body">
          <Helmet>
            <title>{title}</title>
          </Helmet>
          <form className="co-m-pane__body-group co-create-service-instance-form" onSubmit={this.save}>
            <h1 className="co-m-pane__heading">{title}</h1>
            {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}
            <Stepper steps={steps} activeStep={currentStep} />
            <div className="separator"></div>
            {/* stepper */}
            {currentStep === 0 && <CardList classList={this.state.classList} onChangeClass={this.onChangeClass} selectedClassId={selectedClassId} />}
            {currentStep === 1 && (
              <React.Fragment>
                <ServicePlanList planList={this.state.planList} onChangePlan={this.onChangePlan} selectedPlanId={selectedPlanId} />
              </React.Fragment>
            )}
            {currentStep === 2 && (
              <React.Fragment>
                <div className="row">
                  <div className="col-xs-2">
                    <strong>서비스 인스턴스</strong>
                  </div>
                  <div className="col-xs-10">
                    <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                      서비스 인스턴스 이름
                    </label>
                    <input className="form-control" type="text" id="application-name" required />
                    <p className="help-block" id="secret-name-help"></p>
                  </div>
                </div>
                <div className="separator"></div>
                <Section label="파라미터" key="params">
                  {paramList.map((parameter, index) => (
                    <React.Fragment key={index}>
                      <label htmlFor="role-binding-name" className="rbac-edit-binding__input-label">
                        {parameter}
                      </label>
                      <input className="form-control" type="text" placeholder="value" id={parameter} onChange={this.onParamValueChanged} required />
                    </React.Fragment>
                  ))}
                </Section>
                <div className="separator"></div>
                <div className="row">
                  <div className="col-xs-2">
                    <strong>레이블</strong>
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

            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <div style={{ marginTop: '15px' }}>
                {currentStep !== 0 && (
                  <button type="submit" className="btn btn-default" onClick={this.onClickBack}>
                    이전
                  </button>
                )}
                {currentStep !== 2 && (
                  <button className="btn btn-primary" onClick={this.onClickNext}>
                    다음
                  </button>
                )}
                {currentStep === 2 && (
                  <button type="submit" className="btn btn-primary" id="save-changes">
                    생성
                  </button>
                )}
                <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                  취소
                </Link>
              </div>
            </ButtonBar>
          </form>
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

class ServicePlanList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { planList, onChangePlan, selectedPlanId } = this.props;
    return (
      <div className="row">
        <div className="col-xs-2">
          <strong>서비스 플랜</strong>
        </div>
        <div className="col-xs-10">
          {planList.map(item => (
            <ServicePlanItem item={item} key={item.uid} onChangePlan={onChangePlan} selectedPlanId={selectedPlanId} />
          ))}
        </div>
      </div>
    );
  }
}

const ServicePlanItem = ({ item, onChangePlan, selectedPlanId }) => {
  const { name, description, bullets, amount, unit } = item;
  const bulletList = bullets.map((bullet, index) => <li key={index}>{bullet}</li>);
  const _onChangePlan = e => {
    onChangePlan(e.target.value);
  };
  const _onClickPlan = uid => {
    onChangePlan(uid);
  };
  return (
    <div>
      <div style={{ display: 'inline-flex' }}>
        <input type="radio" name="servicePlan" value={item.uid} onChange={_onChangePlan} checked={selectedPlanId === item.uid}></input>
        <div onClick={() => _onClickPlan(item.uid)}>
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

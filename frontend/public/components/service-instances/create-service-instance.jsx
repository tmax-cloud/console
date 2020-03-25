/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Stepper from 'react-stepper-horizontal';
import { CardList } from '../card';

import { Firehose, StatusBox } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import * as k8sModels from '../../models';
import { coFetch } from '../../co-fetch';

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

// TODO: 프로젝트, 이미지 버전 list - selectbox / namespace 생성 - 이름, 설명
// 어플리케이션 이름, Git 레파지토리 url, 메모리 한도, 네임스페이스 이름, DB 서비스 이름, ...등등

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

// withServiceInstanceForm returns SubForm which is a Higher Order Component for all the types of secret forms.
const withServiceInstanceForm = SubForm =>
  class ServiceInstanceFormComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        classList: [],
        steps: [
          {
            title: '서비스 클래스 선택',
          },
          {
            title: '서비스 인스턴스 설정',
          },
        ],
        currentStep: 0,
      };
      this.onClickNext = this.onClickNext.bind(this);
      this.onClickBack = this.onClickBack.bind(this);
    }
    getClassList() {
      // coFetch(`/api/kubernetes/apis/${k8sModels.ServiceInstanceModel.apiGroup}/${k8sModels.ServiceInstanceModel.apiVersion}/namespaces/${this.props.namespace}/serviceclasses`)
      coFetch(`/api/kubernetes/apis/${k8sModels.ServiceInstanceModel.apiGroup}/${k8sModels.ServiceInstanceModel.apiVersion}/serviceclasses`)
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
              isActive: false,
            };
          });
          this.setState({ classList: classListData });
        })
        .catch(error => {
          // this.state.templateList = [];
          console.log('error', error);
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
    save(e) {
      e.preventDefault();
    }
    componentDidMount() {
      this.getClassList();
    }
    render() {
      const title = 'Create Service Instance';
      const { steps, currentStep } = this.state;
      return (
        <div className="co-m-pane__body">
          <Helmet>
            <title>{title}</title>
          </Helmet>
          <form className="co-m-pane__body-group co-create-service-instance-form" onSubmit={this.save}>
            <h1 className="co-m-pane__heading">{title}</h1>
            {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}
            <Stepper steps={steps} activeStep={currentStep} />
            {/* stepper */}
            {currentStep === 0 && <CardList classList={this.state.classList} />}
            {currentStep === 1 && (
              <React.Fragment>
                <div className="form-group">
                  <label className="control-label" htmlFor="name">
                    어플리케이션 이름
                  </label>
                  <div>
                    <input className="form-control" type="text" id="application-name" required />
                    <p className="help-block" id="secret-name-help"></p>
                  </div>
                </div>
                <SubForm />
              </React.Fragment>
            )}

            {/* <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} > */}
            <div style={{ marginTop: '15px' }}>
              {currentStep === 1 && (
                <button type="submit" className="btn btn-default" onClick={this.onClickBack}>
                  Back
                </button>
              )}
              {currentStep === 0 && (
                <button className="btn btn-primary" onClick={this.onClickNext}>
                  Next
                </button>
              )}
              {currentStep === 1 && (
                <button type="submit" className="btn btn-primary" id="save-changes">
                  Create
                </button>
              )}
              <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">
                Cancel
              </Link>
            </div>
            {/* </ButtonBar> */}
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
            프로젝트
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

// class BasicAuthSubform extends React.Component {
//   constructor (props) {
//     super(props);
//     this.state = {
//       username: this.props.stringData.username || '',
//       password: this.props.stringData.password || '',
//     };
//     this.changeData = this.changeData.bind(this);
//   }
//   changeData(event) {
//     this.setState({
//       [event.target.name]: event.target.value
//     } as BasicAuthSubformState, () => this.props.onChange(this.state));
//   }
//   render() {
//     return <React.Fragment>
//       <div className="form-group">
//         <label className="control-label" htmlFor="username">Username</label>
//         <div>
//           <input className="form-control"
//             id="username"
//             aria-describedby="username-help"
//             type="text"
//             name="username"
//             onChange={this.changeData}
//             value={this.state.username} />
//           <p className="help-block" id="username-help">Optional username for Git authentication.</p>
//         </div>
//       </div>
//       <div className="form-group">
//         <label className="control-label" htmlFor="password">Password or Token</label>
//         <div>
//           <input className="form-control"
//             id="password"
//             aria-describedby="password-help"
//             type="password"
//             name="password"
//             onChange={this.changeData}
//             value={this.state.password}
//             required />
//           <p className="help-block" id="password-help">Password or token for Git authentication. Required if a ca.crt or .gitconfig file is not specified.</p>
//         </div>
//       </div>
//     </React.Fragment>;
//   }
// }

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

/* eslint-enable no-undef */

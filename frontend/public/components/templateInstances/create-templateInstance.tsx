/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, Firehose, history, kindObj, StatusBox, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import * as k8sModels from '../../models';
import { coFetch } from '../../co-fetch';

enum CreateType {
  generic = 'generic',
  form = 'form',
}
const pageExplanation = {
  [CreateType.form]: '폼 형식을 통한 템플릿 인스턴스 생성',
};

const determineCreateType = (data) => {
  return CreateType.form;
};

const Section = ({ label, children, id }) => <div className="row">
  <div className="col-xs-2">
    <div>{label}</div>
  </div>
  <div className="col-xs-2" id={id}>
    {children}
  </div>
</div>;

// Requestform returns SubForm which is a Higher Order Component for all the types of secret forms.
const Requestform = (SubForm) => class SecretFormComponent extends React.Component<BaseEditSecretProps_, BaseEditSecretState_> {
  constructor(props) {
    console.log(props)
    super(props);
    const existingTemplateInstance = _.pick(props.obj, ['metadata', 'type']);
    const templateInstance = _.defaultsDeep({}, props.fixed, existingTemplateInstance, {
      apiVersion: 'tmax.io/v1',
      kind: "TemplateInstance",
      metadata: {
        name: '',
      },
      spec: {
        template: {
          metadata: {
            name: ''
          },
          parameters: []
        }
      }
    });

    this.state = {
      secretTypeAbstraction: this.props.secretTypeAbstraction,
      templateInstance: templateInstance,
      inProgress: false,
      templateList: [],
      paramList: [],
      editParamList: true,
      selectedTemplate: ''
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onTemplateChanged = this.onTemplateChanged.bind(this);
    this.getParams = this.getParams.bind(this);
    this.onParamValueChanged = this.onParamValueChanged.bind(this);
    this.save = this.save.bind(this);
  }
  onNameChanged(event) {
    let templateInstance = { ...this.state.templateInstance };
    templateInstance.metadata.name = event.target.value;
    this.setState({ templateInstance });
  }
  getParams() {
    const namespace = document.location.href.split('ns/')[1].split('/')[0];
    let templateInstance = { ...this.state.templateInstance };
    let template = this.state.selectedTemplate;
    coFetch('/api/kubernetes/apis/' + k8sModels.TemplateModel.apiGroup + '/' + k8sModels.TemplateModel.apiVersion + '/namespaces/' + namespace + '/templates/' + template)
      .then(res => res.json())
      .then((myJson) => {
        let stringobj = JSON.stringify(myJson.objects);
        let param = [];
        for (let i = 0; i < stringobj.length; i++) {
          let word = ''
          if (stringobj[i] === '$') {
            let n = i + 2;
            if (stringobj[n - 1] == '{') {
              while (stringobj[n] !== '}') {
                word = word + stringobj[n];
                n++
              } param.push(word)
            }
          }
        }
        let paramList = Array.from(new Set(param));
        if (paramList.length) {
          //paramList가 ['key1','key2']인경우 [{name: key1, value : 'value'},{name: key2, value : 'value'}]로 만들어야 함 
          let parameters = [];
          paramList.forEach((key) => {
            let newObj = { name: key, value: '' };
            parameters.push(newObj)
          })
          templateInstance.spec.template.parameters = parameters;
          this.setState({
            paramList: paramList,
            editParamList: false,
            templateInstance: templateInstance
          });
        } else {
          this.setState({
            paramList: [],
            editParamList: false
          });
        }
      },
        //컴포넌트의 실제 버그에서 발생하는 예외사항들을 넘기지 않도록 에러를 이 부분에서 처리
        (error) => {
          this.setState({
            error
          });
        }
      )
      .catch(function (myJson) {
        console.log(myJson);
      });
  }
  onTemplateChanged(event) {
    let templateInstance = { ...this.state.templateInstance };
    templateInstance.spec.template.metadata.name = event.target.value;
    this.setState({
      selectedTemplate: event.target.value,
      editParamList: true,
      templateInstance: templateInstance
    });
  }
  onParamValueChanged(event) {
    console.log('onParamValueChanged불림')
    let key = event.target.id
    let templateInstance = { ...this.state.templateInstance };
    templateInstance.spec.template.parameters.forEach(obj => {
      if (obj.name === key) {
        obj.value = event.target.value;
      }
    });
    this.setState({
      templateInstance: templateInstance
    });
  }
  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.templateInstance;
    this.setState({ inProgress: true });

    const newSecret = _.assign({}, this.state.templateInstance);
    const ko = kindObj(kind);
    (this.props.isCreate
      ? k8sCreate(ko, newSecret)
      : k8sUpdate(ko, newSecret, metadata.namespace, newSecret.metadata.name)
    ).then(() => {
      this.setState({ inProgress: false });
      history.push('/k8s/ns/' + metadata.namespace + '/templateinstances');
    }, err => this.setState({ error: err.message, inProgress: false }));
  }
  getTemplateList() {
    const namespace = document.location.href.split('ns/')[1].split('/')[0];
    coFetch('/api/kubernetes/apis/' + k8sModels.TemplateModel.apiGroup + '/' + k8sModels.TemplateModel.apiVersion + '/namespaces/' + namespace + '/templates')
      .then(res => res.json())
      .then((myJson) => {
        let templateList = myJson.items.map(function (template) {
          return template.metadata.name
        });
        this.setState({
          templateList: templateList,
          selectedTemplate: templateList[0],
          editParamList: true
        });
      },
        (error) => {
          this.setState({
            error
          });
        }
      )
      .catch(function (myJson) {
        this.state.templateList = [];
      });
  }
  componentDidMount() {
    this.getTemplateList();
    this.getParams();
  }
  render() {
    const { templateList, paramList } = this.state;
    let options = templateList.map(function (template) {
      return <option value={template}>{template}</option>;
    });
    // onchange에  getPatrams()바인딩. 초기에도 불리도록 수정 
    if (this.state.editParamList) {
      this.getParams();
    }
    let paramDivs = paramList.map((parameter) => {
      return <Section label={parameter} id={parameter}>
        <input onChange={this.onParamValueChanged} className="form-control" type="text" placeholder="value" id={parameter} required />
      </Section>
    });

    return <div className="co-m-pane__body">
      < Helmet >
        <title>템플릿 인스턴스 생성</title>
      </Helmet >
      <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
        <h1 className="co-m-pane__heading">템플릿 인스턴스 생성</h1>
        <p className="co-m-pane__explanation">{this.props.explanation}</p>
        <fieldset disabled={!this.props.isCreate}>
          <div className="form-group">
            <label className="control-label" htmlFor="secret-name">템플릿 인스턴스 이름</label>
            <div>
              <input className="form-control"
                type="text"
                onChange={this.onNameChanged}
                value={this.state.templateInstance.metadata.name}
                id="template-instance-name"
                required />
            </div>
          </div>
          <div className="form-group">
            <label className="control-label" htmlFor="secret-type" >템플릿</label>
            <div>
              <select onChange={this.onTemplateChanged} className="form-control" id="template">
                {options}
              </select>
            </div>
          </div>
        </fieldset>
        <label className="control-label" htmlFor="secret-name">Parameters </label>
        <div>
          {paramDivs}
        </div>
        <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
          <button type="submit" className="btn btn-primary" id="save-changes">{this.props.saveButtonText || 'Create'}</button>
          <Link to={formatNamespacedRouteForResource('templateinstances')} className="btn btn-default" id="cancel">Cancel</Link>
        </ButtonBar>
      </form>
    </div >;
  }
};


class SourceSecretForm extends React.Component<SourceSecretFormProps> {
  constructor(props) {
    super(props);
    this.state = {
      stringData: this.props.stringData || {},
    };
    this.onDataChanged = this.onDataChanged.bind(this);
  }
  onDataChanged(secretsData) {
    this.setState({
      stringData: { ...secretsData },
    }, () => this.props.onChange(this.state));
  }
  render() {
    return <React.Fragment>
    </React.Fragment>;
  }
}

const secretFormFactory = secretType => {
  return secretType === CreateType.form ? Requestform(SourceSecretForm) : Requestform(SourceSecretForm);
};

const SecretLoadingWrapper = props => {
  const secretTypeAbstraction = determineCreateType(_.get(props.obj.data, 'data'));
  const SecretFormComponent = secretFormFactory(secretTypeAbstraction);
  const fixed = _.reduce(props.fixedKeys, (acc, k) => ({ ...acc, k: _.get(props.obj.data, k) }), {});
  return <StatusBox {...props.obj}>
    <SecretFormComponent {...props}
      secretTypeAbstraction={secretTypeAbstraction}
      obj={props.obj.data}
      fixed={fixed}
      explanation={pageExplanation[secretTypeAbstraction]}
    />
  </StatusBox>;
};

export const CreateTemplateInstance = ({ match: { params } }) => {
  const SecretFormComponent = secretFormFactory(params.type);
  return <SecretFormComponent fixed={{ metadata: { namespace: params.ns } }}
    secretTypeAbstraction={params.type}
    explanation={pageExplanation[params.type]}
    titleVerb="Create"
    isCreate={true}
  />;
};

export const EditSecret = ({ match: { params }, kind }) => <Firehose resources={[{ kind: kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
  <SecretLoadingWrapper fixedKeys={['kind', 'metadata']} titleVerb="Edit" saveButtonText="Save Changes" />
</Firehose>;


export type BaseEditSecretState_ = {
  secretTypeAbstraction?: CreateType,
  templateInstance: K8sResourceKind,
  inProgress: boolean,
  error?: any,
  templateList: Array<any>,
  paramList: Array<any>,
  editParamList: boolean,
  selectedTemplate: string
};

export type BaseEditSecretProps_ = {
  obj?: K8sResourceKind,
  fixed: any,
  kind?: string,
  isCreate: boolean,
  titleVerb: string,
  secretTypeAbstraction?: CreateType,
  saveButtonText?: string,
  explanation: string,
};

export type SourceSecretFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string
  },
  isCreate: boolean,
};
/* eslint-enable no-undef */

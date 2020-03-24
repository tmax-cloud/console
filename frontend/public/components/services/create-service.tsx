/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, Firehose, history, kindObj, StatusBox, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';

enum CreateType {
    generic = 'generic',
    form = 'form',
}
const pageExplanation = {
    [CreateType.form]: '폼 형식을 통한 템플릿 서비스 생성',
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

const Requestform = (SubForm) => class SecretFormComponent extends React.Component<BaseEditSecretProps_, BaseEditSecretState_> {

    constructor(props) {
        super(props);
        const existingSecret = _.pick(props.obj, ['metadata', 'type']);
        const secret = _.defaultsDeep({}, props.fixed, existingSecret, {
            apiVersion: 'v1',
            data: {},
            kind: 'Service',
            metadata: {
                name: '',
            },
        });

        this.state = {
            secretTypeAbstraction: this.props.secretTypeAbstraction,
            secret: secret,
            inProgress: false,
            stringData: _.mapValues(_.get(props.obj, 'data'), window.atob),
            templateList: [],
            paramList: [],
            selectedTemplate: ''
        };
        this.onDataChanged = this.onDataChanged.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);
        this.getParams = this.getParams.bind(this);
        this.save = this.save.bind(this);
    }
    onDataChanged(secretsData) {
        this.setState({
            stringData: { ...secretsData.stringData }
        });
    }
    onNameChanged(event) {
        let secret = { ...this.state.secret };
        secret.metadata.name = event.target.value;
        this.setState({ secret });
    }
    getParams() {
        console.log('getParams시작')
        // coFetch('/api/kubernetes/apis/' + k8sModels.TemplateModel.apiGroup + '/' + k8sModels.TemplateModel.apiVersion + '/namespaces/' + namespace + '/templates/' + template)
        //     .then(res => res.json())
        //     .then((myJson) => {
        //         let stringobj = JSON.stringify(myJson.objects);
        //         let param = [];
        //         console.log(stringobj)
        //         for (let i = 0; i < stringobj.length; i++) {
        //             let word = ''
        //             if (stringobj[i] === '$') {
        //                 let n = i + 2;
        //                 while (stringobj[n] !== '}') {
        //                     word = word + stringobj[n];
        //                     n++
        //                 } param.push(word)
        //             }

        //         }
        //         let paramList = Array.from(new Set(param));
        //         console.log(paramList);
        //         if (paramList.length) {
        //             this.setState({
        //                 paramList: paramList
        //             });
        //         }
        //     },
        //         //컴포넌트의 실제 버그에서 발생하는 예외사항들을 넘기지 않도록 에러를 이 부분에서 처리
        //         (error) => {
        //             this.setState({
        //                 error
        //             });
        //         }
        //     )
        //     .catch(function (myJson) {
        //         console.log(myJson);
        //     });
    }
    onTemplateChanged(event) {
        this.setState({
            selectedTemplate: event.target.value
        });
        console.log(event.target.value);
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.secret;
        this.setState({ inProgress: true });

        const newSecret = _.assign({}, this.state.secret, { stringData: this.state.stringData });
        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newSecret)
            : k8sUpdate(ko, newSecret, metadata.namespace, newSecret.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            history.push(formatNamespacedRouteForResource('templateinstances'));
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    componentDidMount() {
        this.getParams();
    }
    render() {
        const { paramList } = this.state;
        // onchange에  getPatrams()바인딩. 초기에도 불리도록 수정 
        this.getParams();
        let paramDivs = paramList.map(function (parameter) {
            return <Section label={parameter} id={parameter}>
                <input className="form-control" type="text" placeholder="value" required id="role-binding-name" />
            </Section>
        });

        return <div className="co-m-pane__body">
            < Helmet >
                <title>서비스 생성</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">서비스 생성</h1>
                <p className="co-m-pane__explanation">{this.props.explanation}</p>

                <fieldset disabled={!this.props.isCreate}>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">서비스 이름</label>
                        <div>
                            <input className="form-control"
                                type="text"
                                onChange={this.onNameChanged}
                                value={this.state.secret.metadata.name}
                                aria-describedby="secret-name-help"
                                id="secret-name"
                                required />
                            <p className="help-block" id="secret-name-help">Unique name of the new service Instance.</p>
                        </div>
                    </div>

                </fieldset>
                <label className="control-label" htmlFor="secret-name">Parameters </label>
                <div>
                    {paramDivs}
                </div>
                <React.Fragment>
                    <div className="form-group">
                        <label className="control-label" htmlFor="username">Label</label>
                        <div>
                            <SelectorInput labelClassName="co-text-namespace" tags={[]} />
                        </div>
                    </div>
                </React.Fragment>
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

export const CreateService = ({ match: { params } }) => {
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
    secret: K8sResourceKind,
    inProgress: boolean,
    stringData: { [key: string]: string },
    error?: any,
    templateList: Array<any>,
    paramList: Array<any>,
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

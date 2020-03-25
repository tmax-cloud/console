/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, Firehose, history, kindObj, StatusBox } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
// import * as k8sModels from '../../models';
// import { coFetch } from '../../co-fetch';
// import { AsyncComponent } from '../utils/async';
enum CreateType {
    generic = 'generic',
    form = 'form',
}
const pageExplanation = {
    [CreateType.form]: '폼 형식을 통한 파이프라인 리소스 생성',
};

const determineCreateType = (data) => {
    return CreateType.form;
};

// const Section = ({ label, children, id }) => <div className="row">
//     <div className="col-xs-2">
//         <div>{label}</div>
//     </div>
//     <div className="col-xs-2" id={id}>
//         {children}
//     </div>
// </div>;

// const NameValueEditorComponent = (props) => <AsyncComponent loader={() => import('../utils/name-value-editor.jsx').then(c => c.NameValueEditor)} {...props} />;

// Requestform returns SubForm which is a Higher Order Component for all the types of secret forms.
const Requestform = (SubForm) => class SecretFormComponent extends React.Component<BaseEditSecretProps_, BaseEditSecretState_> {
    constructor(props) {
        super(props);
        const existingSecret = _.pick(props.obj, ['metadata', 'type']);
        const secret = _.defaultsDeep({}, props.fixed, existingSecret, {
            apiVersion: 'v1',
            // apiGroup: "tmax.io",
            data: {},
            kind: "PipelineResource",
            metadata: {
                name: '',
                namespace: _.pick(props.obj, ['metadata', 'namespace'])
            },
            spec: {
                params: []
            }
        });

        this.state = {
            secretTypeAbstraction: this.props.secretTypeAbstraction,
            secret: secret,
            inProgress: false,
            stringData: _.mapValues(_.get(props.obj, 'data'), window.atob),
            pipelineResourceTypeList: ['git', 'image'],
            selectedPipelineResourceType: 'git',
        };
        this.onDataChanged = this.onDataChanged.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onTypeChanged = this.onTypeChanged.bind(this);
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
    onTypeChanged(event) {
        this.setState({
            selectedPipelineResourceType: event.target.value,
        });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.secret;
        this.setState({ inProgress: true });

        const newSecret = _.assign({}, this.state.secret, { stringData: this.state.stringData });
        const ko = kindObj(kind);
        console.log(kind); // Secret 
        console.log(this.state.stringData); // null 
        console.log(this.state.secret); // 여기에 metadata, data, kind 가 들어감
        return;
        (this.props.isCreate
            ? k8sCreate(ko, newSecret)
            : k8sUpdate(ko, newSecret, metadata.namespace, newSecret.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            console.log(this.state)
            history.push(formatNamespacedRouteForResource('services'));
        }, err => this.setState({ error: err.message, inProgress: false }));
    }
    // componentDidMount() {
        
    // }
    render() {
        const { pipelineResourceTypeList } = this.state;
        let options = pipelineResourceTypeList.map(function (type_) {
            return <option value={type_}>{type_}</option>;
        });
        
        return <div className="co-m-pane__body">
            < Helmet >
                <title>파이프라인 리소스 생성</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">파이프라인 리소스 생성</h1>
                <p className="co-m-pane__explanation">{this.props.explanation}</p>

                <fieldset disabled={!this.props.isCreate}>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">파이프라인 리소스 이름</label>
                        <div>
                            <input className="form-control"
                                type="text"
                                onChange={this.onNameChanged}
                                value={this.state.secret.metadata.name}
                                id="template-instance-name"
                                required />
                            <p className="help-block" id="secret-name-help">Unique name of the new service Instance.</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-type" >유형</label>
                        <div>
                            <select onChange={this.onTypeChanged} className="form-control" id="template">
                                {options}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <label className="control-label" htmlFor="secret-name">Parameters </label>
                {/* Type = git 일 때*/}
                { (this.state.selectedPipelineResourceType === 'git') && <div>
                <div className="form-group col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                key
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                value
                            </div>
                        </div>
                        <div className="form-group col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="key" required />
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="value" />
                            </div>
                        </div>
                        <div className="form-group col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                key
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                value
                            </div>
                        </div>
                        <div className="form-group col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="key" required />
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="value" />
                            </div>
                        </div>
                </div> }
                {/* Type = image 일 때*/}
                { (this.state.selectedPipelineResourceType !== 'git') && <div>
                <div className="form-group col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                key
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                value
                            </div>
                        </div>
                        <div className="form-group col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="key" required />
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="value" />
                            </div>
                        </div>
                </div> }
                {/* <NameValueEditorComponent nameValuePairs={[""]} nameString="name" valueString="value" /> */}
                {/*
                <React.Fragment>
                    <div className="form-group">
                        <label className="control-label" htmlFor="username">Label</label>
                        <div>
                            <SelectorInput labelClassName="co-text-namespace" tags={[]} />
                        </div>
                    </div>
                     <div className="form-group">
            <label className="control-label" htmlFor="password">Annotation</label>
            <div className="row">
              <div className="col-xs-2">
                <input className="form-control" type="text" placeholder="key" />
              </div>
              <div className="col-xs-2" >
                <input className="form-control" type="text" placeholder="value" />
              </div>
            </div>
          </div> 
                </React.Fragment>*/}
                <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                    <div style={{marginTop: '10px'}}>
                    <button type="submit" className="btn btn-primary" id="save-changes">{this.props.saveButtonText || 'Create'}</button>
                    <Link to={formatNamespacedRouteForResource('pipelineresources')} className="btn btn-default" id="cancel">Cancel</Link>
                    </div>
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

export const CreatePipelineResources = ({ match: { params } }) => {
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
    
    pipelineResourceTypeList: Array<any>,
    selectedPipelineResourceType: string,
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

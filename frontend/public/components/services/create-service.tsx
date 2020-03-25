/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, Firehose, history, kindObj, StatusBox, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { PortEditor } from '../utils/port-editor';
enum CreateType {
    generic = 'generic',
    form = 'form',
}
const pageExplanation = {
    [CreateType.form]: '폼 형식을 통한 서비스 생성',
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
            spec: {
                ports: [{
                    protocol: 'TCP',
                    port: 80,
                    targetPort: 9376
                }]

            }

        });

        this.state = {
            secretTypeAbstraction: this.props.secretTypeAbstraction,
            secret: secret,
            inProgress: false,
            stringData: _.mapValues(_.get(props.obj, 'data'), window.atob),
            selectorList: _.isEmpty(props.selectorList) ? [['', '']] : _.toPairs(props.selectorList),
            paramList: [['', '', '', '']],
            selectedTemplate: '',
            ports: [['','','','']]
        };

        this.onDataChanged = this.onDataChanged.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);
        this.getParams = this.getParams.bind(this);
        this.save = this.save.bind(this);
        this._updatePorts = this._updatePorts.bind(this);
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

    }
    onTemplateChanged(event) {
        this.setState({
            selectedTemplate: event.target.value
        });
        console.log(event.target.value);
    }
    _updatePorts(ports) {
      this.setState({
        ports: ports.portPairs
      });
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
            console.log(this.state)
            history.push(formatNamespacedRouteForResource('services'));
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    componentDidMount() {
        this.getParams();
    }
    render() {
        // const { paramList } = this.state;
        // onchange에  getPatrams()바인딩. 초기에도 불리도록 수정 
        this.getParams();
        // let paramDivs = paramList.map(function (parameter) {
        //     return <Section label={parameter} id={parameter}>
        //         <input className="form-control" type="text" placeholder="value" required id="role-binding-name" />
        //     </Section>
        // });

        return <div className="co-m-pane__body">
            < Helmet >
                <title>서비스 생성</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">서비스 생성</h1>
                <p className="co-m-pane__explanation">{this.props.explanation}</p>

                <fieldset disabled={!this.props.isCreate}>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">Name</label>
                        <div>
                            <input className="form-control"
                                type="text"
                                onChange={this.onNameChanged}
                                value={this.state.secret.metadata.name}
                                aria-describedby="secret-name-help"
                                id="secret-name"
                                required />

                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">Port</label>
                        <PortEditor portPairs={this.state.ports}  updateParentData={this._updatePorts} />
                        {/* <div className="col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                name
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                protocol
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                port
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                targetPort
                            </div>
                        </div> */}
                        <div className="col-md-12 col-xs-12">
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="name" required />
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <select className="form-control" id="protocol">
                                    <option value='TCP'>TCP</option>
                                    <option value='UDP'>UDP</option>
                                    <option value='SCDP'>SCDP</option>
                                </select>
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="port" required />
                            </div>
                            <div className="col-md-2 col-xs-2 pairs-list__name-field">
                                <input className="form-control" type="text" placeholder="targetPort" />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">Selector</label>
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
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-type" >Type</label>
                        <div>
                            <select className="form-control" id="secret-type">
                                <option >Cluster IP</option>
                                <option >External Name</option>
                                <option >Load Balancer</option>
                                <option >Node Port</option>
                            </select>
                        </div>
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
                        <Link to={formatNamespacedRouteForResource('services')} className="btn btn-default" id="cancel">Cancel</Link>
                    </ButtonBar>
                </fieldset>
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
    selectorList: Array<any>,
    paramList: Array<any>,
    selectedTemplate: string,
    ports: Array<any>
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

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
    [CreateType.form]: '',
};

const determineCreateType = (data) => {
    return CreateType.form;
};

const Requestform = (SubForm) => class ServiceFormComponent extends React.Component<BaseEditServiceProps_, BaseEditServiceState_> {
    constructor(props) {
        super(props);
        const existingService = _.pick(props.obj, ['metadata', 'type']);
        const service = _.defaultsDeep({}, props.fixed, existingService, {
            apiVersion: 'v1',
            data: {},
            kind: 'Service',
            metadata: {
                name: '',
            },
            spec: {
                ports: [{
                    protocol: 'TCP',
                    port: 80
                }]

            }

        });

        this.state = {
            secretTypeAbstraction: this.props.secretTypeAbstraction,
            secret: service,
            inProgress: false,
            stringData: _.mapValues(_.get(props.obj, 'data'), window.atob),
            selectorList: _.isEmpty(props.selectorList) ? [['', '']] : _.toPairs(props.selectorList),
            portList: [['', '', '', '']],
            type: '',
            paramList: [],
            selectedTemplate: '',
            ports: [['', '', 'TCP', '']]
        };
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onTypeChanged = this.onTypeChanged.bind(this);
        this.save = this.save.bind(this);
        this._updatePorts = this._updatePorts.bind(this);
    }
    onNameChanged(event) {
        let secret = { ...this.state.secret };
        secret.metadata.name = event.target.value;
        this.setState({ secret });
    }
    onTypeChanged(event) {
        this.setState({
            type: event.target.value
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
    }

    render() {
        return <div className="co-m-pane__body">
            < Helmet >
                <title>Create Service</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">Create Service</h1>
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
                                id="service-name"
                                required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">Port</label>
                        <PortEditor portPairs={this.state.ports} updateParentData={this._updatePorts} />
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
    return Requestform(SourceSecretForm);
};



const SecretLoadingWrapper = props => {
    const secretTypeAbstraction = determineCreateType(_.get(props.obj.data, 'data'));
    const ServiceFormComponent = secretFormFactory(secretTypeAbstraction);
    const fixed = _.reduce(props.fixedKeys, (acc, k) => ({ ...acc, k: _.get(props.obj.data, k) }), {});
    return <StatusBox {...props.obj}>
        <ServiceFormComponent {...props}
            secretTypeAbstraction={secretTypeAbstraction}
            obj={props.obj.data}
            fixed={fixed}
            explanation={pageExplanation[secretTypeAbstraction]}
        />
    </StatusBox>;
};

export const CreateService = ({ match: { params } }) => {
    const ServiceFormComponent = secretFormFactory(params.type);
    return <ServiceFormComponent fixed={{ metadata: { namespace: params.ns } }}
        secretTypeAbstraction={params.type}
        explanation={pageExplanation[params.type]}
        titleVerb="Create"
        isCreate={true}
    />;
};

export const EditSecret = ({ match: { params }, kind }) => <Firehose resources={[{ kind: kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
    <SecretLoadingWrapper fixedKeys={['kind', 'metadata']} titleVerb="Edit" saveButtonText="Save Changes" />
</Firehose>;


export type BaseEditServiceState_ = {
    secretTypeAbstraction?: CreateType,
    secret: K8sResourceKind,
    inProgress: boolean,
    stringData: { [key: string]: string },
    error?: any,
    portList: Array<any>,
    selectorList: Array<any>,
    type: string
    paramList: Array<any>,
    selectedTemplate: string,
    ports: Array<any>
};

export type BaseEditServiceProps_ = {
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

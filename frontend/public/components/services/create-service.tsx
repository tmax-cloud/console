/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, Firehose, history, kindObj, StatusBox, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { AdvancedPortEditor } from '../utils/advanced-port-editor';
import { KeyValueEditor } from '../utils/key-value-editor';

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
            kind: 'Service',
            metadata: {
                name: '',
            },
            spec: {
                ports: [],
                selector: {}
            }
        });

        this.state = {
            serviceTypeAbstraction: this.props.serviceTypeAbstraction,
            service: service,
            inProgress: false,
            selectorList: _.isEmpty(props.selectorList) ? [['', '']] : _.toPairs(props.selectorList),
            type: '',
            paramList: [],
            selectedTemplate: '',
            ports: [['', '', 'TCP', '']],
            selector: [['', '']]
        };
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onTypeChanged = this.onTypeChanged.bind(this);
        this.save = this.save.bind(this);
        this._updatePorts = this._updatePorts.bind(this);
        this._updateSelector = this._updateSelector.bind(this);
        this.onLabelChanged = this.onLabelChanged.bind(this);
    }
    onNameChanged(event) {
        let service = { ...this.state.service };
        service.metadata.name = event.target.value;
        this.setState({ service });
    }
    onTypeChanged(event) {
        let service = { ...this.state.service };
        service.spec.type = event.target.value;
        this.setState({ service });
    }
    _updatePorts(ports) {
        this.setState({
            ports: ports.portPairs
        });
    }
    _updateSelector(selectors) {
        this.setState({
            selector: selectors.keyValuePairs
        });
    }
    onLabelChanged(event) {
        let service = { ...this.state.service };
        service.metadata.labels = {};
        if (event.length !== 0) {
            event.forEach(item => {
                if (item.split('=')[1] === undefined) {
                    document.getElementById('labelErrMsg').style.display = 'block';
                    event.pop(item);
                    return;
                }
                document.getElementById('labelErrMsg').style.display = 'none';
                service.metadata.labels[item.split('=')[0]] = item.split('=')[1];
            })
        }
        this.setState({ service });
    }
    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.service;
        this.setState({ inProgress: true });
        const newSecret = _.assign({}, this.state.service);
        // portList가공
        let portList = [];
        this.state.ports.forEach(port => {
            let obj = { name: port[0], port: Number(port[1]), protocol: port[2], targetPort: Number(port[3]) };
            portList.push(obj)
        });
        newSecret.spec.ports = portList;
        // selector가공
        let obj = {};
        this.state.selector.forEach(selector => {
            if (selector[0] !== "" && selector[1] !== "") {
                let key = selector[0];
                obj[key] = selector[1];
            }
        });
        if (obj !== {}) {
            newSecret.spec.selector = obj;
        }
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
    render() {
        return <div className="co-m-pane__body">
            < Helmet >
                <title>Create Service</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-service-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">Create Service</h1>
                <p className="co-m-pane__explanation">{this.props.explanation}</p>

                <fieldset disabled={!this.props.isCreate}>
                    <div className="form-group">
                        <label className="control-label" htmlFor="service-name">Name</label>
                        <div>
                            <input className="form-control"
                                type="text"
                                onChange={this.onNameChanged}
                                value={this.state.service.metadata.name}
                                aria-describedby="service-name-help"
                                id="service-name"
                                required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="service-name">Port</label>
                        <AdvancedPortEditor portPairs={this.state.ports} updateParentData={this._updatePorts} />
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="service-type">Type</label>
                        <div>
                            <select className="form-control" id="service-type" onChange={this.onTypeChanged}>
                                <option value="ClusterIP">ClusterIP</option>
                                <option value="LoadBalancer">LoadBalancer</option>
                                <option value="NodePort">NodePort</option>
                            </select>
                        </div>
                    </div>
                    {/* Selector variables */}
                    <div className="form-group">
                        <React.Fragment>
                            <div className="form-group">
                                <label className="control-label" htmlFor="username">Selector</label>
                                <div>
                                    <KeyValueEditor keyValuePairs={this.state.selector} updateParentData={this._updateSelector} />
                                </div>
                            </div>
                        </React.Fragment>
                    </div>

                    <div className="form-group">
                        <React.Fragment>
                            <div className="form-group">
                                <label className="control-label" htmlFor="username">Labels</label>
                                <div>
                                    <SelectorInput labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
                                </div>
                            </div>
                        </React.Fragment>
                        <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                            <p>Lables must be 'key=value' form.</p>
                        </div>
                    </div>
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
    onDataChanged(servicesData) {
        this.setState({
            stringData: { ...servicesData },
        }, () => this.props.onChange(this.state));
    }
    render() {
        return <React.Fragment>
        </React.Fragment>;
    }
}

const serviceFormFactory = serviceType => {
    return Requestform(SourceSecretForm);
};

const SecretLoadingWrapper = props => {
    const serviceTypeAbstraction = determineCreateType(_.get(props.obj.data, 'data'));
    const ServiceFormComponent = serviceFormFactory(serviceTypeAbstraction);
    const fixed = _.reduce(props.fixedKeys, (acc, k) => ({ ...acc, k: _.get(props.obj.data, k) }), {});
    return <StatusBox {...props.obj}>
        <ServiceFormComponent {...props}
            serviceTypeAbstraction={serviceTypeAbstraction}
            obj={props.obj.data}
            fixed={fixed}
            explanation={pageExplanation[serviceTypeAbstraction]}
        />
    </StatusBox>;
};

export const CreateService = ({ match: { params } }) => {
    const ServiceFormComponent = serviceFormFactory(params.type);
    return <ServiceFormComponent fixed={{ metadata: { namespace: params.ns } }}
        serviceTypeAbstraction={params.type}
        explanation={pageExplanation[params.type]}
        titleVerb="Create"
        isCreate={true}
    />;
};

export const EditSecret = ({ match: { params }, kind }) => <Firehose resources={[{ kind: kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
    <SecretLoadingWrapper fixedKeys={['kind', 'metadata']} titleVerb="Edit" saveButtonText="Save Changes" />
</Firehose>;


export type BaseEditServiceState_ = {
    serviceTypeAbstraction?: CreateType,
    service: K8sResourceKind,
    inProgress: boolean,
    error?: any,
    selectorList: Array<any>,
    type: string
    paramList: Array<any>,
    selectedTemplate: string,
    ports: Array<any>,
    selector: Array<any>
};

export type BaseEditServiceProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    serviceTypeAbstraction?: CreateType,
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

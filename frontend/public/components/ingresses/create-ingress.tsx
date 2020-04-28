/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { KeyValueEditor } from '../utils/key-value-editor';
import { k8sCreate, k8sList, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { IngressHostEditor } from '../utils/ingress-host-editor';

enum CreateType {
    generic = 'generic',
    form = 'form',
}
const pageExplanation = {
    [CreateType.form]: 'Create resource quota claim  using Form Editor',
};
const FirstSection = ({ label, children, id }) => <div className="form-group">
    <label className="control-label" htmlFor="secret-type" >{label}</label>
    <div>
        {children}
    </div>
</div>

class IngressFormComponent extends React.Component<IngressProps_, IngressState_>  {
    constructor(props) {
        super(props);
        const existingIngress = _.pick(props.obj, ['metadata', 'type']);
        const ingress = _.defaultsDeep({}, props.fixed, existingIngress, {
            apiVersion: 'extensions/v1beta1',
            kind: 'Ingress',
            metadata: {
                name: '',
                namespace: ''
            },
            spec: {
                rules: [{
                    host: '',
                    http: {
                        paths: [
                            {
                                path: '',
                                backend: {
                                    serviceName: '',
                                    servicePort: ''
                                }
                            }
                        ]
                    }
                }]

            }
        });

        this.state = {
            ingressTypeAbstraction: this.props.ingressTypeAbstraction,
            ingress: ingress,
            inProgress: false,
            type: 'form',
            hosts: [['']],
            paths: [['', '', '']],
            serviceNameList: [],
            servicePortList: [],
            serviceNameOptions: [],
            servicePortOptions: []
        };
        this.onNameChanged = this.onNameChanged.bind(this);
        this.getServiceList = this.getServiceList.bind(this);
        this.save = this.save.bind(this);
    }
    _updatePaths(path) {
        this.setState({
            paths: path.pathPairs,
        });
    }

    componentDidMount() {
        this.getServiceList();
    }

    // 선택된 ns에 있는 Service 리스트 호출 -> service별 name,port[]으로 service List생성
    getServiceList() {
        const ko = kindObj('Service');
        const ns = location.pathname.split('/')[3];
        k8sList(ko, { ns: ns })
            .then((data) => {
                let serviceList = data.map(cur => {
                    return {
                        name: cur.metadata.name,
                        port: cur.spec.ports
                    }
                })
                if (serviceList.length === 0) {
                    return;
                }
                this.setState({
                    serviceNameList: serviceList
                });
            }, err => {
                this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
            });
    }
    onNameChanged(event) {
        let ingress = { ...this.state.ingress };
        ingress.metadata.name = String(event.target.value);
        this.setState({ ingress });
    }

    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.ingress;
        this.setState({ inProgress: true });
        const newIngress = _.assign({}, this.state.ingress);


        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newIngress)
            : k8sUpdate(ko, newIngress, metadata.namespace, newIngress.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            history.push(formatNamespacedRouteForResource('resourcequotaclaims'));
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { serviceNameOptions, servicePortOptions, serviceNameList } = this.state;
        const { t } = this.props;
        let serviceList = serviceNameList.map(service => {
            return <option value={service.port}>{service.name}</option>;
        });
        let servicePortList = servicePortOptions.map(function (pvc) {
            return <option value={pvc}>{pvc}</option>;
        });
        return <div className="co-m-pane__body">
            < Helmet >
                <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.ingress.kind, t) })}</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.ingress.kind, t) })}</h1>
                {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}

                <fieldset disabled={!this.props.isCreate}>
                    {/* Name */}
                    <FirstSection label={t('CONTENT:NAME')} children={
                        <input className="form-control"
                            type="text"
                            onChange={this.onNameChanged}
                            value={this.state.ingress.metadata.name}
                            required />
                    } id="name" />

                    {/* Host */}
                    <IngressHostEditor values={this.state.hosts} serviceList={serviceList} t={t} pathPairs={this.state.paths} updateParentData={this._updatePaths} />

                    {/* Button */}
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
                        <Link to={formatNamespacedRouteForResource('resourcequotaclaims')} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreateIngress = ({ match: { params } }) => {
    const { t } = useTranslation();
    return <IngressFormComponent
        t={t}
        fixed={{ metadata: { namespace: params.ns } }}
        ingressTypeAbstraction={params.type}
        explanation=''
        // explanation={pageExplanation[params.type]}
        titleVerb="Create"
        isCreate={true}
    />;
};
export type IngressState_ = {
    ingressTypeAbstraction?: CreateType,
    ingress: K8sResourceKind,
    inProgress: boolean,
    error?: any,
    type: string,
    paths: Array<any>,
    hosts: Array<any>,
    serviceNameList: Array<any>,
    servicePortList: Array<any>,
    serviceNameOptions: Array<any>;
    servicePortOptions: Array<any>;
};

export type IngressProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    ingressTypeAbstraction?: CreateType,
    saveButtonText?: string,
    explanation: string,
    t: any
};


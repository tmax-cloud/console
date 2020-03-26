/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sList, k8sGet, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
// import { ButtonBar, Firehose, history, kindObj, StatusBox, SelectorInput } from '../utils';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';

enum CreateType {
    generic = 'generic',
    form = 'form',
}
const pageExplanation = {
    [CreateType.form]: '폼 형식을 통한 파이프라인 런 생성',
};

// const determineCreateType = (data) => {
//     return CreateType.form;
// };

const Section = ({ label, children, id }) => <div className="row">
    <div className="col-xs-2">
        <div>{label}</div>
    </div>
    <div className="col-xs-2" id={id}>
        {children}
    </div>
</div>;

const RefList = ({ list, type }) => {
    const resources = list
        .filter(cur => {
            return (cur.type === type);
        })
        .map(cur => {
            return <option value={cur.name}>{cur.name}</option>
        });
    return resources;
}

// const Requestform = () =>
class PipelineRunFormComponent extends React.Component<PipelineRunProps_, PipelineRunState_>  {
    constructor(props) {
        super(props);
        const existingPipelineRun = _.pick(props.obj, ['metadata', 'type']);
        const pipelineRun = _.defaultsDeep({}, props.fixed, existingPipelineRun, {
            apiVersion: 'tekton.dev/v1alpha1',
            kind: 'PipelineRun',
            metadata: {
                name: '',
                namespace: '',
                labels: {}
            },
            spec: {
                params: [],
                pipelineRef: {
                    name: ''
                },
                resources: []
            }
        });

        this.state = {
            pipelineRunTypeAbstraction: this.props.pipelineRunTypeAbstraction,
            pipelineRun: pipelineRun,
            inProgress: false,        // 뭔지 잘 모르겠음
            stringData: _.mapValues(_.get(props.obj, 'data'), window.atob),
            type: 'form',
            pipelineList: [],
            paramList: [],
            selectedPipeLine: '',
            selectedPipeLineNs: '',
            selectedParam: '',
            resourceList: [],
            resourceRefList: [],
            selectedResourceRef: ''
        };
        this.getPipelineList = this.getPipelineList.bind(this);
        this.getPipelineDetails = this.getPipelineDetails.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onParamChanged = this.onParamChanged.bind(this);
        this.onResourceChanged = this.onResourceChanged.bind(this);
        this.onPipelineChange = this.onPipelineChange.bind(this);
        this.getPipelineResourceList = this.getPipelineResourceList.bind(this);
        this.onLabelChanged = this.onLabelChanged.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        this.getPipelineList();

    }

    onNameChanged(event) {
        let pipelineRun = { ...this.state.pipelineRun };
        pipelineRun.metadata.name = String(event.target.value);
        this.setState({ pipelineRun });
    }

    onPipelineChange(event) {
        this.setState({
            selectedPipeLine: event.target.value
        },
            () => {
                this.getPipelineDetails();
            }
        );
        let pipelineRun = { ...this.state.pipelineRun };
        pipelineRun.spec.pipelineRef.name = event.target.value;
        this.setState({ pipelineRun });
    }

    onParamChanged(event) {
        let pipelineRun = { ...this.state.pipelineRun };
        pipelineRun.spec.params.some((cur, idx) => {

            if (cur.name === event.target.id) {
                pipelineRun.spec.params.splice(idx, 1);
            }
            return (cur.name === event.target.id)
        })

        pipelineRun.spec.params.push({
            name: event.target.id,
            value: String(event.target.value)
        })
        this.setState({ pipelineRun });
    }

    onResourceChanged(event) {
        let pipelineRun = { ...this.state.pipelineRun };

        pipelineRun.spec.resources.some((cur, idx) => {
            if (cur.name === event.target.id) {
                pipelineRun.spec.resources.splice(idx, 1);
            }
            return (cur.name === event.target.id)
        })

        pipelineRun.spec.resources.push({
            name: event.target.id,
            resourceRef: {
                name: event.target.value
            }
        })
        this.setState({ pipelineRun });
        console.log(this.state.pipelineRun);
    }

    onLabelChanged(event) {
        let pipelineRun = { ...this.state.pipelineRun };
        //console.log(event); 
        pipelineRun.metadata.labels = {};
        if (event.length !== 0) {
            event.forEach(item => {
                if (item.split('=')[1] === undefined) {
                    document.getElementById('labelErrMsg').style.display = 'block';
                    event.pop(item);
                    return;
                }
                document.getElementById('labelErrMsg').style.display = 'none';
                pipelineRun.metadata.labels[item.split('=')[0]] = item.split('=')[1];
            })
        }
        this.setState({ pipelineRun });
    }

    getPipelineList() {
        const ko = kindObj('Pipeline');

        k8sList(ko)
            .then(reponse => reponse)
            .then((data) => {
                let pipelineList = data.map(cur => {
                    return {
                        name: cur.metadata.name,
                        ns: cur.metadata.namespace
                    }
                })
                let pipelineRun = { ...this.state.pipelineRun };
                pipelineRun.spec.pipelineRef.name = pipelineList[0].name;
                this.setState({ pipelineRun });

                this.setState({
                    pipelineList: pipelineList,
                    selectedPipeLine: pipelineList[0].name,
                    selectedPipeLineNs: pipelineList[0].ns
                }, this.getPipelineDetails);
            }, err => {
                this.setState({ error: err.message, inProgress: false })
                this.setState({ pipelineList: [] });
            });
    }

    getPipelineDetails() {
        const ko = kindObj('Pipeline');

        k8sGet(ko, this.state.selectedPipeLine, this.state.selectedPipeLineNs)
            .then(reponse => reponse)
            .then((details) => {
                let paramList = details.spec.params.map(cur => {
                    return {
                        name: cur.name,
                        type: cur.type
                    }
                });
                let resourceList = details.spec.resources.map(cur => {
                    return {
                        name: cur.name,
                        type: cur.type
                    }
                })

                let pipelineRun = { ...this.state.pipelineRun };
                let initParamList = details.spec.params.map(cur => {
                    return {
                        name: cur.name,
                        value: ''
                    }
                });
                !pipelineRun.spec.params.length && pipelineRun.spec.params.push(...initParamList);
                this.setState({ pipelineRun });

                this.setState({
                    resourceList: resourceList,
                    paramList: paramList,
                    selectedParam: paramList[0].name
                }, resourceList.forEach(cur => {
                    this.getPipelineResourceList(cur.name, cur.type);
                }))
            }, err => {
                this.setState({ error: err.message, inProgress: false })
                this.setState({ paramList: [] });
            })
    }

    getPipelineResourceList(resourceName, resourceType) {
        const ko = kindObj('PipelineResource');

        k8sList(ko)
            .then(reponse => reponse)
            .then((data) => {
                let resourceRefList = data
                    .map(cur => {
                        return {
                            name: cur.metadata.name,
                            type: cur.spec.type
                        }
                    });

                let pipelineRun = { ...this.state.pipelineRun };



                let initResourceList = {
                    name: resourceName, resourceRef: {
                        name: resourceRefList.filter(cur => {
                            return (cur.type === resourceType)
                        }
                        )[0].name
                    }
                }

                pipelineRun.spec.resources.length < resourceRefList.length && pipelineRun.spec.resources.push(initResourceList);
                this.setState({ pipelineRun });


                this.setState({
                    resourceRefList: resourceRefList
                });
            }, err => {
                this.setState({ error: err.message, inProgress: false })
                this.setState({ resourceRefList: [] });
            });
    }

    save(e) {
        e.preventDefault();
        const { kind, metadata } = this.state.pipelineRun;
        this.setState({ inProgress: true });
        const newPipelineRun = _.assign({}, this.state.pipelineRun);
        const ko = kindObj(kind);
        (this.props.isCreate
            ? k8sCreate(ko, newPipelineRun)
            : k8sUpdate(ko, newPipelineRun, metadata.namespace, newPipelineRun.metadata.name)
        ).then(() => {
            this.setState({ inProgress: false });
            console.log(this.state)
            history.push(formatNamespacedRouteForResource('pipelineruns'));
        }, err => this.setState({ error: err.message, inProgress: false }));
    }

    render() {
        const { pipelineList, paramList, resourceList, resourceRefList } = this.state;

        let options = pipelineList.map(cur => {
            return <option value={cur.name}>{cur.name}</option>;
        });

        let paramDivs = paramList.map(cur => {
            return <Section label={cur.name} id={cur.name}>
                <input className="form-control" type="text" placeholder="value" id={cur.name} onChange={this.onParamChanged} required />
            </Section>
        });

        let resourceDivs = resourceList.map(cur => {
            return <Section label={cur.name} id={cur.name}>
                <select className="form-control" id={cur.name} onChange={this.onResourceChanged}>
                    <RefList list={resourceRefList} type={cur.type} />
                </select>
            </Section>
        });

        return <div className="co-m-pane__body">
            < Helmet >
                <title>Create Pipeline Run</title>
            </Helmet >
            <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
                <h1 className="co-m-pane__heading">Create Pinpeline Run</h1>
                <p className="co-m-pane__explanation">{this.props.explanation}</p>

                <fieldset disabled={!this.props.isCreate}>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-name">Name</label>
                        <div>
                            <input className="form-control"
                                type="text"
                                onChange={this.onNameChanged}
                                value={this.state.pipelineRun.metadata.name}
                                aria-describedby="secret-name-help"
                                id="pipelinerun-name"
                                required />

                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-type" >Pipeline</label>
                        <div>
                            <select onChange={this.onPipelineChange} className="form-control" id="pipeline">
                                {options}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-type" >Params</label>
                        <div>
                            <ul>{paramDivs}</ul>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="secret-type" >Resources</label>
                        <div>
                            <ul>{resourceDivs}</ul>
                        </div>
                    </div>
                    <React.Fragment>
                        <div className="form-group">
                            <label className="control-label" htmlFor="username">Label</label>
                            <div>
                                <SelectorInput labelClassName="co-text-namespace" onChange={this.onLabelChanged} tags={[]} />
                            </div>
                        </div>
                    </React.Fragment>
                    <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                        <p>Lables must be 'key=value' form.</p>
                    </div>
                    <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
                        <button type="submit" className="btn btn-primary" id="save-changes">{this.props.saveButtonText || 'Create'}</button>
                        <Link to={formatNamespacedRouteForResource('pipelineruns')} className="btn btn-default" id="cancel">Cancel</Link>
                    </ButtonBar>
                </fieldset>
            </form>

        </div >;
    }
};

export const CreatePipelineRun = ({ match: { params } }) => {
    // const PipelineRunFormComponent = PipelineRunFormFactory(params.type);
    return <PipelineRunFormComponent
        fixed={{ metadata: { namespace: params.ns } }}
        pipelineRunTypeAbstraction={params.type}
        explanation={pageExplanation[params.type]}
        titleVerb="Create"
        isCreate={true}
    />;
};


// const PipelineRunFormFactory = secretType => {
//     return Requestform();
// return Requestform(SourceSecretForm);
// };


// 나중에 edit 할 때 필요한 것들!!!!!!!
// const SecretLoadingWrapper = props => {
//     const secretTypeAbstraction = determineCreateType(_.get(props.obj.data, 'data'));
//     const PipelineRunFormComponent = secretFormFactory(secretTypeAbstraction);
//     const fixed = _.reduce(props.fixedKeys, (acc, k) => ({ ...acc, k: _.get(props.obj.data, k) }), {});
//     return <StatusBox {...props.obj}>
//         <PipelineRunFormComponent {...props}
//             secretTypeAbstraction={secretTypeAbstraction}
//             obj={props.obj.data}
//             fixed={fixed}
//             explanation={pageExplanation[secretTypeAbstraction]}
//         />
//     </StatusBox>;
// };


// 나중에 edit 할 때 필요한 것들!!!!!!!
// export const EditSecret = ({ match: { params }, kind }) => <Firehose resources={[{ kind: kind, name: params.name, namespace: params.ns, isList: false, prop: 'obj' }]}>
//     <SecretLoadingWrapper fixedKeys={['kind', 'metadata']} titleVerb="Edit" saveButtonText="Save Changes" />
// </Firehose>;


export type PipelineRunState_ = {
    pipelineRunTypeAbstraction?: CreateType,
    pipelineRun: K8sResourceKind,
    inProgress: boolean,        // 뭔지 잘 모르겠음
    stringData: { [key: string]: string },
    error?: any,
    type: string,
    pipelineList: Array<any>,
    selectedPipeLine: string,
    selectedPipeLineNs: string,
    paramList: Array<any>,
    selectedParam: string,
    resourceList: Array<any>,
    resourceRefList: Array<any>,
    selectedResourceRef: string
};

export type PipelineRunProps_ = {
    obj?: K8sResourceKind,
    fixed: any,
    kind?: string,
    isCreate: boolean,
    titleVerb: string,
    pipelineRunTypeAbstraction?: CreateType,
    saveButtonText?: string,
    explanation: string,
};


/* eslint-enable no-undef */

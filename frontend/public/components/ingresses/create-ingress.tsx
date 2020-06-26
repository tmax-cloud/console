/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sGet, k8sList, k8sUpdate, K8sResourceKind } from '../../module/k8s';
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
const FirstSection = ({ label, children, id }) => (
  <div className="form-group">
    <label className="control-label" htmlFor="secret-type">
      {label}
    </label>
    <div>{children}</div>
  </div>
);

class IngressFormComponent extends React.Component<IngressProps_, IngressState_> {
  constructor(props) {
    super(props);
    const existingIngress = _.pick(props.obj, ['metadata', 'type']);
    const ingress = _.defaultsDeep({}, props.fixed, existingIngress, {
      apiVersion: 'extensions/v1beta1',
      kind: 'Ingress',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        rules: [
          {
            host: '',
            http: {
              paths: [
                {
                  path: '',
                  backend: {
                    serviceName: '',
                    servicePort: '',
                  },
                },
              ],
            },
          },
        ],
      },
    });

    this.state = {
      ingressTypeAbstraction: this.props.ingressTypeAbstraction,
      ingress: ingress,
      inProgress: false,
      type: 'form',
      hosts: [['', '']],
      paths: [['', '', '']],
      serviceNameList: [],
      servicePortList: [],
      serviceNameOptions: [],
      servicePortOptions: [],
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.getServiceList = this.getServiceList.bind(this);
    this._updateHosts = this._updateHosts.bind(this);
    this.save = this.save.bind(this);
  }
  _updateHosts(host) {
    this.setState({
      hosts: host.values,
    });
  }

  componentDidMount() {
    this.getServiceList();
  }

  // 선택된 ns에 있는 Service 리스트 호출 -> serviceName으로 service List생성
  getServiceList() {
    const ko = kindObj('Service');
    const ns = location.pathname.split('/')[3];
    k8sList(ko, { ns: ns }).then(
      data => {
        let serviceNameList = [];
        data.forEach(cur => {
          // service type이 External Name인경우는 제외
          if (cur.spec.type !== 'ExternalName') {
            let portList = cur.spec.ports.map(port => {
              return {
                name: port.name,
                value: port.port,
              };
            });
            serviceNameList.push(
              {
                name: cur.metadata.name,
                portList: portList,
              }
            );
          }
        });
        let initPortList = serviceNameList[0].portList;
        if (serviceNameList.length === 0) {
          return;
        }
        this.setState({
          serviceNameList: serviceNameList,
          servicePortList: initPortList,
        });
      },
      err => {
        this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
      },
    );
  }
  onNameChanged(event) {
    let ingress = { ...this.state.ingress };
    ingress.metadata.name = String(event.target.value);
    this.setState({ ingress });
  }

  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.ingress;
    const { hosts, serviceNameList, servicePortList } = this.state;
    const newIngress = _.assign({}, this.state.ingress);
    this.setState({ inProgress: true });
    //hosts data 가공
    let hostData = hosts.map(host => {
      let hostName = host[0];
      let paths = host[1];
      let pathData = {};
      //path가 필수값이 아니기 때문에 입력 안하는경우 paths가 ""으로 들어옴
      if (typeof paths !== 'string') {
        pathData = paths.map(path => {
          let serviceName = path[1] === '' ? serviceNameList[0].name : path[1];
          let servicePort = path[2] === '' ? servicePortList[0].value : path[2];
          return {
            path: path[0],
            backend: { serviceName: serviceName, servicePort: servicePort },
          };
        });
      } else {
        pathData = [{ path: '', backend: { serviceName: serviceNameList[0].name, servicePort: servicePortList[0].value } }];
      }

      paths = { paths: pathData };
      return { host: hostName, http: paths };
    });
    newIngress.spec.rules = hostData;

    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newIngress) : k8sUpdate(ko, newIngress, metadata.namespace, newIngress.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        history.push(formatNamespacedRouteForResource('ingresses'));
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { hosts, servicePortOptions, serviceNameList, servicePortList } = this.state;
    const { t } = this.props;
    let serviceList = serviceNameList.length ? serviceNameList.map(service => {
      return <option value={service.name}>{service.name}</option>;
    }) : [];
    return (
      <div className="co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.ingress.kind, t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.ingress.kind, t) })}</h1>
          {/* <p className="co-m-pane__explanation">{this.props.explanation}</p> */}

          <fieldset disabled={!this.props.isCreate}>
            {/* Name */}
            <FirstSection label={t('CONTENT:NAME')} children={<input className="form-control" type="text" onChange={this.onNameChanged} value={this.state.ingress.metadata.name} required />} id="name" />

            {/* Host */}
            <FirstSection label={t('CONTENT:HOST')} id="host">
              <IngressHostEditor values={hosts} serviceList={serviceList} servicePortList={servicePortList} t={t} updateParentData={this._updateHosts} />
            </FirstSection>

            {/* Button */}
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('ingresses')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateIngress = ({ match: { params } }) => {
  const { t } = useTranslation();
  return (
    <IngressFormComponent
      t={t}
      fixed={{ metadata: { namespace: params.ns } }}
      ingressTypeAbstraction={params.type}
      explanation=""
      // explanation={pageExplanation[params.type]}
      titleVerb="Create"
      isCreate={true}
    />
  );
};
export type IngressState_ = {
  ingressTypeAbstraction?: CreateType;
  ingress: K8sResourceKind;
  inProgress: boolean;
  error?: any;
  type: string;
  paths: Array<any>;
  hosts: Array<any>;
  serviceNameList: Array<any>;
  servicePortList: Array<any>;
  serviceNameOptions: Array<any>;
  servicePortOptions: Array<any>;
};

export type IngressProps_ = {
  obj?: K8sResourceKind;
  fixed: any;
  kind?: string;
  isCreate: boolean;
  titleVerb: string;
  ingressTypeAbstraction?: CreateType;
  saveButtonText?: string;
  explanation: string;
  t: any;
};

/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { ActionGroup, Button } from '@patternfly/react-core';
import { k8sCreate, k8sList, k8sGet, k8sUpdate, K8sResourceKind } from '../../../../module/k8s';
import { Section } from '../../utils/section';
import { ButtonBar, history, kindObj, SelectorInput } from '../../../utils';
import { useTranslation } from 'react-i18next';
import { ResourceLabelPlural } from '../../../../models/hypercloud/resource-plural';
import { formatNamespacedRouteForResource } from '@console/shared/src/utils/namespace';
import store from '../../../../redux';
import { getActiveNamespace } from '@console/internal/reducers/ui';

enum CreateType {
  generic = 'generic',
  form = 'form',
}
const pageExplanation = {
  [CreateType.form]: 'Create Pipeline Run using Form Editor',
};

const RefList = ({ list, type }) => {
  const resources = list
    .filter(cur => {
      return cur.type === type;
    })
    .map(cur => {
      return <option value={cur.name}>{cur.name}</option>;
    });
  return resources;
};

// const Requestform = () =>
class PipelineRunFormComponent extends React.Component<PipelineRunProps_, PipelineRunState_> {
  constructor(props) {
    super(props);
    const existingPipelineRun = _.pick(props.obj, ['metadata', 'type']);
    const pipelineRun = _.defaultsDeep({}, props.fixed, existingPipelineRun, {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'PipelineRun',
      metadata: {
        name: '',
        namespace: '',
        labels: {},
      },
      spec: {
        serviceAccountName: '',
        params: [],
        pipelineRef: {
          name: '',
        },
        resources: [],
      },
    });

    this.state = {
      pipelineRunTypeAbstraction: this.props.pipelineRunTypeAbstraction,
      pipelineRun: pipelineRun,
      inProgress: false, // 뭔지 잘 모르겠음
      stringData: _.mapValues(_.get(props.obj, 'data'), window.atob),
      type: 'form',
      pipelineList: [],
      paramList: [],
      selectedPipeLine: '',
      selectedPipeLineNs: '',
      selectedParam: '',
      resourceList: [],
      resourceRefList: [],
      selectedResourceRef: '',
      namespace: getActiveNamespace(store.getState()),
    };
    this.getPipelineList = this.getPipelineList.bind(this);
    this.getPipelineDetails = this.getPipelineDetails.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onParamChanged = this.onParamChanged.bind(this);
    this.onResourceChanged = this.onResourceChanged.bind(this);
    this.onPipelineChange = this.onPipelineChange.bind(this);
    this.getPipelineResourceList = this.getPipelineResourceList.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this.onAccountChanged = this.onAccountChanged.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    this.getPipelineList();
  }

  // refreshPipelineRun() {
  //     let pipelineRun = { ...this.state.pipelineRun };
  //     pipelineRun.spec.params = [];
  //     pipelineRun.spec.resources = [];
  //     this.setState({ pipelineRun });
  // }

  onNameChanged(event) {
    let pipelineRun = { ...this.state.pipelineRun };
    pipelineRun.metadata.name = String(event.target.value);
    this.setState({ pipelineRun });
  }

  onPipelineChange(event) {
    // this.refreshPipelineRun();

    this.setState(
      {
        selectedPipeLine: event.target.value,
      },
      () => {
        this.getPipelineDetails();
      },
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
      return cur.name === event.target.id;
    });

    pipelineRun.spec.params.push({
      name: event.target.id,
      value: String(event.target.value),
    });
    this.setState({ pipelineRun });
  }

  onResourceChanged(event) {
    let pipelineRun = { ...this.state.pipelineRun };

    pipelineRun.spec.resources.some((cur, idx) => {
      if (cur.name === event.target.id) {
        pipelineRun.spec.resources.splice(idx, 1);
      }
      return cur.name === event.target.id;
    });

    pipelineRun.spec.resources.push({
      name: event.target.id,
      resourceRef: {
        name: event.target.value,
      },
    });
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
      });
    }
    this.setState({ pipelineRun });
  }

  onAccountChanged(event) {
    let pipelineRun = { ...this.state.pipelineRun };
    pipelineRun.spec.serviceAccountName = String(event.target.value);
    this.setState({ pipelineRun });
  }

  getPipelineList() {
    const ko = kindObj('Pipeline');

    k8sList(ko)
      .then(reponse => reponse)
      .then(
        data => {
          let pipelineList = data
            .filter(cur => {
              return document.location.href.indexOf('/all-namespaces/') === -1 && cur.metadata.namespace === document.location.href.split('ns/')[1].split('/')[0];
            })
            .map(cur => {
              return {
                name: cur.metadata.name,
                ns: cur.metadata.namespace,
              };
            });
          let pipelineRun = { ...this.state.pipelineRun };
          if (pipelineList.length === 0) {
            return;
          }
          pipelineRun.spec.pipelineRef.name = pipelineList[0].name;
          this.setState({ pipelineRun });

          this.setState(
            {
              pipelineList: pipelineList,
              selectedPipeLine: pipelineList[0].name,
              selectedPipeLineNs: pipelineList[0].ns,
            },
            this.getPipelineDetails,
          );
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ pipelineList: [] });
        },
      );
  }

  getPipelineDetails() {
    const ko = kindObj('Pipeline');

    k8sGet(ko, this.state.selectedPipeLine, this.state.selectedPipeLineNs)
      .then(reponse => reponse)
      .then(
        details => {
          //params, resource가 없는경우
          let paramList = details.spec.params
            ? details.spec.params.map(cur => {
              return {
                name: cur.name,
                type: cur.type,
                value: '',
              };
            })
            : [];
          let resourceList = details.spec.resources
            ? details.spec.resources.map(cur => {
              return {
                name: cur.name,
                type: cur.type,
              };
            })
            : [];

          let pipelineRun = { ...this.state.pipelineRun };
          // let initParamList = details.spec.params.map(cur => {
          //     return {
          //         name: cur.name,
          //         value: ''
          //     }
          // });
          !pipelineRun.spec.params.length && pipelineRun.spec.params.push(...paramList);
          this.setState(
            {
              pipelineRun: pipelineRun,
              resourceList: resourceList,
              paramList: paramList,
            },
            resourceList.forEach(cur => {
              !pipelineRun.spec.resources.length && this.getPipelineResourceList(cur.name, cur.type);
            }),
          );
          paramList.length ? this.setState({ selectedParam: paramList[0].name }) : null;
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ paramList: [] });
        },
      );
  }

  getPipelineResourceList(resourceName, resourceType) {
    const ko = kindObj('PipelineResource');

    k8sList(ko)
      .then(reponse => reponse)
      .then(
        data => {
          if (data.length === 0) {
            return;
          }
          let resourceRefList = data
            .filter(cur => {
              return document.location.href.indexOf('/all-namespaces/') === -1 && cur.metadata.namespace === document.location.href.split('ns/')[1].split('/')[0];
            })
            .map(cur => {
              return {
                name: cur.metadata.name,
                type: cur.spec.type,
              };
            });
          let pipelineRun = { ...this.state.pipelineRun };
          let initResourceList = {
            name: resourceName,
            resourceRef: {
              name: resourceRefList.filter(cur => {
                return cur.type === resourceType;
              })[0].name,
            },
          };

          pipelineRun.spec.resources.length < resourceRefList.length && pipelineRun.spec.resources.push(initResourceList);
          this.setState({ pipelineRun });

          this.setState({
            resourceRefList: resourceRefList,
          });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ resourceRefList: [] });
        },
      );
  }

  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.pipelineRun;
    this.setState({ inProgress: true });
    const newPipelineRun = _.assign({}, this.state.pipelineRun);
    const ko = kindObj(kind);
    (this.props.isCreate ? k8sCreate(ko, newPipelineRun) : k8sUpdate(ko, newPipelineRun, metadata.namespace, newPipelineRun.metadata.name)).then(
      () => {
        this.setState({ inProgress: false });
        console.log(this.state);
        history.push(formatNamespacedRouteForResource('pipelineruns', this.state.namespace));
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { pipelineList, paramList, resourceList, resourceRefList } = this.state;
    const { t } = this.props;
    let options = pipelineList.map(cur => {
      return <option value={cur.name}>{cur.name}</option>;
    });

    let paramDivs = paramList.length
      ? paramList.map(cur => {
        return (
          <ul>
            <Section label={cur.name} id={cur.name} description={cur.description}>
              <input className="form-control" type="text" placeholder={t('CONTENT:VALUE')} id={cur.name} onChange={this.onParamChanged} required />
            </Section>
          </ul>
        );
      })
      : false;

    let resourceDivs = resourceList.length
      ? resourceList.map(cur => {
        return (
          <ul>
            <Section label={cur.name} id={cur.name}>
              <select className="form-control" id={cur.name} onChange={this.onResourceChanged}>
                <RefList list={resourceRefList} type={cur.type} />
              </select>
            </Section>
          </ul>
        );
      })
      : false;

    return (
      <div className="co-m-pane__body">
        <Helmet>
          <title>Create Pipeline Run</title>
        </Helmet>
        <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabelPlural(this.state.pipelineRun, t) })}</h1>
          <p className="co-m-pane__explanation">{t('Description')}</p>

          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('이름')} id="pipelinerun-name" isRequired>
              <div>
                <input className="form-control" type="text" onChange={this.onNameChanged} value={this.state.pipelineRun.metadata.name} aria-describedby="secret-name-help" id="pipelinerun-name" required />
              </div>
            </Section>

            <Section label={t('레이블')} id="label" description="Enter를 입력하여 레이블을 추가할 수 있습니다.">
              <div className="form-group">
                <div>
                  <SelectorInput labelClassName="co-text-namespace" onChange={this.onLabelChanged} tags={[]} />
                </div>
              </div>
            </Section>
            <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
              <p>{t("레이블은 '키=값' 형식이어야 합니다.")}</p>
            </div>

            <div className="co-form-section__separator" />

            <Section label={t('COMMON:MSG_LNB_MENU_146')} id="pipeline" isRequired>
              <select onChange={this.onPipelineChange} className="form-control" id="pipeline">
                {options}
              </select>
            </Section>

            {paramDivs &&
              <Section label={t('파이프라인 파라미터')} id="param">
                {paramDivs}
              </Section>}
            {resourceDivs &&
              <Section label={t('파이프라인 리소스')} id="resource">
                {resourceDivs}
              </Section>}

            <div className="co-form-section__separator" />

            <Section label={t('서비스 어카운트 지정')} id="account" isRequired>
              <div className="form-group">
                <div>
                  <input className="form-control" type="text" onChange={this.onAccountChanged} value={this.state.pipelineRun.spec.serviceAccountName} id="pipelinerun-account" required />
                </div>
              </div>
            </Section>

            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <ActionGroup className="pf-c-form">
                <Button type="submit" id="save-changes" variant="primary">
                  {t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}
                </Button>
                <Button onClick={history.goBack} id="cancel" variant="secondary">
                  {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
                </Button>
              </ActionGroup>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreatePipelineRun = ({ match: { params } }) => {
  // const PipelineRunFormComponent = PipelineRunFormFactory(params.type);
  const { t } = useTranslation();
  return <PipelineRunFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} pipelineRunTypeAbstraction={params.type} explanation={pageExplanation[params.type]} titleVerb="Create" isCreate={true} />;
};

export type PipelineRunState_ = {
  pipelineRunTypeAbstraction?: CreateType;
  pipelineRun: K8sResourceKind;
  inProgress: boolean; // 뭔지 잘 모르겠음
  stringData: { [key: string]: string };
  error?: any;
  type: string;
  pipelineList: Array<any>;
  selectedPipeLine: string;
  selectedPipeLineNs: string;
  paramList: Array<any>;
  selectedParam: string;
  resourceList: Array<any>;
  resourceRefList: Array<any>;
  selectedResourceRef: string;
  namespace: string;
};

export type PipelineRunProps_ = {
  obj?: K8sResourceKind;
  fixed: any;
  kind?: string;
  isCreate: boolean;
  titleVerb: string;
  pipelineRunTypeAbstraction?: CreateType;
  saveButtonText?: string;
  explanation: string;
  t: any;
};

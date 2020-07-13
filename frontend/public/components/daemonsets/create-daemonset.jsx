/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sList, k8sGet, k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput, makeQuery } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { RadioInput } from '../radio';
import { NsDropdown } from '../RBAC';
import { FirstSection, SecondSection2, PodTemplate } from '../utils/form';
import SingleSelect from '../utils/select';
import { ValueEditor } from '../utils/value-editor';
// import { VolumeclaimTemplate } from '../utils/form/volumeclaim-template';

const NodeSchedulerChildren = props => {
  const { value, _updateNodes, nodes, t } = props;
  let options = [
    {
      value: 'hi',
      label: 'hi',
    },
    { value: 'bye', label: 'bye' },
  ];
  let element = '';

  switch (value) {
    case 'allnodes':
      break;
    case 'specificnodes':
      element = <SingleSelect options={options} name={'Node'} placeholder={t('ADDITIONAL:SELECT', { something: t('RESOURCE:NODE') })} onChange={e => {}} />;
      break;
    case 'somenodes':
      element = (
        <ValueEditor
          title="false"
          valueString=""
          t={t}
          updateParentData={e => {
            _updateNodes(e.values);
          }}
          values={nodes}
          // updateParentData={setRunCommands}
        />
      );
      break;
    default:
      break;
  }
  return element;
};

class DaemonSetFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingDaemonSet = _.pick(props.obj, ['metadata', 'type']);
    const daemonSet = _.defaultsDeep({}, props.fixed, existingDaemonSet, {
      apiVersion: 'v1',
      kind: 'DaemonSet',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        serviceName: '',
        replicas: '',
        selector: {
          matchLabels: [],
        },
        template: {
          metadata: {
            labels: [],
          },
          spec: {
            containers: {
              name: '',
              image: '',
              command: [],
              args: [],
              imagePullPolicy: '',
              env: [],
              volumeMounts: [],
              resources: {
                requests: [],
                limits: [],
              },
              ports: [],
              volumes: [],
              restartPolicy: '',
            },
          },
        },
      },
    });
    const podTemplate = {
      name: '',
      imageRegistry: '',
      image: '',
      imageTag: '',
      label: '',
      command: [],
      arg: [],
      imagePullPolicy: '',
      env: [],
      ports: [],
      volumes: [],
      requests: [],
      limits: [],
      restartPolicy: '',
      iporurl: '',
      usePodTemplate: true,
    };

    this.state = {
      daemonSetTypeAbstraction: this.props.daemonSetTypeAbstraction,
      daemonSet: daemonSet,
      podTemplate: podTemplate,
      nodeScheduler: 'all',
      inProgress: false,
      type: 'form',
      imageRegistry: '',
      image: '',
      imageTag: '',
      imageRegistryList: [], // podTemplate 에서 imageRegistry List
      imageList: [],
      imageTagList: [],
      imageAllTagList: [],
      pvcList: [], // podTemplate 에서 pvc List
      storageClassNameList: [],
      nodes: [['']],
      updateType: '',
      maxPodNum: '',
      // quota: [['', '']],
    };
    this._updateNodes = this._updateNodes.bind(this);

    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);

    this.getImageRegistryList = this.getImageRegistryList.bind(this);
    this.getImageList = this.getImageList.bind(this);
    this.getPVCList = this.getPVCList.bind(this);
    this.save = this.save.bind(this);
  }
  componentDidMount() {
    this.getImageRegistryList();
    this.getPVCList();
  }
  _updateNodes(nodes) {
    this.setState({
      nodes: nodes,
    });
  }
  onNameChanged(event) {
    let daemonSet = { ...this.state.daemonSet };
    daemonSet.metadata.name = String(event.target.value);
    this.setState({ daemonSet });
  }
  onNamespaceChanged(namespace) {
    let daemonSet = { ...this.state.daemonSet };
    daemonSet.metadata.namespace = String(namespace);
    this.setState({ daemonSet });
  }
  getImageRegistryList = () => {
    const ko = kindObj('Registry');
    k8sList(ko)
      .then(reponse => reponse)
      .then(
        data => {
          let imageRegistryList = data.map(cur => {
            return {
              value: cur.spec.image.split('/')[0],
              id: 'imageRegistry',
              label: cur.metadata.name,
            };
          });
          this.setState({ imageRegistryList });

          let node = { ...this.state.podTemplate };
          node.imageRegistry = String(imageRegistryList[0].value);
          // podTemplate.imageRegistry = String(imageRegistryList[0]);
          // podTemplate.imageRegistry = String(imageRegistryList[0].value);
          this.setState({ podTemplate: node });
          this.setState({ imageRegistry: node.imageRegistry });
          this.getImageList(data[0]);
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ daemonSet: [] });
        },
      );
  };

  getImageList = obj => {
    const ko = kindObj('Image');
    let query = makeQuery('', { matchLabels: { registry: `${obj.metadata.name}` } }, '', '');
    k8sList(ko, query)
      .then(reponse => reponse)
      .then(
        data => {
          let imageList = data.map(cur => {
            return {
              value: cur.metadata.name,
              id: 'image',
              label: cur.metadata.name,
              tagList: cur.spec.versions,
            };
          });

          let node = { ...this.state.podTemplate };
          node.image = imageList.length && String(imageList[0].value);
          node.imageTag = '';
          this.setState({ image: node.image });

          let imageAllTagList =
            data.length > 0
              ? data.map(image => ({
                  value: image.spec.versions,
                  label: image.spec.versions,
                  image: image.metadata.name,
                }))
              : [];

          let imageTagList =
            imageAllTagList.length > 0
              ? imageAllTagList
                  .filter(cur => {
                    return cur.image === node.image;
                  })[0]
                  .value.map(version => {
                    return {
                      value: version,
                      label: version,
                    };
                  })
              : [];
          this.setState({ imageTag: podTemplate.imageTag });
          this.setState({ podTemplate: node });

          this.setState({ imageList });
          this.setState({ imageTagList });
          this.setState({ imageAllTagList });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
        },
      );
  };

  getPVCList = async () => {
    const ko = kindObj('PersistentVolumeClaim');
    const namespace = daemonSet.metadata.namespace || 'default';
    await k8sGet(ko, '', namespace)
      .then(reponse => reponse)
      .then(
        data => {
          let pvcList = data.items.map(cur => {
            return {
              value: cur.metadata.name,
              id: 'claimName',
              label: cur.metadata.name,
            };
          });
          let node = { ...this.state.podTemplate };
          node.volumes = [['', '', '', false]];
          // podTemplate.volumes = [['', '', String(pvcList[0].value), false]];
          this.setState({ podTemplate: node });
          this.setState({ pvcList });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ daemonSet: [] });
        },
      );
  };

  onLabelChanged(event) {
    let daemonSet = { ...this.state.daemonSet };
    daemonSet.spec.selector.matchLabels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        daemonSet.spec.selector.matchLabels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ daemonSet });
  }

  onImageRegistryChange = e => {
    this.getImageList({ metadata: { name: e.label } });
    this.setState(prevState => ({
      podTemplate: {
        ...prevState.podTemplate,
        imageRegistry: e.value,
      },
    }));
    this.setState({ imageRegistry: e });
  };

  onImageChange = e => {
    this.setState(prevState => ({
      podTemplate: {
        ...prevState.podTemplate,
        image: e.value,
        imageTag: e.tagList[0],
      },
    }));
    this.setState({ image: e.value });

    let imageTagList = this.state.imageAllTagList
      .filter(cur => {
        return cur.image === e.value;
      })[0]
      .value.map(version => {
        return {
          value: version,
          label: version,
        };
      });
    this.setState({ imageTag: imageTagList[0].value });
    this.setState({ imageTagList });
  };

  onImageTagChange = e => {
    this.setState(prevState => ({
      podTemplate: {
        ...prevState.podTemplate,
        imageTag: e.value,
      },
    }));
    this.setState({ imageTag: e.value });
  };

  onPodTemplateResourceChange = e => {
    console.log('figure type: ', typeof e.value);

    if (typeof e.value === 'string') {
      this.setState(prevState => ({
        podTemplate: {
          ...prevState.podTemplate,
          [e.id]: e.value,
        },
      }));
      // podTemplate[e.id] = e.value;
    } else {
      this.setState(prevState => ({
        podTemplate: {
          ...prevState.podTemplate,
          [e.id]: _.cloneDeep(e.value),
        },
      }));
    }
    console.log(this.state.podTemplate);
  }; // podTemplate 안에 resource들이 변경 되었을 때 불리게 될 event

  save(e) {
    e.preventDefault();

    this.setState({ inProgress: true });
    let daemonSet = _.cloneDeep(this.state.daemonSet);
    let podTemplate = _.cloneDeep(this.state.podTemplate);

    let request = podTemplate.requests.map(cur => {
      return { [cur[0]]: cur[1] };
    });
    let limit = podTemplate.limits.map(cur => {
      return { [cur[0]]: cur[1] };
    });
    let port = podTemplate.ports.map(cur => {
      return { name: cur[0], containerPort: cur[1], protocol: cur[2] };
    });
    let env = podTemplate.env.map(cur => {
      return { name: cur[0], value: cur[1] };
    });

    if (podTemplate.usePodTemplate) {
      let template = {
        metadata: {
          labels: _.cloneDeep(this.state.daemonSet.spec.selector.matchLabels),
        },
        spec: {
          containers: {
            name: this.state.daemonSet.metadata.name + '-template',
            image: podTemplate.imageRegistry + '/' + podTemplate.image + ':' + podTemplate.imageTag,
            command: _.cloneDeep(podTemplate.command),
            args: _.cloneDeep(podTemplate.args),
            imagePullPolicy: podTemplate.imagePullPolicy,
            env: _.cloneDeep(env),
            resources: {
              requests: _.cloneDeep(request),
              limits: _.cloneDeep(limit),
            },
            ports: _.cloneDeep(port),
          },
          // volumes,
          restartPolicy: podTemplate.restartPolicy,
        },
      };
      console.log(template);
      daemonSet.spec.template = _.cloneDeep(template);
    } else {
      let template = {
        spec: {
          containers: {
            image: podTemplate.iporurl,
          },
        },
      };
      console.log(template);
      daemonSet.spec.template = _.cloneDeep(template);
    }
    console.log(daemonSet);
  }

  render() {
    const { kind, t } = this.props;

    const schedulerItems = [
      { value: 'allnodes', title: t('STRING:DAEMONSET-CREATE_0') },
      { value: 'specificnodes', title: t('STRING:DAEMONSET-CREATE_1') },
      { value: 'somenodes', title: t('STRING:DAEMONSET-CREATE_2') },
    ];

    const updateTypeList = [
      { value: 'rolling-update', label: t('CONTENT:ROLLINTUPDATE') },
      { value: 'manual-delete', label: t('CONTENT:MANUALDELETE') },
    ];

    return (
      <div className="form-create co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('DaemonSet', t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('DaemonSet', t) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:STATEFULSET-CREATE_0')}</p>

          <fieldset disabled={!this.props.isCreate}>
            <FirstSection label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.daemonSet.metadata.name} id="daemoset-name" />
            </FirstSection>
            <FirstSection label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="daemoset-namespace" t={t} onChange={this.onNamespaceChanged} />
            </FirstSection>
            <FirstSection
              label={t('CONTENT:LABELS')}
              children={
                <div>
                  <div>
                    <div>
                      <SelectorInput labelClassName="co-text-namespace" onChange={this.onLabelChanged} tags={[]} t={t} />
                    </div>
                  </div>
                  <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                    <p>{t('VALIDATION:LABEL_FORM')}</p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#696969' }}>
                    <p>{t('STRING:STATEFULSET-CREATE_1')}</p>
                  </div>
                </div>
              }
            />
            <PodTemplate
              t={t}
              imageRegistry={this.state.imageRegistry}
              image={this.state.image}
              imageTag={this.state.imageTag}
              onImageChange={this.onImageChange}
              onImageRegistryChange={this.onImageRegistryChange}
              onImageTagChange={this.onImageTagChange}
              onLabelChanged={this.onLabelChanged}
              onPodTemplateResourceChange={this.onPodTemplateResourceChange}
              podTemplate={this.state.podTemplate}
              pvcList={this.state.pvcList}
              imageRegistryList={this.state.imageRegistryList}
              imageList={this.state.imageList}
              imageTagList={this.state.imageTagList}
            />
            <FirstSection label={t('CONTENT:NODESCHEDULER')}>
              {schedulerItems.map(({ desc, title, value }) => (
                <div key={value}>
                  <RadioInput
                    checked={value === this.state.nodeScheduler}
                    desc={desc}
                    onChange={e => {
                      this.setState({ nodeScheduler: e.target.value });
                    }}
                    title={title}
                    value={value}
                  />
                  {value === this.state.nodeScheduler && <NodeSchedulerChildren value={value} t={t} _updateNodes={this._updateNodes} nodes={this.state.nodes} />}
                </div>
              ))}
            </FirstSection>
            <FirstSection label={t('CONTENT:UPDATESTRATEGY')}>
              <div className="row">
                <div className="col-xs-2" style={{ float: 'left', marginLeft: '15px' }}>
                  <SecondSection2 label={t('CONTENT:UPDATETYPE')} id={'updatetype'}>
                    <SingleSelect
                      options={updateTypeList}
                      defaultValue={updateTypeList[0]}
                      name={'UpdateType'}
                      placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:TYPE') })}
                      onChange={e => {
                        this.setState({ updateType: e.value });
                      }}
                    />
                  </SecondSection2>
                </div>
                <div className="col-xs-2" style={{ float: 'left', marginLeft: '15px' }}>
                  <SecondSection2 label={t('CONTENT:MAXPODNUM')}>
                    <input
                      className="form-control"
                      type="text"
                      id="maxpodnum"
                      onChange={e => {
                        this.setState({ maxPodNum: e.value });
                      }}
                      required
                    />
                  </SecondSection2>
                </div>
              </div>
              <span>데몬 셋 템플릿에서 업데이트를 진행 시 새로운 파드 생성 방식을 선택해 주세요.</span>
            </FirstSection>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('daemonsets')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateDaemonSet = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <DaemonSetFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} daemonSetTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

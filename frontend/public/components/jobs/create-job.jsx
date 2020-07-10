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
import { FirstSection, SecondSection, PodTemplate } from '../utils/form';
import SingleSelect from '../utils/select';
import { ValueEditor } from '../utils/value-editor';
// import { VolumeclaimTemplate } from '../utils/form/volumeclaim-template';

class JobFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingJob = _.pick(props.obj, ['metadata', 'type']);
    const job = _.defaultsDeep({}, props.fixed, existingJob, {
      apiVersion: 'v1',
      kind: 'Job',
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
      jobTypeAbstraction: this.props.jobTypeAbstraction,
      job: job,
      podTemplate: podTemplate,
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
      isUseMaual: true,
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
    let job = { ...this.state.job };
    job.metadata.name = String(event.target.value);
    this.setState({ job });
  }
  onNamespaceChanged(namespace) {
    let job = { ...this.state.job };
    job.metadata.namespace = String(namespace);
    this.setState({ job });
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
          this.setState({ job: [] });
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
    const namespace = job.metadata.namespace || 'default';
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
          this.setState({ job: [] });
        },
      );
  };

  onLabelChanged(event) {
    let job = { ...this.state.job };
    job.spec.selector.matchLabels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        job.spec.selector.matchLabels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ job });
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
    let job = _.cloneDeep(this.state.job);
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
          labels: _.cloneDeep(this.state.job.spec.selector.matchLabels),
        },
        spec: {
          containers: {
            name: this.state.job.metadata.name + '-template',
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
      job.spec.template = _.cloneDeep(template);
    } else {
      let template = {
        spec: {
          containers: {
            image: podTemplate.iporurl,
          },
        },
      };
      console.log(template);
      job.spec.template = _.cloneDeep(template);
    }
    console.log(job);
  }

  render() {
    const { kind, t } = this.props;
    const { isUseManual } = this.state;

    return (
      <div className="form-create co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Job', t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('Job', t) })}</h1>
          <p className="co-m-pane__explanation">하나 이상의 파드를 작성하고 지정된 수의 파드를 성공적으로 종료하도록 합니다.</p>

          <fieldset disabled={!this.props.isCreate}>
            <FirstSection label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.job.metadata.name} id="job-name" />
            </FirstSection>
            <FirstSection label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="job-namespace" t={t} onChange={this.onNamespaceChanged} />
            </FirstSection>
            <FirstSection label={t('CONTENT:USEMANUALSELECTOR')} isRequired={false}>
              <div className="row">
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input
                    type="radio"
                    value={true}
                    name="use-manual"
                    onChange={e => {
                      this.setState({ isUseManual: true });
                    }}
                    checked={isUseManual}
                  />
                  {t('CONTENT:USE')}
                </div>
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input
                    type="radio"
                    value={false}
                    name="use-manual"
                    onChange={e => {
                      this.setState({ isUseManual: false });
                    }}
                    checked={!isUseManual}
                  />
                  {t('CONTENT:UNUSE')}
                </div>
              </div>
              {isUseManual && <span>만약 해당 잡의 파드에 고유하지 않고 연관이 없는 파드와 일치하는 레이블 셀렉터를 지정하면, 연관이 없는 잡의 파드가 삭제되거나, 해당 잡이 다른 파드가 완료한것으로 수를 세거나, 하나 또는 양쪽 잡 모두 파드 생성이나 실행 완료를 거부할 수 있습니다. 만약 고유하지 않은 셀렉터가 선택된 경우, 다른 컨트롤러(예: 레플리케이션 컨트롤러)와 해당 파드는 예측할 수 없는 방식으로 작동할 수 있습니다.</span>}
            </FirstSection>
            {isUseManual && (
              <div>
                <SecondSection label={'잡 레이블'} id={'job-label'}>
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
                      <p>파드를 관리하기 위한 잡 레이블을 정의합니다.</p>
                    </div>
                  </div>
                </SecondSection>
              </div>
            )}
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
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('jobs')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>

            <FirstSection label={'고급 옵션'}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.job.metadata.name} id="job-name" />
            </FirstSection>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateJob = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <JobFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} jobTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

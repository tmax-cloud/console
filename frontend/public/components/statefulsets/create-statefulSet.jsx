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
import { NsDropdown } from '../RBAC';
import { FirstSection, SecondSection, PodTemplate, VolumeclaimTemplate } from '../utils/form';
// import { PodTemplate } from '../utils/form/pod-template';
// import { VolumeclaimTemplate } from '../utils/form/volumeclaim-template';

class StatefulSetFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingStatefulSet = _.pick(props.obj, ['metadata', 'type']);
    const statefulSet = _.defaultsDeep({}, props.fixed, existingStatefulSet, {
      apiVersion: 'v1',
      kind: 'StatefulSet',
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
        volumeClaimTemplates: {
          metadata: {
            name: '',
          },
          spec: {
            accessModes: [],
            storageClassName: '',
            resources: {
              requests: {
                storage: '',
              },
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
    const volumeclaimTemplate = {
      name: '',
      accessModes: 'ReadWriteOnce',
      storageClassName: '',
      storage: '',
      useVolumeclaimTemplate: true,
    };

    this.state = {
      statefulSetTypeAbstraction: this.props.statefulSetTypeAbstraction,
      statefulSet: statefulSet,
      podTemplate: podTemplate,
      volumeclaimTemplate: volumeclaimTemplate,
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
      // quota: [['', '']],
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.onServiceNameChanged = this.onServiceNameChanged.bind(this);
    this.onReplicaChanged = this.onReplicaChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);

    this.getImageRegistryList = this.getImageRegistryList.bind(this);
    this.getImageList = this.getImageList.bind(this);
    this.getPVCList = this.getPVCList.bind(this);
    this.getStorageClassList = this.getStorageClassList.bind(this);

    this.save = this.save.bind(this);
  }
  componentDidMount() {
    this.getImageRegistryList();
    this.getPVCList();
    this.getStorageClassList();
  }

  onNameChanged(event) {
    let statefulSet = { ...this.state.statefulSet };
    statefulSet.metadata.name = String(event.target.value);
    this.setState({ statefulSet });
  }
  onNamespaceChanged(namespace) {
    let statefulSet = { ...this.state.statefulSet };
    statefulSet.metadata.namespace = String(namespace);
    this.setState({ statefulSet });
  }

  onServiceNameChanged(event) {
    let statefulSet = { ...this.state.statefulSet };
    statefulSet.spec.serviceName = event.target.value;
    this.setState({ statefulSet });
  }
  onReplicaChanged(event) {
    let statefulSet = { ...this.state.statefulSet };
    statefulSet.spec.replicas = event.target.value;
    this.setState({ statefulSet });
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
          this.setState({ statefulSet: [] });
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
    const namespace = statefulSet.metadata.namespace || 'default';
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
          this.setState({ statefulSet: [] });
        },
      );
  };
  getStorageClassList = () => {
    const ko = kindObj('StorageClass');
    k8sList(ko)
      .then(reponse => reponse)
      .then(
        data => {
          let storageClassNameList = data.map(cur => {
            return {
              value: cur.metadata.name,
              id: 'storageClass',
              label: cur.metadata.name,
            };
          });
          this.setState({ storageClassNameList });

          let node = { ...this.state.volumeclaimTemplate };
          node.storageClassName = String(storageClassNameList[0].value);
          // podTemplate.imageRegistry = String(imageRegistryList[0]);
          // podTemplate.imageRegistry = String(imageRegistryList[0].value);
          this.setState({ volumeclaimTemplate: node });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ statefulSet: [] });
        },
      );
  };

  onLabelChanged(event) {
    let statefulSet = { ...this.state.statefulSet };
    statefulSet.spec.selector.matchLabels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        statefulSet.spec.selector.matchLabels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ statefulSet });
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

  onVolumeclaimTemplateChange = e => {
    console.log('figure type: ', typeof e.value);
    // if (typeof e.value === 'string') {
    this.setState(
      prevState => ({
        volumeclaimTemplate: {
          ...prevState.volumeclaimTemplate,
          [e.id]: e.value,
        },
      }),
      console.log(this.state.volumeclaimTemplate),
    );
    // }
    // else {
    //   volumeclaimTemplate[e.id] = _.cloneDeep(e.value);
    // }
    // console.log(this.state.volumeclaimTemplate);
  }; // podTemplate 안에 resource들이 변경 되었을 때 불리게 될 event

  save(e) {
    e.preventDefault();

    this.setState({ inProgress: true });
    let statefulSet = _.cloneDeep(this.state.statefulSet);
    let podTemplate = _.cloneDeep(this.state.podTemplate);
    let volumeclaimTemplate = _.cloneDeep(this.state.volumeclaimTemplate);

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
          labels: _.cloneDeep(this.state.statefulSet.spec.selector.matchLabels),
        },
        spec: {
          containers: {
            name: this.state.statefulSet.metadata.name + '-template',
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
          volumes,
          restartPolicy: podTemplate.restartPolicy,
        },
      };
      console.log(template);
      statefulSet.spec.template = _.cloneDeep(template);
    } else {
      let template = {
        spec: {
          containers: {
            image: podTemplate.iporurl,
          },
        },
      };
      console.log(template);
      statefulSet.spec.template = _.cloneDeep(template);
    }
    if (volumeclaimTemplate.useVolumeclaimTemplate) {
      let template = {
        metadata: {
          name: volumeclaimTemplate.name,
        },
        spec: {
          accessModes: volumeclaimTemplate.accessModes,
          storageClassName: volumeclaimTemplate.storageClassName,
          resources: {
            requests: {
              storage: volumeclaimTemplate.storage,
            },
          },
        },
      };
      console.log(template);
      statefulSet.spec.volumeClaimTemplates = _.cloneDeep(template);
    }
    console.log(statefulSet);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="form-create co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:STATEFULSET-CREATE_0')}</p>

          <fieldset disabled={!this.props.isCreate}>
            <FirstSection label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.statefulSet.metadata.name} id="statefulset-name" required />
            </FirstSection>
            <FirstSection label={t('CONTENT:NAMESPACE')} isRequired={true}>
              <NsDropdown id="stateful-set-namespace" t={t} onChange={this.onNamespaceChanged} />
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
            <FirstSection label={t('CONTENT:SERVICENAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onServiceNameChanged} id="service-name" required />
            </FirstSection>
            <FirstSection label={t('CONTENT:REPLICA')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onReplicaChanged} id="replica" required />
              <div style={{ fontSize: '12px', color: '#696969' }}>
                <p>{t('STRING:STATEFULSET-CREATE_2')}</p>
              </div>
            </FirstSection>
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
            <VolumeclaimTemplate t={t} onVolumeclaimTemplateChange={this.onVolumeclaimTemplateChange} storageClassNameList={this.state.storageClassNameList} />
            {/* <FirstSection label={t('CONTENT:PERSISTENTVOLUMECLAIM')} isRequired={true}>
              <input className="form-control" type="text" onChange={} value={} id="replica" />
              <div style={{ fontSize: '12px', color: '#696969' }}>
                <p>{t('STRING:STATEFULSET-CREATE_2')}</p>
              </div>
            </FirstSection> */}
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('statefulsets')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateStatefulSet = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <StatefulSetFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} statefulSetTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};

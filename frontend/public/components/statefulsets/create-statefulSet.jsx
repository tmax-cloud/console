/* eslint-disable no-undef */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
// import { NsDropdown } from '../RBAC/bindings';
import { k8sList, k8sGet, k8sCreate, k8sUpdate, K8sResourceKind } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput, makeQuery } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { FirstSection, SecondSection } from '../utils/form/section';
import { PodTemplate } from '../utils/form/pod-template';
import { VolumeclaimTemplate } from '../utils/form/volumeclaim-template';

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
      usePodTemplate: '',
    };
    const volumeclaimTemplate = {
      name: '',
      accessModes: '',
      storageClassName: '',
      storage: '',
      useVolumeclaimTemplate: '',
    };

    this.state = {
      statefulSetTypeAbstraction: this.props.statefulSetTypeAbstraction,
      statefulSet: statefulSet,
      podTemplate: podTemplate,
      volumeclaimTemplate: volumeclaimTemplate,
      inProgress: false,
      type: 'form',
      imageRegistryList: [], // podTemplate 에서 imageRegistry List
      imageList: [],
      imageTagList: [],
      imageAllTagList: [],
      pvcList: [], // podTemplate 에서 pvc List
      // quota: [['', '']],
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);

    this.getImageRegistryList = this.getImageRegistryList.bind(this);

    this.save = this.save.bind(this);
  }
  componentDidMount() {
    this.getImageRegistryList();
    this.getPVCList();
  }

  onNameChanged(event) {
    let serviceAccount = { ...this.state.serviceAccount };
    serviceAccount.metadata.name = String(event.target.value);
    this.setState({ serviceAccount });
  }
  onNamespaceChanged(namespace) {
    let statefulSet = { ...this.state.statefulSet };
    statefulSet.metadata.namespace = String(namespace);
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
    let query = makeQuery(statefulSet.metadata.namespace, { matchLabels: { registry: `${obj.metadata.name}` } }, '', 'Image');
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
          node.image = String(imageList[0].value);
          // podTemplate.image = String(imageList[0].value);

          let imageTagList = data
            .filter(image => {
              if (image.metadata.name === node.image) {
                return true;
              }
            })[0]
            .spec.versions.map(version => {
              return {
                value: version,
                label: version,
              };
            });

          let imageAllTagList = data.map(image => {
            return {
              value: image.spec.versions,
              label: image.spec.versions,
              image: image.metadata.name,
            };
          });

          node.imageTag = String(imageTagList[0].value);
          // podTemplate.imageTag = String(imageTagList[0].value);

          this.setState({ podTemplate: node });

          this.setState({ imageTagList });
          this.setState({ imageList });
          this.setState({ imageAllTagList });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
        },
      );
  };

  getPVCList = () => {
    const ko = kindObj('PersistentVolumeClaim');
    const namespace = statefulSet.metadata.namespace || 'default';
    k8sGet(ko, '', namespace)
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
          node.volumes = [['', '', String(pvcList[0].value), false]];
          podTemplate.volumes = [['', '', String(pvcList[0].value), false]];
          this.setState({ podTemplate: node });
          this.setState({ pvcList });
        },
        err => {
          this.setState({ error: err.message, inProgress: false });
          this.setState({ statefulSet: [] });
        },
      );
  };

  onImageRegistryChange = e => {
    getImageList({ metadata: { name: e.label } });
    this.setState(prevState => ({
      podTemplate:{
        ...prevState.podTemplate,
        imageRegistry: e.value,
      }
    }));
    // podTemplate.imageRegistry = e.value;
    // setImageListBind(imageList);
  };

  onImageChange = e => {
    this.setState(prevState => ({
      podTemplate:{
        ...prevState.podTemplate,
        image: e.value,
        imageTag: e.tagList[0]
      }
    }));

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
    this.setState({ imageTagList });
    // podTemplate.image = e.value;
    // podTemplate.imageTag = e.tagList[0];
    // console.log(imageAllTagList);
    // imageTagList = imageAllTagList
    //   .filter(cur => {
    //     return cur.image === e.value;
    //   })[0]
    //   .value.map(version => {
    //     return {
    //       value: version,
    //       label: version,
    //     };
    //   });
    // setImageTag(e.tagList[0]);
  };

  onPodTemplateResourceChange = e => {
    console.log('figure type: ', typeof e.value);

    

    if (typeof e.value === 'string') {
      this.setState(prevState => ({
        podTemplate:{
          ...prevState.podTemplate,
          [e.id]: e.value,
        }
      }));
      // podTemplate[e.id] = e.value;
    } else {
      this.setState(prevState => ({
        podTemplate:{
          ...prevState.podTemplate,
          [e.id]: _.cloneDeep(e.value)
        }
      }));
      // podTemplate[e.id] = _.cloneDeep(e.value);
    }
    console.log(this.state.podTemplate);
  }; // podTemplate 안에 resource들이 변경 되었을 때 불리게 될 event

  onVolumeclaimTemplateChange = e => {
    console.log('figure type: ', typeof e.value);
    if (typeof e.value === 'string') {
      volumeclaimTemplate[e.id] = e.value;
    } else {
      volumeclaimTemplate[e.id] = _.cloneDeep(e.value);
    }
    console.log(volumeclaimTemplate);
  }; // podTemplate 안에 resource들이 변경 되었을 때 불리게 될 event

  save(e) {
    e.preventDefault();

    this.setState({ inProgress: true });
    statefulSet = _.cloneDeep(this.state.statefulSet);
    if (podTemplate.usePodTemplate) {
      let template = {
        metadata: {
          labels: _.cloneDeep(this.state.statefulSet.spec.selector.matchLabels),
        },
        spec: {
          containers: {
            name: this.state.statefulSet.metadata.name,
            image: podTemplate.imageRegistry + '/' + podTemplate.image + ':' + podTemplate.imageTag,
            command: _.cloneDeep(podTemplate.command),
            args: _.cloneDeep(podTemplate.args),
            imagePullPolicy: podTemplate.imagePullPolicy,
            env: _.cloneDeep(podTemplate.env),
          },
        },
      };
      console.log(template);
    }

    // const { kind, metadata } = this.state.serviceAccount;
    // this.setState({ inProgress: true });
    // const newServiceAccount = _.assign({}, this.state.serviceAccount);

    // const ko = kindObj(kind);
    // (this.props.isCreate ? k8sCreate(ko, newServiceAccount) : k8sUpdate(ko, newServiceAccount, metadata.namespace, newServiceAccount.metadata.name)).then(
    //   () => {
    //     this.setState({ inProgress: false });
    //     history.push(`/k8s/ns/${metadata.namespace}/serviceaccounts/${metadata.name}`);
    //   },
    //   err => this.setState({ error: err.message, inProgress: false }),
    // );
  }

  render() {
    const { t } = this.props;

    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StatefulSet', t) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:STATEFULSET-CREATE_0')}</p>

          <fieldset disabled={!this.props.isCreate}>
            <FirstSection label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control form-group" type="text" onChange={this.onNameChanged} value={this.state.statefulSet.metadata.name} id="service-account-name" required />
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
              <input className="form-control" type="text" onChange={} value={} id="service-name" required />
            </FirstSection>
            <FirstSection label={t('CONTENT:REPLICA')} isRequired={true}>
              <input className="form-control" type="text" onChange={} value={} id="replica" required />
              <div style={{ fontSize: '12px', color: '#696969' }}>
                <p>{t('STRING:STATEFULSET-CREATE_2')}</p>
              </div>
            </FirstSection>
            <PodTemplate t={t} onImageChange={this.onImageChange} onImageRegistryChange={this.onImageRegistryChange} podTemplate={this.state.podTemplate} pvcList={this.state.pvcList} imageRegistryList={this.state.imageRegistryList} imageList={this.state.imageList} imageTagList={this.state.imageTagList} imageAllTagList={this.state.imageAllTagList} onLabelChanged={this.onLabelChanged} onPodTemplateResourceChange={this.onPodTemplateResourceChange} getImageList={this.getImageList} />
            <VolumeclaimTemplate t={t} onVolumeclaimTemplateChange={this.onVolumeclaimTemplateChange} />
            {/* <FirstSection label={t('CONTENT:PERSISTENTVOLUMECLAIM')} isRequired={true}>
              <input className="form-control" type="text" onChange={} value={} id="replica" />
              <div style={{ fontSize: '12px', color: '#696969' }}>
                <p>{t('STRING:STATEFULSET-CREATE_2')}</p>
              </div>
            </FirstSection> */}
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button
                type="submit"
                className="btn btn-primary"
                id="sa
              ve-changes"
              >
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('serviceaccounts')} className="btn btn-default" id="cancel">
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

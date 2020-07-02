import * as _ from 'lodash-es';
import * as React from 'react';
import { k8sList, k8sGet } from '../../../module/k8s';
import { SelectorInput, kindObj } from '../';
import { ValueEditor } from '../value-editor';
import { KeyValueEditor } from '../key-value-editor';
import { VolumeEditor } from '../volume-editor';
import { FirstSection, SecondSection } from './section';
import { BasicPortEditor } from '../basic-port-editor';
import SingleSelect from '../select';

export const PodTemplate = props => {
  let { t, podTemplate, onLabelChanged, imageRegistryList, pvcList, imageList, onPodTemplateResourceChange, imageTagList, onImageChange, onImageRegistryChange } = props;

  // const [imageRegistry, setImageRegistry] = React.useState(imageRegistryList.length && imageRegistryList[0]);
  const [imageRegistry, setImageRegistry] = React.useState({ value: '', label: '' });
  const [image, setImage] = React.useState(imageList.length && imageList[0].value);
  const [imageTag, setImageTag] = React.useState(imageTagList.length && imageTagList[0].value);
  const [imagePullPolicy, setImagePullPolicy] = React.useState('');

  // const [imageTagListBind, setImageTagListBind] = React.useState(imageTagList);
  // const [imageListBind, setImageListBind] = React.useState(imageList);

  const [runCommands, setRunCommands] = React.useState([['']]);
  const [runCommandArguments, setRunCommandArguments] = React.useState([['']]);
  const [envs, setEnvs] = React.useState([['', '']]);
  const [ports, setPorts] = React.useState([['', '', 'TCP']]);
  const [volumes, setVolumes] = React.useState([['', '', pvcList.length && pvcList[0].value, false]]);
  const [requests, setRequests] = React.useState([['', '']]);
  const [limits, setLimits] = React.useState([['', '']]);
  const [restartPolicy, setRestartPolicy] = React.useState('');
  const [usePodTemplate, setUsePodTemplate] = React.useState(true);

  // dto에 담을 때는 영어로
  const imagePullPolicyList = [
    { value: 'IfNotPresent', label: t('CONTENT:IFNOTPRESENT') },
    { value: 'Always', label: t('CONTENT:ALWAYS') },
    { value: 'Never', label: t('CONTENT:NEVER') },
  ];

  const restartPolicyList = [
    { value: 'Always', label: t('CONTENT:ALWAYS') },
    { value: 'OnFailure', label: t('CONTENT:ONFAILURE') },
    { value: 'Never', label: t('CONTENT:NEVER') },
  ];

  // const onImageRegistryChange = e => {
  //   setImageRegistry(e.value);
  //   getImageList({ metadata: { name: e.label } });
  //   // setImageListBind(imageList);
  // };

  // const onImageChange = e => {
  //   setImage(e.value);
  //   console.log(imageAllTagList);
  //   imageTagList = imageAllTagList
  //     .filter(cur => {
  //       return cur.image === e.value;
  //     })[0]
  //     .value.map(version => {
  //       return {
  //         value: version,
  //         label: version,
  //       };
  //     });
  //   setImageTag(e.tagList[0]);
  // };
  return (
    <div>
      <div>
        <FirstSection label={t('CONTENT:PODTEMPLATE')} isRequired={false}>
          <div className="row">
            <div className="col-xs-2" style={{ float: 'left' }}>
              <input
                type="radio"
                value={true}
                name="pod-template"
                onChange={e => {
                  setUsePodTemplate(true);
                  onPodTemplateResourceChange({
                    value: true,
                    id: 'usePodTemplate',
                    label: '',
                  });
                }}
                checked={usePodTemplate}
              />
              {t('CONTENT:IMAGEREGISTRY')}
            </div>
            <div className="col-xs-2" style={{ float: 'left' }}>
              <input
                type="radio"
                value={false}
                name="pod-template"
                onChange={e => {
                  setUsePodTemplate(false);
                  onPodTemplateResourceChange({
                    value: false,
                    id: 'usePodTemplate',
                    label: '',
                  });
                }}
                checked={!usePodTemplate}
              />
              {t('CONTENT:BYSELF')}
            </div>
          </div>
        </FirstSection>

        {usePodTemplate && (
          <div id="pod-template">
            <SecondSection valueWidth={'400px'} label={'이미지 레지스트리'} id={'imageregistry'}>
              <SingleSelect
                options={imageRegistryList}
                name={'ImageRegistry'}
                value={imageRegistry.value}
                label={imageRegistry.label}
                onChange={e => {
                  onImageRegistryChange(e);
                  onPodTemplateResourceChange(e);
                }}
              />
            </SecondSection>
            <SecondSection valueWidth={'400px'} label={'이미지'} id={'image'}>
              <SingleSelect
                options={imageList}
                name={'Image'}
                value={podTemplate.image}
                onChange={e => {
                  onImageChange(e);
                  onPodTemplateResourceChange(e);
                }}
              />
            </SecondSection>
            <SecondSection valueWidth={'400px'} label={'이미지 태그'} id={'image-tag'}>
              <SingleSelect
                options={imageTagList}
                name={'ImageTag'}
                value={podTemplate.imageTag}
                onChange={e => {
                  setImageTag(e.value);
                  onPodTemplateResourceChange(e);
                }}
              />
            </SecondSection>
            <SecondSection label={t('CONTENT:LABELS')}>
              <div>
                <div>
                  <div>
                    <SelectorInput labelClassName="co-text-namespace" onChange={onLabelChanged} tags={[]} t={t} />
                  </div>
                </div>
                <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                  <p>{t('VALIDATION:LABEL_FORM')}</p>
                </div>
                <div style={{ fontSize: '12px', color: '#696969' }}>
                  <p>{t('STRING:STATEFULSET-CREATE_1')}</p>
                </div>
              </div>
            </SecondSection>
            {/* Run command */}
            <SecondSection label={t('CONTENT:RUNCOMMAND')}>
              <ValueEditor
                desc={t('STRING:CREATE-DEPLOYMENT_0')}
                title="false"
                valueString="RunCommand"
                t={t}
                updateParentData={e => {
                  setRunCommands(e.values);
                  onPodTemplateResourceChange({
                    value: e.values,
                    id: 'command',
                    label: '',
                  });
                }}
                values={runCommands}
                // updateParentData={setRunCommands}
              />
            </SecondSection>
            {/* Run command arguments */}
            <SecondSection label={t('CONTENT:RUNCOMMANDARGUMENTS')}>
              <ValueEditor
                desc={t('STRING:CREATE-DEPLOYMENT_1')}
                title="false"
                valueString="RunCommandArguments"
                t={t}
                values={runCommandArguments}
                updateParentData={e => {
                  setRunCommandArguments(e.values);
                  onPodTemplateResourceChange({
                    value: e.values,
                    id: 'arg',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Image Pull Policy */}
            <SecondSection valueWidth={'400px'} label={'이미지 풀 정책'} id={'image-pull-policy'}>
              <SingleSelect
                options={imagePullPolicyList}
                name={'ImagePullPolicy'}
                value={t(`CONTENT:${imagePullPolicy.toUpperCase()}`)}
                onChange={e => {
                  setImagePullPolicy(e.value);
                  onPodTemplateResourceChange({
                    value: e.value,
                    id: 'imagePullPolicy',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Environment variables */}
            <SecondSection label={'환경 변수'} id={'environment'}>
              <KeyValueEditor
                t={t}
                keyValuePairs={envs}
                updateParentData={e => {
                  setEnvs(e.keyValuePairs);
                  onPodTemplateResourceChange({
                    value: e.keyValuePairs,
                    id: 'env',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Port */}
            <SecondSection label={'포트'} id={'port'}>
              <BasicPortEditor
                t={t}
                portPairs={ports}
                updateParentData={e => {
                  setPorts(e.portPairs);
                  onPodTemplateResourceChange({
                    value: e.portPairs,
                    id: 'ports',
                    label: '',
                  });
                }}
              />
            </SecondSection>

            {/* Volume */}
            <SecondSection label={'볼륨'} id={'volume'}>
              <VolumeEditor
                options={pvcList}
                t={t}
                volumePairs={volumes}
                updateParentData={e => {
                  setVolumes(e.volumePairs);
                  onPodTemplateResourceChange({
                    value: e.volumePairs,
                    id: 'volumes',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Resource Request */}
            <SecondSection label={'리소스 요청'} id={'request'}>
              <KeyValueEditor
                keyValuePairs={requests}
                t={t}
                keyString="resource(request)"
                valueString="resource(request)"
                updateParentData={e => {
                  setRequests(e.keyValuePairs);
                  onPodTemplateResourceChange({
                    value: e.keyValuePairs,
                    id: 'requests',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Resource Limit */}
            <SecondSection label={'리소스 제한'} id={'limit'}>
              <KeyValueEditor
                keyValuePairs={limits}
                t={t}
                keyString="resource(limits)"
                valueString="resource(limits)"
                updateParentData={e => {
                  setLimits(e.keyValuePairs);
                  onPodTemplateResourceChange({
                    value: e.keyValuePairs,
                    id: 'limits',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Restart Policy */}
            <SecondSection valueWidth={'400px'} label={'재시작 정책'} id={'restart'}>
              <SingleSelect
                options={restartPolicyList}
                name={'RestartPolicy'}
                value={t(`CONTENT:${restartPolicy.toUpperCase()}`)}
                onChange={e => {
                  setRestartPolicy(e.value);
                  onPodTemplateResourceChange({
                    value: e.value,
                    id: 'restartPolicy',
                    label: '',
                  });
                }}
              />
            </SecondSection>
          </div>
        )}
        {!usePodTemplate && (
          <div>
            <SecondSection label={t('CONTENT:IPORURL')}>
              <input
                className="form-control"
                type="text"
                value={}
                id="service-name"
                onChange={e => {
                  onPodTemplateResourceChange(e.target.value);
                }}
                required
              />
            </SecondSection>
          </div>
        )}
      </div>
    </div>
  );
};

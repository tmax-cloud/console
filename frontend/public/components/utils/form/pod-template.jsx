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
  let { t, imageRegistry, image, imageTag, podTemplate, onLabelChanged, imageRegistryList, pvcList, imageList, onPodTemplateResourceChange, imageTagList, onImageTagChange, onImageChange, onImageRegistryChange } = props;

  // const [imageRegistry, setImageRegistry] = React.useState(imageRegistryList.length && imageRegistryList[0]);
  // const [imageRegistry, setImageRegistry] = React.useState({ value: '', label: '' });
  // const [image, setImage] = React.useState(imageList.length > 0 && imageList[0].value);
  // const [imageTag, setImageTag] = React.useState(imageTagList.length > 0 && imageTagList[0].value);
  const [imagePullPolicy, setImagePullPolicy] = React.useState('');

  const [runCommands, setRunCommands] = React.useState([['']]);
  const [runCommandArguments, setRunCommandArguments] = React.useState([['']]);
  const [envs, setEnvs] = React.useState([['', '']]);
  const [ports, setPorts] = React.useState([['', '', 'TCP']]);
  const [volumes, setVolumes] = React.useState([['', '', '', false]]);
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
            <SecondSection label={t('CONTENT:IMAGEREGISTRY')} id={'imageregistry'}>
              <SingleSelect
                options={imageRegistryList}
                name={'ImageRegistry'}
                value={imageRegistry.value}
                label={imageRegistry.label}
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:IMAGEREGISTRY') })}
                onChange={e => {
                  // setImageRegistry(e);
                  onImageRegistryChange(e);
                  onPodTemplateResourceChange(e);
                }}
              />
            </SecondSection>
            <SecondSection label={t('CONTENT:IMAGE')} id={'image'}>
              <SingleSelect
                options={imageList}
                name={'Image'}
                value={image}
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:IMAGE') })}
                onChange={e => {
                  // setImage(e.value);
                  onImageChange(e);
                  onPodTemplateResourceChange(e);
                }}
              />
            </SecondSection>
            <SecondSection label={t('CONTENT:IMAGETAG')} id={'image-tag'}>
              <SingleSelect
                options={imageTagList}
                name={'ImageTag'}
                value={imageTag}
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:IMAGETAG') })}
                onChange={e => {
                  onImageTagChange(e);
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
                    id: 'args',
                    label: '',
                  });
                }}
              />
            </SecondSection>
            {/* Image Pull Policy */}
            <SecondSection label={t('CONTENT:IMAGEPULLPOLICY')} id={'image-pull-policy'}>
              <SingleSelect
                options={imagePullPolicyList}
                name={'ImagePullPolicy'}
                label={t(`CONTENT:${imagePullPolicy.toUpperCase()}`)}
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:IMAGEPULLPOLICY') })}
                value={imagePullPolicy}
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
            <SecondSection label={t('CONTENT:ENVVARIABLES')} id={'environment'}>
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
            <SecondSection label={t('CONTENT:PORT')} id={'port'}>
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
            <SecondSection label={t('CONTENT:VOLUME')} id={'volume'}>
              <VolumeEditor
                options={pvcList}
                t={t}
                volumePairs={volumes}
                defaultValue={pvcList.length && pvcList[0].value}
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
            <SecondSection label={t('CONTENT:RESOURCEREQUESTS')} id={'request'}>
              <KeyValueEditor
                keyValuePairs={requests}
                t={t}
                keyString="resource(request)"
                valueString="quantity(request)"
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
            <SecondSection label={t('CONTENT:RESOURCELIMITS')} id={'limit'}>
              <KeyValueEditor
                keyValuePairs={limits}
                t={t}
                keyString="resource(limits)"
                valueString="quantity(limits)"
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
            <SecondSection label={t('CONTENT:RESTARTPOLICY')} id={'restart'}>
              <SingleSelect
                className="form-control"
                options={restartPolicyList}
                name={'RestartPolicy'}
                value={t(`CONTENT:${restartPolicy.toUpperCase()}`)}
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:RESTARTPOLICY') })}
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
                id="iporurl"
                onChange={e => {
                  onPodTemplateResourceChange({
                    value: e.target.value,
                    id: 'iporurl',
                    label: '',
                  });
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

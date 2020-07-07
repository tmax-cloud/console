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

export const VolumeclaimTemplate = props => {
  let { t, onVolumeclaimTemplateChange, storageClassNameList } = props;

  const [useVolumeclaimTemplate, setUseVolumeclaimTemplate] = React.useState(true);
  const [name, setName] = React.useState('');
  const [accessMode, setAccessMode] = React.useState(true);
  const [storageClassName, setStorageClassName] = React.useState('');
  const [storageSizeRequest, setStorageSizeRequest] = React.useState('');

  return (
    <div>
      <div>
        <FirstSection label={t('CONTENT:VOLUMECLAIMTEMPLATE')} isRequired={false}>
          <div className="row">
            <div className="col-xs-2" style={{ float: 'left' }}>
              <input
                type="radio"
                value={true}
                name="volumeclaim-template"
                onChange={e => {
                  setUseVolumeclaimTemplate(true);
                  onVolumeclaimTemplateChange({
                    value: true,
                    id: 'useVolumeclaimTemplate',
                    label: '',
                  });
                }}
                checked={useVolumeclaimTemplate}
              />
              {t('CONTENT:USE')}
            </div>
            <div className="col-xs-2" style={{ float: 'left' }}>
              <input
                type="radio"
                value={false}
                name="volumeclaim-template"
                onChange={e => {
                  setUseVolumeclaimTemplate(false);
                  onVolumeclaimTemplateChange({
                    value: false,
                    id: 'useVolumeclaimTemplate',
                    label: '',
                  });
                }}
                checked={!useVolumeclaimTemplate}
              />
              {t('CONTENT:UNUSE')}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#696969' }}>
            <p>{'스테이트풀 셋에 볼륨 클레임을 생성합니다.'}</p>
          </div>
        </FirstSection>

        {useVolumeclaimTemplate && (
          <div id="volumeclaim-template">
            <SecondSection label={t('ADDITIONAL:NAME', { something: t('CONTENT:VOLUMECLAIMTEMPLATE') })} id={'image'} isRequired={true}>
              <input
                className="form-control"
                type="text"
                value={name}
                id="service-name"
                onChange={e => {
                  setName(e.target.value);
                  onVolumeclaimTemplateChange({
                    value: e.target.value,
                    id: 'name',
                    label: '',
                  });
                }}
                required
              />
            </SecondSection>
            <SecondSection label={t('CONTENT:ACCESSMODE')} isRequired={true}>
              <div className="row">
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input
                    type="radio"
                    value={true}
                    name="access-mode"
                    onChange={e => {
                      setAccessMode(true);
                      onVolumeclaimTemplateChange({
                        value: 'ReadWriteOnce',
                        id: 'accessModes',
                        label: '',
                      });
                    }}
                    checked={accessMode}
                  />
                  {t('CONTENT:READWRITEONCE')}
                </div>
                <div className="col-xs-2" style={{ float: 'left' }}>
                  <input
                    type="radio"
                    value="ReadWriteMany"
                    name="access-mode"
                    onChange={e => {
                      setAccessMode(false);
                      onVolumeclaimTemplateChange({
                        value: false,
                        id: 'accessModes',
                        label: '',
                      });
                    }}
                    checked={!accessMode}
                  />
                  {t('CONTENT:READWRITEMANY')}
                </div>
              </div>
            </SecondSection>
            <SecondSection label={t('CONTENT:STORAGECLASS')} id={'storageclass'}>
              <SingleSelect
                options={storageClassNameList}
                name={'storageClass'}
                value={storageClassName}
                label={storageClassName}
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:STORAGECLASS') })}
                onChange={e => {
                  setStorageClassName(e.value);
                  onVolumeclaimTemplateChange({
                    value: e.value,
                    id: 'storageClassName',
                    label: 'e.label',
                  });
                }}
              />
            </SecondSection>
            <SecondSection label={t('CONTENT:STORAGESIZEREQUEST')} id={'storage-size-request'}>
              <input
                className="form-control"
                type="text"
                value={storageSizeRequest}
                id="storage-size-request"
                placeholder={t('ADDITIONAL:SELECT', { something: t('CONTENT:STORAGESIZEREQUEST') })}
                onChange={e => {
                  setStorageSizeRequest(e.target.value);
                  onVolumeclaimTemplateChange({
                    value: e.target.value,
                    id: 'storage',
                    label: '',
                  });
                }}
              />
            </SecondSection>
          </div>
        )}
        {!useVolumeclaimTemplate && <div>{/* <SecondSection label={t('CONTENT:IPORURL')}>
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
            </SecondSection> */}</div>}
      </div>
    </div>
  );
};

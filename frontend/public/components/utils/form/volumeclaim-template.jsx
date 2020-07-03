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
        </FirstSection>

        {useVolumeclaimTemplate && (
          <div id="volumeclaim-template">
            <SecondSection valueWidth={'400px'} label={'볼륨 클레임 템플릿 이름'} id={'image'} required>
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
            <SecondSection label={'액세스 모드'} required>
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
                  {'ReadWriteOnce'}
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
                  {'ReadWriteMany'}
                </div>
              </div>
            </SecondSection>
            <SecondSection valueWidth={'400px'} label={'스토리지 클래스'} id={'storageclass'}>
              <SingleSelect
                options={storageClassNameList}
                name={'storageClass'}
                value={storageClassName}
                label={storageClassName}
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
            <SecondSection valueWidth={'400px'} label={'Storage Size Request'} id={'storage-size-request'}>
              <input
                className="form-control"
                type="text"
                value={storageSizeRequest}
                id="storage-size-request"
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

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
  let { t, onVolumeclaimTemplateChange } = props;

  const [useVolumeclaimTemplate, setUseVolumeclaimTemplate] = React.useState(true);

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
                value={}
                id="service-name"
                onChange={e => {
                  onVolumeclaimTemplateChange(e.target.value);
                }}
                required
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

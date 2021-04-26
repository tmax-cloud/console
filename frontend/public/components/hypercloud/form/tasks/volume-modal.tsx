import * as React from 'react';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { useWatch } from 'react-hook-form';

export const VolumeModal: React.FC<VolumeModalProps> = ({ methods, volume }) => {
  const typeItems = React.useMemo(
    () => ({
      emptyDir: '빈 디렉토리',
      configMap: '컨피그 맵',
      secret: '시크릿',
    }),
    [],
  );
  let target = document.getElementById('volume-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  let template;
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = volume[idx];
      }
    });
  }
  const type = useWatch({
    control: methods.control,
    name: 'type',
    defaultValue: template ? template.type : 'emptyDir',
  });

  return (
    <>
      <Section label="Name" id="volume-name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label="Type" id="volume-type" isRequired={true}>
        <Dropdown
          name="type"
          className="btn-group"
          title="볼륨 선택" // 드롭다운 title 지정
          methods={methods}
          items={typeItems} // (필수)
          style={{ display: 'block' }}
          buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
          itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
          defaultValue={modalType === 'modify' ? template.type : ''}
        />
      </Section>
      {type === 'configMap' && (
        <Section label="컨피그 맵" id="volume-config-map" isRequired={true}>
          <TextInput id="configMap" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.configMap : ''} />
        </Section>
      )}
      {type === 'secret' && (
        <Section label="시크릿" id="volume-secret" isRequired={true}>
          <TextInput id="secret" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.secret : ''} />
        </Section>
      )}
    </>
  );
};

type VolumeModalProps = {
  methods: any;
  volume: any;
};

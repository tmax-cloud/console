import * as React from 'react';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';

export const OutputResourceModal: React.FC<OutputResourceModalProps> = ({ methods, outputResource }) => {
  const typeItems = React.useMemo(
    () => ({
      git: 'Git',
      image: '이미지',
    }),
    [],
  );
  let target = document.getElementById('output-resource-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  let template;
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = outputResource[idx];
      }
    });
  }
  const [option, setOption] = React.useState(template?.optional);

  return (
    <>
      <Section label="아웃풋 리소스 이름" id="outputresource_name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label="타입" id="outputresource-type" isRequired={true}>
        <Dropdown
          name="type"
          className="btn-group"
          title="타입 선택" // 드롭다운 title 지정
          methods={methods}
          items={typeItems} // (필수)
          style={{ display: 'block' }}
          buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
          itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
          defaultValue={modalType === 'modify' ? template.type : ''}
        />
      </Section>
      <Section label="리소스 저장 경로" id="outputresource_path">
        <TextInput id="targetPath" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.targetPath : ''} />
      </Section>
      <label>
        <input
          name="optional"
          type="checkbox"
          ref={methods.register()}
          checked={option}
          onClick={() => {
            setOption(!option);
          }}
        />
        이 리소스를 선택 항목으로 제공합니다.
      </label>
      <p>선택 항목으로 제공할 경우, 태스크 런 또는 파이프라인 메뉴에서 파이프라인 리소스를 필요에 따라 할당할 수 있습니다.</p>
    </>
  );
};

type OutputResourceModalProps = {
  methods: any;
  outputResource: any;
};

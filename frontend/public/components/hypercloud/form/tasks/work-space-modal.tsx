import * as React from 'react';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
import { TextInput } from '../../utils/text-input';

export const WorkSpaceModal: React.FC<WorkSpaceModalProps> = ({ methods, workSpace }) => {
  const accessModeItem = [
    // RadioGroup 컴포넌트에 넣어줄 items
    {
      title: 'ReadWrite',
      value: 'readWrite',
    },
    {
      title: 'ReadOnly',
      value: 'readOnly',
    },
  ];
  let template;

  //modify 기능 용
  let target = document.getElementById('work-space-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = workSpace[idx];
        // index = idx;
      }
    });
  }
  const defaultAccessMode = modalType === 'modify' ? template?.accessMode : 'readWrite';
  const [option, setOption] = React.useState(template?.optional);

  return (
    <>
      <Section label="워크스페이스 이름" id="workspace_name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label="설명" id="workspace_desc">
        <TextInput id="description" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.description : ''} />
      </Section>
      <Section label="마운트 경로" id="workspace_mountPath">
        <TextInput id="mountPath" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.mountPath : ''} />
      </Section>
      <Section label="접근 모드" id="workspace_access">
        <RadioGroup
          methods={methods}
          name="accessMode" // 서버에 보낼 데이터에서의 path (필수)
          items={accessModeItem} // [{title: '', value: ''}] (필수)
          inline={false} // inline속성 먹일거면 true, 아니면 빼면 됨 (선택)
          initValue={defaultAccessMode}
        />
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
        이 워크스페이스를 선택 항목으로 제공합니다.
      </label>
      <p>선택 항목으로 제공할 경우, 태스크 런 또는 파이프라인 메뉴에서 파이프라인 워크스페이스를 필요에 따라 할당할 수 있습니다.</p>
    </>
  );
};

type WorkSpaceModalProps = {
  methods: any;
  workSpace: any;
};

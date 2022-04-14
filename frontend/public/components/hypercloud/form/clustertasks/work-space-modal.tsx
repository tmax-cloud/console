import * as React from 'react';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
import { TextInput } from '../../utils/text-input';
import { useTranslation } from 'react-i18next';

export const WorkSpaceModal: React.FC<WorkSpaceModalProps> = ({ methods, workSpace }) => {
  const { t } = useTranslation();
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
  const target = document.getElementById('work-space-list');
  // eslint-disable-next-line dot-notation
  const modalType = target && [...target.childNodes].some(cur => cur['dataset'].modify === 'true') ? 'modify' : 'add';
  if (modalType === 'modify') {
    const list = target.childNodes;
    list.forEach((cur, idx) => {
      // eslint-disable-next-line dot-notation
      if (cur['dataset'].modify === 'true') {
        template = workSpace[idx];
        // index = idx;
      }
    });
  }
  const defaultAccessMode = modalType === 'modify' ? template?.accessMode : 'readWrite';
  const [option, setOption] = React.useState(template?.optional);

  return (
    <>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_58')} id="workspace_name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_59')} id="workspace_desc">
        <TextInput id="description" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.description : ''} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_60')} id="workspace_mountPath">
        <TextInput id="mountPath" inputClassName="col-md-12" placeholder="/workspace/<name>" methods={methods} defaultValue={modalType === 'modify' ? template.mountPath : ''} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_63')} id="workspace_access">
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
        {t('SINGLE:MSG_TASKS_CREATFORM_DIV2_66')}
      </label>
      <p>{t('SINGLE:MSG_TASKS_CREATFORM_DIV2_67')}</p>
    </>
  );
};

type WorkSpaceModalProps = {
  methods: any;
  workSpace: any;
};

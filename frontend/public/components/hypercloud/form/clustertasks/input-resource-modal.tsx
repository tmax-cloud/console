import * as React from 'react';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { useTranslation } from 'react-i18next';

export const InputResourceModal: React.FC<InputResourceModalProps> = ({ methods, inputResource }) => {
  const { t } = useTranslation();
  const typeItems = React.useMemo(
    () => ({
      git: 'Git',
      image: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_33'),
    }),
    [],
  );
  let target = document.getElementById('input-resource-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  let template;
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = inputResource[idx];
      }
    });
  }
  const [option, setOption] = React.useState(template?.optional);

  console.log(inputResource);

  return (
    <>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_12')} id="inputresource_name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_13')} id="inputresource-type" isRequired={true}>
        <Dropdown
          name="type"
          className="btn-group"
          title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_54')} // 드롭다운 title 지정
          methods={methods}
          items={typeItems} // (필수)
          style={{ display: 'block' }}
          buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
          itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
          defaultValue={modalType === 'modify' ? template.type : ''}
        />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_14')} id="inputresource_path">
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
        {t('SINGLE:MSG_TASKS_CREATFORM_DIV2_15')}
      </label>
      <p>{t('SINGLE:MSG_TASKS_CREATFORM_DIV2_16')}</p>
    </>
  );
};

type InputResourceModalProps = {
  methods: any;
  inputResource: any;
};

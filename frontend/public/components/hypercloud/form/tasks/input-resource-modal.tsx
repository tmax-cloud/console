import * as React from 'react';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';

export const InputResourceModal: React.FC<InputResourceModalProps> = ({ methods }) => {
  const typeItems = ['Git', 'Image'];

  return (
    <>
      <Section label="Name" id="inputresource-name">
        <TextInput id="inputresource-name" methods={methods} />
      </Section>
      <Section label="Type" id="inputresource-type">
        <Dropdown
          name="inputresource-type"
          className="btn-group"
          methods={methods}
          items={typeItems} // (필수)
          required={true}
          buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
          itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
        />
      </Section>
      <Section label="Resource Path" id="inputresource-path">
        <TextInput id="inputresource-path" methods={methods} />
      </Section>
    </>
  );
};

type InputResourceModalProps = {
  methods: any;
};

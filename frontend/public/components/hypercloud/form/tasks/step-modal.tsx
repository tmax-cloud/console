import * as React from 'react';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';

export const StepModal: React.FC<StepModalProps> = ({ methods }) => {
  const typeItems = {
    Git: 'Git',
    Image: 'Image',
  };

  return (
    <>
      <Section label="Name" id="step-name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} />
      </Section>
      <Section label="Type" id="step-type" isRequired={true}>
        <Dropdown
          name="type"
          className="btn-group"
          title="타입 선택" // 드롭다운 title 지정
          methods={methods}
          items={typeItems} // (필수)
          style={{ display: 'block' }}
          buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
          itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
        />
      </Section>
    </>
  );
};

type StepModalProps = {
  methods: any;
};

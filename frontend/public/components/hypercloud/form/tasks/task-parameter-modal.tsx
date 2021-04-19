import * as React from 'react';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { ListView } from '../../utils/list-view';
import { useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';

export const TaskParameterModal: React.FC<TaskParameterModalProps> = ({ methods, taskParameter }) => {
  const typeItems = {
    String: 'String',
    Array: 'Array',
  };
  let target = document.getElementById('task-parameter-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  let template;
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = taskParameter[idx];
      }
    });
  }

  const defaultListItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field">
        <TextInput id={`${name}[${index}].value`} inputClassName="col-md-12" methods={methods} defaultValue={item.value} placeholder={'-c'} />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Button
          type="button"
          data-test-id="pairs-list__delete-btn"
          className="pairs-list__span-btns"
          onClick={() => {
            ListActions.remove(index);
          }}
          variant="plain"
        >
          {ListDefaultIcons.deleteIcon}
        </Button>
      </div>
    </div>
  );

  const type = useWatch({
    control: methods.control,
    name: 'type',
    defaultValue: template ? template.type : '',
  });

  return (
    <>
      <Section label="Name" id="taskparameter_name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label="Description" id="taskparameter_desc">
        <TextInput id="description" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.description : ''} />
      </Section>
      <Section label="Type" id="taskparameter-type" isRequired={true}>
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
      {type === 'String' && (
        <Section label="기본 값" id="taskparameter_default" description="태스크 런 또는 파이프라인 생성 시 파라미터를 입력하지 않을 경우 기본 값으로 설정됩니다.">
          <TextInput id="default" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.default : ''} />
        </Section>
      )}
      {type === 'Array' && (
        <Section label="기본 값" id="taskparameter_default" description="태스크 런 또는 파이프라인 생성 시 파라미터를 입력하지 않을 경우 기본 값으로 설정됩니다.">
          <ListView name="default" methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={defaultListItemRenderer} defaultItem={{ value: '' }} defaultValues={modalType === 'modify' ? template.default : []} />
        </Section>
      )}
    </>
  );
};

type TaskParameterModalProps = {
  methods: any;
  taskParameter: any;
};

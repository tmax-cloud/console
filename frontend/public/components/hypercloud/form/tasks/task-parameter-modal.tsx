import * as React from 'react';
import * as _ from 'lodash-es';
import { Section } from '../../utils/section';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { ListView } from '../../utils/list-view';
import { useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export const TaskParameterModal: React.FC<TaskParameterModalProps> = ({ methods, taskParameter }) => {
  const { t } = useTranslation();
  const typeItems = React.useMemo(
    () => ({
      string: 'String',
      array: 'Array',
    }),
    [],
  );
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

  const defaultListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
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
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_19')} id="taskparameter_name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_20')} id="taskparameter_desc">
        <TextInput id="description" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.description : ''} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_21')} id="taskparameter-type" isRequired={true}>
        <Dropdown
          name="type"
          className="btn-group"
          title={t('SINGLE:MSG_PODSECURITYPOLICIES_CREATEFORM_DIV2_21')} // 드롭다운 title 지정
          methods={methods}
          items={typeItems} // (필수)
          style={{ display: 'block' }}
          buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
          itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
          defaultValue={modalType === 'modify' ? template.type : ''}
        />
      </Section>
      {type === 'string' && (
        <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_24')} id="taskparameter_default" description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_25')}>
          <TextInput id="defaultStr" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.defaultStr : ''} />
        </Section>
      )}
      {type === 'array' && (
        <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_24')} id="taskparameter_default" description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_25')}>
          <ListView name="defaultArr" methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={defaultListItemRenderer} defaultItem={{ value: '' }} defaultValues={modalType === 'modify' ? _.cloneDeep(template.defaultArr) : []} />
        </Section>
      )}
    </>
  );
};

type TaskParameterModalProps = {
  methods: any;
  taskParameter: any;
};

import * as React from 'react';
import * as _ from 'lodash';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
import { Controller } from 'react-hook-form';
import { DropdownWithRef } from '../../utils/dropdown-new';
import { TextInput } from '../../utils/text-input';
import { TextArea } from '../../utils/text-area';
import { Dropdown } from '../../utils/dropdown';
import { ListView } from '../../utils/list-view';
import { useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export const StepModal: React.FC<StepModalProps> = ({ methods, step }) => {
  const { t } = useTranslation();

  const commandTypeItems = [
    {
      title: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_96'),
      value: 'command',
    },
    {
      title: t('SINGLE:MSG_TASKS_CREATFORM_DIV2_97'),
      value: 'script',
    },
  ];

  let volumeItems = {};
  // volume 있는지 여부
  let isVolumeExist = () => {
    let volumeList = methods.getValues('spec.volumes');
    if (volumeList?.length > 0) {
      volumeList.forEach(cur => {
        volumeItems[cur.name] = cur.name;
      });
      return true;
    }
    return false;
  };

  let template;

  // modify 기능 용
  let target = document.getElementById('step-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = step[idx];
      }
    });
  }
  const envDefaultForm = { envKey: '', envValue: '', resourceKey: '', envType: 'normal' };

  const [env, setEnv] = React.useState(modalType === 'modify' ? (template.env ? [...template.env] : [envDefaultForm]) : [{ envKey: '', envValue: '', resourceKey: '', envType: 'normal' }]);

  const commandListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field">
        <TextInput id={`${name}[${index}].value`} inputClassName="col-md-12" methods={methods} defaultValue={item.value} placeholder={'/bin/sh'} />
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
  const parameterListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
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
  const envListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => {
    if (!env[index]) {
      setEnv(env => [...env, { envKey: '', envValue: '', envType: 'normal', resourceKey: '' }]);
      return;
    }
    const isKeyValueType = env[index].envType !== 'secret' && env[index].envType !== 'configMap';
    return (
      <div className="row" key={item.id}>
        <div className="col-xs-11 pairs-list__value-field" style={{ display: 'flex', position: 'relative' }}>
          <TextInput id={`${name}[${index}].envKey`} style={{ width: '110px' }} methods={methods} defaultValue={item.envKey} placeholder={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_43')} />
          <span style={{ margin: '0 5px' }}>=</span>
          <TextInput id={`${name}[${index}].envValue`} style={{ width: '110px' }} methods={methods} defaultValue={item.envValue} placeholder={isKeyValueType ? t('SINGLE:MSG_TASKS_CREATFORM_DIV2_44') : t('SINGLE:MSG_TASKS_CREATEFORM_DIV2_9')} />
          {isKeyValueType && (
            <>
              <span style={{ margin: '0 5px' }}>/</span>
              <TextInput id={`${name}[${index}].resourceKey`} style={{ width: '110px' }} methods={methods} defaultValue={item.resourceKey} placeholder={t('SINGLE:MSG_TASKS_CREATEFORM_DIV2_5')} />
            </>
          )}
          <Dropdown
            name={`${name}[${index}].envType`}
            className="btn-group"
            title={t('SINGLE:MSG_PODSECURITYPOLICIES_CREATEFORM_DIV2_21')} // 드롭다운 title 지정
            methods={methods}
            items={{ normal: t('SINGLE:MSG_TASKS_CREATEFORM_DIV2_4'), secret: t('SINGLE:MSG_TASKS_CREATEFORM_DIV2_2'), configMap: t('SINGLE:MSG_TASKS_CREATEFORM_DIV2_3') }} // (필수)
            style={{ display: 'block', marginLeft: '5px', right: 0, position: 'absolute' }}
            buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
            itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
            defaultValue={item.envType || ''}
            callback={selectItem => {
              const { envValue, envKey, resourceKey } = methods.getValues().env[index];
              setEnv(
                env.map((cur, cidx) => {
                  if (cidx === index) {
                    return { ...cur, envValue, envKey, resourceKey, envType: selectItem };
                  }
                  return { ...cur };
                }),
              );
            }}
          />
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
  };
  const mountListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons, deleteButtonText) => {
    return (
      <div key={item.id}>
        <div className="row co-dynamic-form__array-field-group-remove">
          <Button
            type="button"
            data-test-id="pairs-list__delete-btn"
            className="pairs-list__span-btns"
            onClick={() => {
              ListActions.remove(index);
            }}
            variant="plain"
          >
            {ListDefaultIcons.deleteIcon} {deleteButtonText}
          </Button>
        </div>
        <Section id="mountName">
          <Controller
            as={<DropdownWithRef name={`${name}[${index}].mountName`} defaultValue={item.mountName} methods={methods} useResourceItemsFormatter={false} items={volumeItems} placeholder={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_47')} />}
            control={methods.control}
            name={`${name}[${index}].mountName`}
            onChange={([selected]) => {
              return { value: selected };
            }}
            defaultValue={item.mountName}
          />
        </Section>
        <Section id="mountPath">
          <TextInput id={`${name}[${index}].mountPath`} inputClassName="col-md-12" methods={methods} defaultValue={item.mountPath} placeholder={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_48')} />
        </Section>
      </div>
    );
  };

  // command radio toggle 용
  const commandTypeToggle = useWatch({
    control: methods.control,
    name: 'commandTypeToggle',
    defaultValue: template ? template.commandTypeToggle : 'command',
  });
  return (
    <>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_108')} id="step-name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <div className="horizontal-line" />
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_33')} id="step-manual-image" isRequired={true}>
        <TextInput id="image" placeholder={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_104')} inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.image : ''} />
      </Section>
      <div className="horizontal-line" />
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_95')} id="command-type-toggle">
        <RadioGroup
          methods={methods}
          name="commandTypeToggle" // 서버에 보낼 데이터에서의 path (필수)
          items={commandTypeItems} // [{title: '', value: ''}] (필수)
          initValue={commandTypeToggle}
        />
      </Section>
      {commandTypeToggle === 'command' ? (
        <>
          <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_40')} id="step-command">
            <ListView name="command" methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={commandListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.command) : []} defaultItem={{ value: '' }} />
          </Section>
          <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_41')} id="step-parameter">
            <ListView name="args" methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={parameterListItemRenderer} defaultItem={{ value: '' }} defaultValues={modalType === 'modify' ? _.cloneDeep(template.args) : []} />
          </Section>
        </>
      ) : (
        <>
          <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_97')} id="step-script">
            <TextArea id="script" inputClassName="col-md-12 text-area" methods={methods} defaultValue={modalType === 'modify' ? template.script : ''} />
          </Section>
        </>
      )}
      <div className="horizontal-line" />
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_42')} id="step-env" help={true} helpTitle={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_42')} helpText={t('SINGLE:MSG_TASKS_CREATEFORM_DIV2_6')}>
        <ListView name="env" methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={envListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.env) : []} defaultItem={{ envKey: '', envValue: '' }} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_45')} id="step-mountPath">
        {!isVolumeExist() ? t('SINGLE:MSG_TASKS_CREATFORM_DIV2_46') : <ListView name="mountArr" methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} maxLength={_.size(volumeItems)} deleteButtonText={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_45')} headerFragment={<></>} itemRenderer={mountListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.mountArr) : []} defaultItem={{ name: '', mountPath: '' }} />}
      </Section>
    </>
  );
};

type StepModalProps = {
  methods: any;
  step: any;
};

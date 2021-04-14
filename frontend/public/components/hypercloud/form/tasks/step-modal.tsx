import * as React from 'react';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { ListView } from '../../utils/list-view';
import { useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';

export const StepModal: React.FC<StepModalProps> = ({ methods, step }) => {
  const ImageRadioList = [
    // RadioGroup 컴포넌트에 넣어줄 items
    {
      title: 'Image Registry',
      value: 'registry',
    },
    {
      title: '직접 입력',
      value: 'manual',
    },
  ];

  let volumeItems = {};
  // volume 있는지 여부
  let isVolumeExist = () => {
    let volumeList = methods.getValues('volume');
    if (volumeList?.length > 0) {
      volumeList.forEach(cur => {
        volumeItems[cur.name] = cur.name;
      });
      return true;
    }
    return false;
  };

  const parameterListHeaderFragment = <></>;
  const parameterListItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field">
        <TextInput id={`parameterList${index}.parameter`} inputClassName="col-md-12" methods={methods} placeholder={'-c'} />
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
  const envListHeaderFragment = <></>;
  const envListItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field" style={{ display: 'flex' }}>
        <TextInput id={`envList${index}.envKey`} inputClassName="col-md-6" methods={methods} placeholder={'키'} />
        <span style={{ margin: '0 5px' }}>=</span>
        <TextInput id={`envList${index}.envValue`} inputClassName="col-md-6" methods={methods} placeholder={'값'} />
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

  // radio toggle용
  const imageToggle = useWatch({
    control: methods.control,
    name: 'imageToggle',
    defaultValue: template ? template.imageToggle : 'registry',
  });

  return (
    <>
      <Section label="Name" id="step-name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <Section label="이미지" id="step-image-toggle">
        <RadioGroup
          methods={methods}
          name="imageToggle" // 서버에 보낼 데이터에서의 path (필수)
          items={ImageRadioList} // [{title: '', value: ''}] (필수)
          inline={true} // inline속성 먹일거면 true, 아니면 빼면 됨 (선택)
          initValue={imageToggle}
        />
      </Section>
      {imageToggle === 'registry' && (
        <>
          <Section id="resourcelistdropdown" label="이미지 레지스트리">
            <ResourceDropdown
              name="registryRegistry"
              placeholder="이미지 레지스트리 선택"
              methods={methods}
              defaultValue={modalType === 'modify' ? template.registryRegistry : ''}
              resources={[
                {
                  kind: 'Registry',
                  prop: 'deployment',
                },
              ]}
              type="single"
              useHookForm
            />
          </Section>
        </>
      )}
      {imageToggle === 'manual' && (
        <>
          <Section label="" id="step-manual-image">
            <TextInput id="manualImage" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.manualImage : ''} />
          </Section>
          <Section label="커맨드" id="step-manual-command">
            <TextInput id="manualCommand" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.manualCommand : ''} />
          </Section>
        </>
      )}
      <Section label="인수" id="step-parameter">
        <ListView name="parameterList" methods={methods} addButtonText="추가" headerFragment={parameterListHeaderFragment} itemRenderer={parameterListItemRenderer} defaultItem={{ parameter: '' }} />
      </Section>
      <Section label="환경 변수" id="step-parameter">
        <ListView name="envList" methods={methods} addButtonText="추가" headerFragment={envListHeaderFragment} itemRenderer={envListItemRenderer} defaultItem={{ envKey: '', envValue: '' }} />
      </Section>
      <Section label="마운트 경로" id="step-mountPath">
        {!isVolumeExist() ? (
          '마운트할 볼륨을 먼저 추가해 주세요.'
        ) : (
          <>
            <Dropdown
              name="selectedVolume"
              className="btn-group"
              title="볼륨 선택" // 드롭다운 title 지정
              methods={methods}
              items={volumeItems} // (필수)
              style={{ display: 'block' }}
              buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
              itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
            />
            <TextInput id="mountPath" inputClassName="col-md-12" methods={methods} placeholder="마운트 경로를 입력해 주세요." defaultValue={modalType === 'modify' ? template.mountPath : ''} />
          </>
        )}
      </Section>
      {/* <Section label="Type" id="step-type" isRequired={true}>
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
      </Section> */}
    </>
  );
};

type StepModalProps = {
  methods: any;
  step: any;
};

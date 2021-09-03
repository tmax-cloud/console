import * as React from 'react';
import * as _ from 'lodash-es';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
// import { ResourceDropdown } from '../../utils/resource-dropdown';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { TextArea } from '../../utils/text-area';
import { ListView } from '../../utils/list-view';
import { useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
// import { modelFor, k8sList } from '@console/internal/module/k8s';
// import { makeQuery } from '../../../utils/k8s-watcher';

export const StepModal: React.FC<StepModalProps> = ({ methods, step }) => {
  const { t } = useTranslation();
  // const ImageRadioList = [
  //   // RadioGroup 컴포넌트에 넣어줄 items
  //   {
  //     title: 'Image Registry',
  //     value: 'registry',
  //   },
  //   {
  //     title: '직접 입력',
  //     value: 'manual',
  //   },
  // ];

  // const [isOpen, setIsOpen] = React.useState(false);
  // const [imageList, setImageList] = React.useState({});
  // const [imageTagList, setImageTagList] = React.useState({});

  // const registryTypeItems = [
  //   {
  //     title: '내부 레지스트리',
  //     value: 'internal',
  //   },
  //   {
  //     title: '외부 레지스트리',
  //     value: 'external',
  //   },
  // ];
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
  const envListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field" style={{ display: 'flex' }}>
        <TextInput id={`${name}[${index}].envKey`} inputClassName="col-md-6" methods={methods} defaultValue={item.envKey} placeholder={'키'} />
        <span style={{ margin: '0 5px' }}>=</span>
        <TextInput id={`${name}[${index}].envValue`} inputClassName="col-md-6" methods={methods} defaultValue={item.envValue} placeholder={'값'} />
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
          <Dropdown
            name={`${name}[${index}].mountName`}
            className="btn-group"
            defaultValue={item.mountName}
            title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_47')} // 드롭다운 title 지정
            methods={methods}
            items={volumeItems} // (필수)
            style={{ display: 'block' }}
            buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
            itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
            {...ListActions.registerWithInitValue(`${name}[${index}].mountName`, item.mountName)}
          />
        </Section>
        <Section id="mountPath">
          <TextInput id={`${name}[${index}].mountPath`} inputClassName="col-md-12" methods={methods} defaultValue={item.mountPath} placeholder={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_48')} />
        </Section>
      </div>
    );
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
  // const [isFirstTimeEdit, setIsFirstTimeEdit] = React.useState(template?.isFirstTimeEdit);

  // const registryTypeToggle = useWatch({
  //   control: methods.control,
  //   name: 'registryTypeToggle',
  //   defaultValue: template ? template.registryTypeToggle : 'internal',
  // });

  // command radio toggle 용
  const commandTypeToggle = useWatch({
    control: methods.control,
    name: 'commandTypeToggle',
    defaultValue: template ? template.commandTypeToggle : 'command',
  });

  // const imageRegistry = useWatch({
  //   control: methods.control,
  //   name: 'registryRegistry',
  //   defaultValue: template ? template.registryRegistry : null,
  // });
  // const image = useWatch({
  //   control: methods.control,
  //   name: 'registryImage',
  //   defaultValue: template ? template.registryImage : null,
  // });
  // // Image Registry 선택되면 Image Dropdown 메뉴 채워주기
  // React.useEffect(() => {
  //   if (!isFirstTimeEdit && imageRegistry) {
  //     const ko = modelFor('Repository');
  //     let query = makeQuery('', { matchLabels: { registry: imageRegistry } });
  //     k8sList(ko, query)
  //       .then(reponse => reponse)
  //       .then(data => {
  //         let imageItems = {};
  //         data.forEach(cur => {
  //           imageItems[cur.spec.name] = cur.spec.name;
  //         });
  //         setImageList(() => imageItems);
  //       });
  //   }
  // }, [imageRegistry, isFirstTimeEdit]);

  // // Image 선택되면 ImageTag Dropdown 메뉴 채워주기
  // React.useEffect(() => {
  //   if (!isFirstTimeEdit && image) {
  //     const ko = modelFor('Repository');
  //     let query = makeQuery('', { matchLabels: { registry: imageRegistry } });
  //     k8sList(ko, query)
  //       .then(reponse => reponse)
  //       .then(data => {
  //         let imageTagItems = {};
  //         let curImage = data.filter(cur => image === cur.spec.name)[0];
  //         curImage.spec.versions.forEach(cur => {
  //           imageTagItems[cur.version] = cur.version;
  //         });
  //         setImageTagList(() => imageTagItems);
  //       });
  //   }
  // }, [image]);

  return (
    <>
      <Section label="스텝 이름" id="step-name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <div className="horizontal-line" />
      {/* {isFirstTimeEdit ? (
        <>
          <Section label="이미지" id="step-name" isRequired={true}>
            <TextInput id="image" inputClassName="col-md-12" methods={methods} isDisabled={true} defaultValue={modalType === 'modify' ? template.image : ''} />
          </Section>
          <span className="open-modal_text" onClick={() => setIsFirstTimeEdit(false)}>
            {`+ 제거하고 다시 선택`}
          </span>
        </>
      ) : (
        <>
          <Section label="이미지" id="registry-type-toggle" isRequired={true}>
            <RadioGroup
              methods={methods}
              name="registryTypeToggle" // 서버에 보낼 데이터에서의 path (필수)
              items={registryTypeItems} // [{title: '', value: ''}] (필수)
              initValue={registryTypeToggle}
            />
          </Section>
          {registryTypeToggle === 'internal' ? (
            <>
              <Section id="registrydropdown" label="컨테이너 레지스트리">
                <ResourceDropdown
                  name="registryRegistry"
                  placeholder="컨테이너 레지스트리 선택"
                  methods={methods}
                  defaultValue={modalType === 'modify' ? imageRegistry : ''}
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
              {imageRegistry && (
                <Section id="imagedropdown" label="이미지">
                  <Dropdown
                    name="registryImage"
                    className="btn-group"
                    title="이미지 선택" // 드롭다운 title 지정
                    methods={methods}
                    defaultValue={modalType === 'modify' ? image : ''}
                    items={_.cloneDeep(imageList)} // (필수)
                    style={{ display: 'block' }}
                    buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
                    itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
                  />
                </Section>
              )}
              {image && (
                <Section id="imagetagdropdown" label="이미지 태그">
                  <Dropdown
                    name="registryTag"
                    className="btn-group"
                    title="이미지 선택" // 드롭다운 title 지정
                    methods={methods}
                    defaultValue={modalType === 'modify' ? template.registryTag : ''}
                    items={_.cloneDeep(imageTagList)} // (필수)
                    style={{ display: 'block' }}
                    buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
                    itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
                  />
                </Section>
              )}
            </>
          ) : (
            <Section label="이미지" id="step-manual-image" isRequired={true}>
              <TextInput id="image" placeholder="이미지 경로를 입력해 주세요." inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.image : ''} />
            </Section>
          )}
        </>
      )} */}
      <Section label="이미지" id="step-manual-image" isRequired={true}>
        <TextInput id="image" placeholder="이미지 경로를 입력해 주세요." inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.image : ''} />
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
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_42')} id="step-env">
        <ListView name="env" methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={envListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.env) : []} defaultItem={{ envKey: '', envValue: '' }} />
      </Section>
      <Section label={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_45')} id="step-mountPath">
        {!isVolumeExist() ? (
          t('SINGLE:MSG_TASKS_CREATFORM_DIV2_46')
        ) : (
          <>
            <ListView name="mountArr" methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} maxLength={_.size(volumeItems)} deleteButtonText={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_45')} headerFragment={<></>} itemRenderer={mountListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.mountArr) : []} defaultItem={{ name: '', mountPath: '' }} />
            {/* <Section id="selectedVolume">
              <Dropdown
                name="selectedVolume"
                className="btn-group"
                defaultValue={template ? template.selectedVolume : ''}
                title={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_47')} // 드롭다운 title 지정
                methods={methods}
                items={volumeItems} // (필수)
                style={{ display: 'block' }}
                buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
                itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
              />
            </Section>
            <Section id="mountPath">
              <TextInput id="mountPath" inputClassName="col-md-12" methods={methods} placeholder={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_48')} defaultValue={modalType === 'modify' ? template.mountPath : ''} />
            </Section> */}
          </>
        )}
      </Section>
    </>
  );
};

type StepModalProps = {
  methods: any;
  step: any;
};

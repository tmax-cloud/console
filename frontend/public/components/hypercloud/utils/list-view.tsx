import { useFormContext, useFieldArray } from 'react-hook-form';
import * as React from 'react';
import * as _ from 'lodash-es';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

/**
 * hook-form으로 데이터를 관리하면서 Item을 추가/제거 할 수 있는 리스트뷰 컴포넌트이다.
 * @prop {string} name - hook form에 등록할 리스트뷰의 name.
 * @prop {object[]} defaultValues - 리스트뷰에 기본으로 들어갈 값을 설정해주는 속성이다. key/value로 이루어진 리스트뷰에 기본으로 두 개의 row item이 추가된 상태로 설정해주고 싶다면, [{key: 'AAA', value: 'aaa'}, {key: 'BBB', value: 'bbb'}] 로 설정해주면 된다.
 * @prop {object} defaultItem - 새로운 item 추가 시 해당 item에 넣어줄 기본값들에 대한 설정을 해주는 속성이다. (예: {key: 'defaultKey', value:'defaultValue'})
 * @prop {Function} itemRenderer - 리스트뷰 하나의 row item을 커스터마이징 할 수 있는 함수. 속성을 설정하지 않으면 기본으로 key/value로 이루어진 itemRenderer가 들어간다.
 * @prop {JSX.Element} headerFragment - 리스트뷰의 header부분을 커스터마이징 할 수 있는 속성. 속성을 설정하지 않으면 기본으로 KEY, VALUE로 구성된 헤더컴포넌트가 들어간다.
 * @prop {string} addButtonText - item 추가버튼의 텍스트. 기본값은 'Add'이다.
 */
export const ListView: React.FC<ListViewProps> = ({ name, methods, defaultItem = { key: '', value: '' }, itemRenderer, headerFragment, addButtonText, defaultValues }) => {
  const methods_ = methods || useFormContext();
  const { control, register, getValues, setValue } = methods_;
  const { fields, append, remove } = useFieldArray({ control, name: name });

  const DefaultListHeaderFragment = (
    <div className="row pairs-list__heading">
      <div className="col-xs-4 text-secondary text-uppercase">KEY</div>
      <div className="col-xs-4 text-secondary text-uppercase">VALUE</div>
      <div className="col-xs-1 co-empty__header" />
    </div>
  );

  React.useEffect(() => {
    if (!!defaultValues) {
      // MEMO : name에 []이 들어가있으면 setValue 에러남. test[0].values 대신 test.0.values 형식으로 들어가있어야됨
      setValue(name, defaultValues);
    }
  }, [name]);

  const DefaultListItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => {
    return (
      <div className="row" key={item.id} data-testid="row">
        <div className="col-xs-4 pairs-list__name-field">
          <input ref={register()} className="pf-c-form-control" name={`${name}[${index}].key`} data-testid={`${name}[${index}].key`} defaultValue={item.key}></input>
        </div>
        <div className="col-xs-4 pairs-list__value-field">
          <input ref={register()} className="pf-c-form-control" name={`${name}[${index}].value`} data-testid={`${name}[${index}].value`} defaultValue={item.value}></input>
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

  const deleteIcon = (
    <>
      <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon" />
      <span className="sr-only">Delete</span>
    </>
  );

  // MEMO : ListView컴포넌트 안에서 ref가 없는 다른 공통컴포넌트를 사용해 itemRenderer를 구성할 때, item remove할 때 그 안에 값들의 싱크가 맞지 않는 경우가 있어서,
  // 다시 원래 값으로 세팅해주는 함수. (임시 방안) 사용예시는 create-role.tsx 참고.
  const registerWithInitValue = (name, defaultValue) => {
    const isRegistered = _.get(getValues(), name);

    if (!isRegistered) {
      register(name);
      setValue(name, defaultValue);
    }
  };

  const ListActions = {
    append: append,
    remove: remove,
    getValues: getValues,
    registerWithInitValue: registerWithInitValue,
  };

  const ListDefaultIcons = {
    deleteIcon: deleteIcon,
  };

  const itemList = itemRenderer ? fields.map((item, index) => itemRenderer(methods_, name, item, index, ListActions, ListDefaultIcons)) : fields.map((item, index) => DefaultListItemRenderer(register, name, item, index, ListActions, ListDefaultIcons));

  return (
    <div>
      {headerFragment ? headerFragment : DefaultListHeaderFragment}
      {itemList}
      <div className="row col-xs-12">
        <Button
          className="pf-m-link--align-left"
          data-test-id="pairs-list__add-btn"
          onClick={() => {
            append(defaultItem);
          }}
          type="button"
          variant="link"
        >
          <PlusCircleIcon data-test-id="pairs-list__add-icon" className="co-icon-space-r" />
          {!!addButtonText ? addButtonText : 'Add'}
        </Button>
      </div>
    </div>
  );
};

type ListViewProps = {
  name: string;
  defaultItem?: object;
  itemRenderer?: Function;
  headerFragment?: JSX.Element;
  addButtonText?: string;
  methods?: any;
  defaultValues?: object[];
};

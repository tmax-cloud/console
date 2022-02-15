import * as React from 'react';
import * as _ from 'lodash-es';
import { useFormContext } from 'react-hook-form';
//import Select, { components } from 'react-select';
import Select from 'react-select';
import { CaretDownIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { DataToolbar, DataToolbarContent, DataToolbarFilter, DataToolbarItem } from '@patternfly/react-core';
import { ResourceIcon } from '../../utils';

const DROPDOWN_SECTION_ID = 'hc-multidropdown-item';
const SELECT_ALL_VALUE = '<SELECT_ALL>';

/* 드롭다운 부위별 styling을 위해 만든 컴포넌트들 */
//const { Option } = components;

const MenuContainer = props => {
  const shadow = 'hsla(218, 50%, 10%, 0.1)';
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 4,
        boxShadow: `0 0 0 1px ${shadow}, 0 4px 11px ${shadow}`,
        marginTop: 2,
        position: 'absolute',
        zIndex: 2,
        overflowY: 'auto',
      }}
      {...props}
    />
  );
};

const Dropdown = React.forwardRef<HTMLDivElement, any>(({ children, isOpen, target, onClose }, ref) => (
  <div style={{ position: 'relative' }} ref={ref}>
    {target}
    {isOpen ? <MenuContainer>{children}</MenuContainer> : null}
  </div>
));

const DropdownMainButton = ({ label, toggleOpen, count = 0, buttonWidth }) => {
  return (
    <div className="hc-dropdown-main-button" style={{ width: buttonWidth }} onClick={toggleOpen}>
      <span style={{ margin: '0 3px', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', overflowX: 'hidden', width: 'calc(100% - 60px)' }}>{label}</span>
      <span className="pf-c-badge pf-m-read">{count}</span>
      <CaretDownIcon className="hc-dropdown-select_toggle-icon" style={{ marginLeft: '10px', position: 'absolute', right: '0px' }} />
    </div>
  );
};

const ResourceItem = (isResourceItem, shrinkOnSelectAll, selectAllChipObj, showSelectAllOnEmpty, selectAllChecked, setSelectAllChecked, props) => {
  //const { data, options: allOptions, getValue, isSelected, setValue } = props;
  const { data, getValue, setValue } = props;
  //const justSelectAllOption = allOptions.length === 1 && allOptions[0].value === SELECT_ALL_VALUE;
  //const isSelectAllCheckbox = data.value === SELECT_ALL_VALUE;
  //let allSelected = false;
  const currentValue = getValue();

  const itemList = currentValue.filter(e => {
    if (data.label === e.label) return true;
  });
  const wihtoutItem = currentValue.filter(e => {
    if (data.label !== e.label) return true;
  });
  const isExist = !(itemList.length === 0);
  const isAdded = itemList[0]?.added;
  const isChecked = itemList[0]?.checked;

  return (
    <>
      <div>
        <span className={'co-resource-item'} id={DROPDOWN_SECTION_ID} style={{ display: 'block' }}>
          <input
            id={DROPDOWN_SECTION_ID}
            style={{ marginLeft: '10px', marginRight: '10px' }}
            type="checkbox"
            checked={isChecked}
            onClick={() => {
              if (isExist !== true) {
                data.checked = true;
                currentValue.push(data);
                setValue(currentValue);
              } else {
                if (isChecked !== true) {
                  data.checked = true;
                  data.added = true;
                  //update checked = ture;
                  wihtoutItem.push(data);
                  setValue(wihtoutItem);
                  if (data.label === 'All' && data.value === '*') {
                    setSelectAllChecked(true);
                  }
                } else {
                  if (isAdded !== true) {
                    //delete
                    setValue(wihtoutItem);
                  } else {
                    data.added = true;
                    //update checked = false;
                    wihtoutItem.push(data);
                    setValue(wihtoutItem);
                    if (data.label === 'All' && data.value === '*') {
                      setSelectAllChecked(true);
                    }
                  }
                }
              }
            }}
            onChange={() => null}
            data-test-id="checkbox"
          />

          <span
            className="co-resource-item__resource-name"
            id={DROPDOWN_SECTION_ID}
            onClick={() => {
              if (data.label === 'All' && data.value === '*') {
                setValue([
                  {
                    label: 'All',
                    value: '*',
                    checked: false,
                    added: true,
                  },
                ]);
                setSelectAllChecked(true);
              } else {
                if (isExist !== true) {
                  data.added = true;
                  currentValue.push(data);
                  //remove All
                  let wihtoutAll = currentValue.filter(e => {
                    if (e.label !== 'All') return true;
                  });
                  setValue(wihtoutAll);
                } else {
                  if (isChecked !== true) {
                    data.added = true;
                    //update currentValue
                    wihtoutItem.push(data);
                    //remove All
                    let wihtoutAll = wihtoutItem.filter(e => {
                      if (e.label !== 'All') return true;
                    });
                    setValue(wihtoutAll);
                  } else {
                    data.checked = true;
                    data.added = true;
                    //update currentValue
                    wihtoutItem.push(data);
                    let wihtoutAll = wihtoutItem.filter(e => {
                      if (e.label !== 'All') return true;
                    });
                    setValue(wihtoutAll);
                  }
                }
              }
            }}
          >
            <span id={DROPDOWN_SECTION_ID}>{data.label}</span>
            <PlusCircleIcon data-test-id="pairs-list__add-icon" className="co-icon-space-l" style={{ marginRight: '10px', float: 'right' }} />
          </span>
        </span>
      </div>
      {data.label === 'All' && <hr></hr>}
    </>
  );
};

/* 드롭다운 item click 이벤트가 일어날 때 상황에 대한 type들 */
const CaseType = {
  UNCHECK_SET_EMPTY: 'UNCHECK_SET_EMPTY', // selectAll=unchecked, value와 chip 모두 비워야 하는 상황
  CHECK_SET_ONE_ALL: 'CHECK_SET_ONE_ALL', // selectAll=checked, value와 chip엔 하나의 all표시 object(예: {label:'All', value: '*'})만 세팅해야 하는 상황
  CHECK_SET_ALL_OPTIONS: 'CHECK_SET_ALL_OPTIONS', // selectAll=checked, value와 chip엔 모든 options 추가해야 하는 상황
  UNCHECK_SET_FILTERED_VALUES: 'UNCHECK_SET_FILTERED_VALUES', // shrinkOnSelectAll이 true이고 value, chip에 {label: 'All', value: '*'} 만 있는 상황에서 하나의 option을 uncheck하면 all이 풀리면서 나머지 checked 상태인 options들이 value와 chip에 추가돼야 된다.
  CHECK_SET_VALUES: 'CHECK_SET_VALUES', // shrinkOnSelectAll이 false일 때, options 중 마지막 option까지 다 체크하는 순간엔 selectAll도 checked 돼야 한다.
  UNCHECK_SET_VALUES: 'UNCHECK_SET_VALUES', // shrinkOnSelectAll이 false일 때, 모든 options이 체크돼있는 상황에서 하나를 uncheck하면 selectAll도 uncheck 시켜줘야 한다.
};

/**
 * 다중선택이 가능하고 checked 와 added 로 나누어 선택 가능한 드롭다운 컴포넌트이다. item 선택 시 드롭다운 하위에 chip의 형태로 선택된 항목이 나타난다.
 * @prop {string} name - hook form에 등록할 드롭다운의 name. Controller로 감싸서 사용할 때 Controller에 지정한 name과 같은 값이어야 한다.
 * @prop {string} placeholder - 드롭다운에 표시되는 placeholder.
 * @prop {string} buttonWidth - 드롭다운 버튼자체의 width 값.
 * @prop {string} menuWidth - 드롭다운 클릭 시 펼쳐지는 menu의 width 값.
 * @prop {string} chipsGroupTitle - chips 컨테이너의 title.
 * @prop {any[]} defaultValues - 드롭다운의 기본 선택값을 지정해주는 속성. [{lable: 'AAA', value: 'aaa', checked: true, added: true }, {label: 'BBB', value: 'bbb', checked: true, added: true }] 형태로 설정해주고, 해당 item은 items props에 존재하는 item이어야 한다. (Controller로 감싸서 ListView컴포넌트 안에 사용 시 Controller의 defaultValue속성에도 같은 값을 지정해줘야 한다)
 * @prop {any | any[]} items - 옛버전의 dropdown에서 object로 사용해서 object도 받을 수 있게 처리해놓았으나, object[] 형태의 사용을 권장함. (예: [{lable: 'AAA', value: 'aaa', checked: true, added: true }, {label: 'BBB', value: 'bbb', checked: true, added: true }])
 * @prop {boolean} shrinkOnSelectAll - 모든 아이템을 선택했을 때 하나의 All아이템으로 줄어들게할 지 여부를 설정하는 속성.
 * @prop {boolean} showSelectAllOnEmpty - 드롭다운 아이템이 없을 때 SelectAll 버튼만 보여줄 지 여부를 설정하는 속성.
 * @prop {{ label: string; value: string; }} selectAllChipObj - shrinkOnSelectAll=true일 때 모든 아이템 선택시 표시해줄 chip object에 대한 설정. 기본값은 {label: 'All', value: '*'} 이다. defaultValue로 selectAllChipObj와 동일한 형태의 값이 들어왔을 때에도 모든 아이템이 선택된 것으로 처리 된다. 이와 같이 동작하게 하려면 shrinkOnSelectAll=true로 설정해줘야 한다.
 * @prop {string} clearAllText - Clear all 버튼에 표시되는  text
 */
export const DropdownCheckAddComponent = React.forwardRef<HTMLInputElement, DropdownCheckAddComponentProps>((props, ref) => {
  const { name, defaultValues = [], methods, items, useResourceItemsFormatter, shrinkOnSelectAll = true, showSelectAllOnEmpty = true, selectAllChipObj = { label: 'All', value: '*', checked: true, added: true }, kind, menuWidth = '200px', placeholder = 'Select Resources', chipsGroupTitle = 'Resources', buttonWidth = '200px', clearAllText = 'Clear all' } = props;
  const { setValue, watch } = methods ? methods : useFormContext();
  const [inputValue, setInputValue] = React.useState('');
  const [chips, setChips] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectAllChecked, setSelectAllChecked] = React.useState(false);
  const dropdownElement = React.useRef<HTMLDivElement>();
  const selectAllOption = {
    label: 'All',
    value: '*',
    //value: SELECT_ALL_VALUE,
  };

  const defaultValuesWithKey = defaultValues?.map(item => {
    return {
      label: item.label,
      value: item.value,
      checked: item.checked,
      added: item.added,
    };
  });

  const selectedValues = watch(name, defaultValuesWithKey);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      width: '90%',
      margin: '8px auto',
      borderRadius: '5px',
      cursor: 'pointer',
      boxShadow: 'none',
      minHeight: '33px',
    }),
    menu: () => ({}),
    container: (provided, state) => {
      return { ...provided, width: menuWidth };
    },
    option: (provided, { isSelected }) => ({
      ...provided,
      backgroundColor: 'white',
      color: 'black',
    }),
  };

  let formattedOptions = [];
  if (useResourceItemsFormatter) {
    // MEMO : Firehose로 들어온 resources값이 있으면 items속성보다 우선으로 받음.
    if (Array.isArray(items)) {
      formattedOptions = items?.map(item => {
        const kindValue = item.kind || kind || '';
        const label = item.spec?.externalName || item.metadata?.name || '';
        const value = item.metadata?.name || item.metadata?.uid || '';
        return {
          key: `${kindValue}_${value}`,
          apiVersion: item.apiVersion || '',
          kind: kindValue,
          label: label,
          value: value,
        };
      });
    }
  } else {
    // MEMO : 옛버전의 dropdown공통컴포넌트 사용 시 {[value1]: [label1], [value2]: [label2]} 형식으로 items값을 지정해주고있어서 예전 dropdown을 MultiSelectDropdownWithRef로 대체했을 때 동작하게하기 위해
    // 그렇게 들어왔을 때에도 object형태의 item으로 바꿔주기 위해 추가한 부분.
    // ***** 이후 MultiSelectDropdownWithRef컴포넌트를 새로 사용하는 상황이라면 items 형태는 object들로 이루어진 Array로 지정해주는 것을 권장함! *****
    if (!Array.isArray(items)) {
      for (const key in items) {
        formattedOptions.push({
          key: `${key}-${items[key]}`,
          value: key,
          label: items[key],
        });
      }
    } else {
      // MEMO : item마다 고유의 key값이 있어야 delete chip 가능해서 key값 넣어주는 부분.
      // MEMO : key값 규칙은 "[label]-[value]"로 지정해주고 있음. defaultValues로 들어오는 값에 대해서도 이와 같이 key값 만들어서 지정해줌.
      formattedOptions = items?.map(item => {
        return { key: item.key || `${item.label}-${item.value}`, label: item.label, value: item.value };
      });
    }
  }

  /* 초반 defaultValues를 받았을 때 드롭다운에 반영해주는 부분. */
  React.useEffect(() => {
    const selectAllChip = defaultValuesWithKey.filter(item => selectAllChipObj.label === item.label && selectAllChipObj.value === item.value);
    if (defaultValuesWithKey[0]?.label === 'All') {
      setSelectAllChecked(true);
      setChips([selectAllChipObj]);
    } else if (selectAllChip.length > 0) {
      // MEMO : defaultValues에 selectAll관련 chip이 있는 경우
      if (shrinkOnSelectAll) {
        setSelectAllChecked(true);
        setChips([selectAllChipObj]);
      } else {
        // EMPTY : defaultValue에 all관련 chip이 있는데 shrinkOnSelectAll은 false일 경우는 있으면 안된다. defaultValue로 all관련 chip이 들어올 경우엔 해당 드롭다운의 shrinkOnSelectAll=true로 설정해줘야 한다.
      }
    } else if (formattedOptions?.length > 0 && defaultValuesWithKey.length > 0 && formattedOptions.length === defaultValuesWithKey.length) {
      // MEMO : defaultValues의 길이와 items의 길이가 같은 경우 모든 요소들이 선택된걸로 간주
      setSelectAllChecked(true);
      setChips(defaultValuesWithKey);
    } else {
      setSelectAllChecked(false);
      setChips(defaultValuesWithKey);
    }
  }, []);

  const setDropdownSettings = (isSelectAll, formValues, chips) => {
    setSelectAllChecked(isSelectAll);
    setValue(name, formValues);
    setChips(chips);
  };

  const getCaseType = (clickSelectAll, selectAllChecked, shrinkOnSelectAll, isValuesAndOptionsLengthEqual) => {
    if (clickSelectAll) {
      if (selectAllChecked) {
        return CaseType.UNCHECK_SET_EMPTY;
      } else {
        if (showSelectAllOnEmpty && formattedOptions.length === 0) {
          return CaseType.CHECK_SET_ONE_ALL;
        }
        if (shrinkOnSelectAll) {
          return CaseType.CHECK_SET_ONE_ALL;
        } else {
          return CaseType.CHECK_SET_ALL_OPTIONS;
        }
      }
    } else {
      if (shrinkOnSelectAll) {
        if (selectAllChecked) {
          return CaseType.UNCHECK_SET_FILTERED_VALUES;
        } else {
          return isValuesAndOptionsLengthEqual ? CaseType.CHECK_SET_ONE_ALL : CaseType.UNCHECK_SET_VALUES;
        }
      } else {
        return isValuesAndOptionsLengthEqual ? CaseType.CHECK_SET_VALUES : CaseType.UNCHECK_SET_VALUES;
      }
    }
  };

  const handleChange = (value, actionMeta, allOptions = []) => {
    const { action, option } = actionMeta;

    /** react-select의 Select컴포넌트에선 action유형을 해당 값이 values로 등록돼있는지 아닌지로 구별하는듯하다.
     * selectAll아이템의 경우 클릭했을 때 values로 들어가진 않도록 해놓은 아이템이라 항상 values엔 없어서 클릭할 때마다 select-option으로 action이 들어온다.
     * values에 등록된 애들은 클릭 시 deselect-option으로 action유형이 들어온다. 이게 정상적인 경우.
     */
    // MEMO : selectAll의 현 체크여부는 위와 같은 이유로 판단 불가하기 때문에 selectAllChecked state로 관리하게 함.
    const clickSelectAll = action === 'select-option' && option.value === selectAllOption.value;
    const isEqual = value.length === allOptions.length;

    const addedValues = value.filter(e => {
      if (e.added === true) return true;
    });

    const caseType = getCaseType(clickSelectAll, selectAllChecked, shrinkOnSelectAll, isEqual);
    switch (caseType) {
      case CaseType.UNCHECK_SET_EMPTY: {
        setDropdownSettings(false, [], []);
        break;
      }
      case CaseType.CHECK_SET_ONE_ALL: {
        setDropdownSettings(true, [selectAllChipObj], [selectAllChipObj]);
        break;
      }
      case CaseType.CHECK_SET_ALL_OPTIONS: {
        setDropdownSettings(true, allOptions, allOptions);
        break;
      }
      //case CaseType.UNCHECK_SET_FILTERED_VALUES: {
      //    const newValues = allOptions.filter(item => !_.isEqual(option, item));
      //    const newAddedValues = newValues.filter(e => { if (e.added === true) return true; });
      //    setDropdownSettings(false, newValues, newAddedValues);
      //    break;
      //}
      case CaseType.CHECK_SET_VALUES: {
        setDropdownSettings(true, value, addedValues);
        break;
      }
      case CaseType.UNCHECK_SET_VALUES: {
        setDropdownSettings(false, value, addedValues);
        break;
      }
      default: {
      }
    }
  };
  const handelInputChange = (value, action) => {
    if (action.action === 'set-value' || action.action === 'input-blur' || action.action === 'menu-close') {
      return;
    }
    setInputValue(value);
  };
  const getChipsCount = ()=>{
    const isAllSelected = chips.filter(chip=> chip.label.includes('All')).length

    if(selectAllChecked ||isAllSelected){
      return formattedOptions.length
    }
    else{
      return chips.length
    }
  }
  const getOptions = options => [selectAllOption, ...options];

  const toggleOpen = () => {
    window.addEventListener('click', onWindowClick);
   
    setIsOpen(!isOpen);
  };

  const clearAll = () => {
    setDropdownSettings(false, [], []);
  };

  const onDeleteChip = (chipGroup, chip) => {
    if (chip.key === SELECT_ALL_VALUE) {
      setDropdownSettings(false, [], []);
    } else {
      const newValues = chips?.filter(item => chip.key !== item.label);
      setDropdownSettings(false, newValues, newValues);
    }
  };

  /* Mouse click 이벤트 핸들링 부분 */
  const onWindowClick = event => {
    const { current } = dropdownElement;
    if (!current) {
      return;
    }
    const target = event.target;
    if (target === current || (current && current.contains(target)) || target.id?.includes(DROPDOWN_SECTION_ID) || target.parentElement?.id.includes(DROPDOWN_SECTION_ID) || target.id?.indexOf('react-select') > -1) {
      return;
    }
    hide(event);
    setInputValue('')
  };

  const hide = e => {
    e && e.stopPropagation();
    window.removeEventListener('click', onWindowClick);
    
    setIsOpen(false);
  };

  React.useEffect(() => {
    window.addEventListener('click', onWindowClick);
    return () => {
      window.removeEventListener('click', onWindowClick);
    };
  }, []);

  return (
    <DataToolbar id="multidropdown-toolbar" clearAllFilters={clearAll} clearFiltersButtonText={clearAllText}>
      <DataToolbarContent>
        <DataToolbarItem>
          <DataToolbarFilter
            deleteChipGroup={clearAll}
            chips={chips?.map(item => {
              return {
                key: item.label || SELECT_ALL_VALUE,
                node: (
                  <>
                    <ResourceIcon kind={item.kind ?? ''} />
                    {item.label ?? ''}
                  </>
                ),
              };
            })}
            deleteChip={onDeleteChip}
            categoryName={chipsGroupTitle}
          >
            <Dropdown ref={dropdownElement} isOpen={isOpen} onClose={toggleOpen} target={<DropdownMainButton label={placeholder} toggleOpen={toggleOpen} count={ getChipsCount() } buttonWidth={buttonWidth} />}>
              <Select
                name={name}
                autoFocus
                styles={customStyles}
                value={selectedValues || []}
                options={getOptions(formattedOptions)}
                controlShouldRenderValue={false}
                isMulti
                components={{
                  Option: ResourceItem.bind(null, useResourceItemsFormatter, shrinkOnSelectAll, selectAllChipObj, showSelectAllOnEmpty, selectAllChecked, setSelectAllChecked),
                  IndicatorSeparator: null,
                  DropdownIndicator: null,
                }}
                ref={ref}
                onChange={(value, action) => {
                  handleChange(value, action, formattedOptions);
                }}
                inputValue={inputValue}
                onInputChange={(value, action) => handelInputChange(value, action)}
                blurInputOnSelect={false}
                menuIsOpen
                classNamePrefix="hc-select"
                isSearchable={true}
                tabSelectsValue={false}
                isClearable={false}
                backspaceRemovesValue={false}
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
              />
            </Dropdown>
          </DataToolbarFilter>
        </DataToolbarItem>
      </DataToolbarContent>
    </DataToolbar>
  );
});

export type DropdownCheckAddComponentProps = {
  id?: string;
  name: string;
  defaultValues?: any[];
  methods?: any;
  items?: any | any[];
  useResourceItemsFormatter?: boolean;
  kind?: string;
  menuWidth?: string;
  placeholder?: string;
  chipsGroupTitle?: string;
  buttonWidth?: string;
  shrinkOnSelectAll?: boolean;
  showSelectAllOnEmpty?: boolean;
  selectAllChipObj?: { label: string; value: string; [key: string]: string };
  clearAllText?: string;
};

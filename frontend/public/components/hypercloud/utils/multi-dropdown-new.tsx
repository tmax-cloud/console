import * as React from 'react';
import * as _ from 'lodash-es';
import { useFormContext } from 'react-hook-form';
import Select, { components } from 'react-select';
import { CaretDownIcon } from '@patternfly/react-icons';

import { DataToolbar, DataToolbarContent, DataToolbarFilter, DataToolbarItem } from '@patternfly/react-core';
import { ResourceIcon } from '../../utils';

const { Option } = components;

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
        maxHeight: '40vh',
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
      <span style={{ margin: '0 3px', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', overflowX: 'hidden' }}>{label}</span>
      <span className="pf-c-badge pf-m-read">{count}</span>
      <CaretDownIcon className="hc-dropdown-select_toggle-icon" style={{ marginLeft: '10px' }} />
    </div>
  );
};

const ResourceItem = props => {
  return (
    <Option {...props}>
      <span className={'co-resource-item'}>
        <input type="checkbox" style={{ marginRight: '3px' }} checked={props.isSelected} onChange={() => null} />
        <span className="co-resource-icon--fixed-width">
          <ResourceIcon kind={props.data.kind} />
        </span>
        <span className="co-resource-item__resource-name" style={{ margin: '0 3px', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', overflowX: 'hidden' }}>
          <span>{props.data.label}</span>
        </span>
      </span>
    </Option>
  );
};

const TextItem = props => {
  return (
    <Option {...props}>
      <span className={'co-resource-item'}>
        <input style={{ marginRight: '10px' }} type="checkbox" checked={props.isSelected} onChange={() => null} />
        <span className="co-resource-item__resource-name">
          <span>{props.data.label}</span>
        </span>
      </span>
    </Option>
  );
};

/**
 * 다중선택이 가능하고 검색기능이 있는 드롭다운 컴포넌트이다. item 선택 시 드롭다운 하위에 chip의 형태로 선택된 항목이 나타난다.
 * @prop {string} name - hook form에 등록할 드롭다운의 name. Controller로 감싸서 사용할 때 Controller에 지정한 name과 같은 값이어야 한다.
 * @prop {string} kind - useResourceItemsFormatter를 true로 지정할 경우 드롭다운 item에 리소스아이콘이 표시 되는데, k8s 리소스리스트에 kind정보가 없을 경우 아이콘이 표시되지 않는다. 이럴 때 대체로 넣어줄 kind 값.
 * @prop {string} placeholder - 드롭다운에 표시되는 placeholder.
 * @prop {string} buttonWidth - 드롭다운 버튼자체의 width 값.
 * @prop {string} menuWidth - 드롭다운 클릭 시 펼쳐지는 menu의 width 값.
 * @prop {string} chipsGroupTitle - chips 컨테이너의 title.
 * @prop {boolean} useResourceItemsFormatter - k8s서비스콜을 통해 받아온 리소스리스트에서 필요한 정보를 사용해 {key, apiVersion, kind, label, value} 형태의 item으로 이루어진 드롭다운을 만들어주는 formatter 사용여부를 결정하는 값. 리소스 kind아이콘이 표시된 형태의 드롭다운을 만들어준다. 해당 옵션을 사용하려면 items props로 k8s콜을 통해 가져온 리소스리스트를 넣어주어야 한다.
 * @prop {any[]} defaultValues - 드롭다운의 기본 선택값을 지정해주는 속성. [{lable: 'AAA', value: 'aaa'}, {label: 'BBB', value: 'bbb'}] 형태로 설정해주고, 해당 item은 items props에 존재하는 item이어야 한다. (Controller로 감싸서 ListView컴포넌트 안에 사용 시 Controller의 defaultValue속성에도 같은 값을 지정해줘야 한다)
 * @prop {any | any[]} items - 옛버전의 dropdown에서 object로 사용해서 object도 받을 수 있게 처리해놓았으나, object[] 형태의 사용을 권장함. (예: [{lable: 'AAA', value: 'aaa'}, {label: 'BBB', value: 'bbb'}])
 */

export const MultiSelectDropdownWithRef = React.forwardRef<HTMLInputElement, MultiSelectDropdownWithRefProps>((props, ref) => {
  const { name, defaultValues = [], methods, items, useResourceItemsFormatter, kind, menuWidth = '200px', placeholder = 'Select Resources', chipsGroupTitle = 'Resources', buttonWidth = '200px' } = props;
  const { setValue, watch } = methods ? methods : useFormContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const dropdownElement = React.useRef<HTMLDivElement>();

  const handleChange = (value, action, setStateFunction, childSelect = null) => {
    const inputRef = action.name;
    setValue(inputRef, value);
  };

  const defaultValuesWithKey = defaultValues.map(item => {
    return {
      key: `${item.label}-${item.value}`,
      label: item.label,
      value: item.value,
    };
  });

  const selectedValues = watch(name, defaultValuesWithKey);

  const onWindowClick = event => {
    const { current } = dropdownElement;
    if (!current) {
      return;
    }

    if (event.target === current || (current && current.contains(event.target))) {
      return;
    }

    hide(event);
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
  if (useResourceItemsFormatter && Array.isArray(items)) {
    formattedOptions = items.map(item => {
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

  // MEMO : 옛버전의 dropdown공통컴포넌트 사용 시 {[value1]: [label1], [value2]: [label2]} 형식으로 items값을 지정해주고있어서 예전 dropdown을 MultiSelectDropdownWithRef로 대체했을 때 동작하게하기 위해
  // 그렇게 들어왔을 때에도 object형태의 item으로 바꿔주기 위해 추가한 부분.
  // ***** 이후 MultiSelectDropdownWithRef컴포넌트를 새로 사용하는 상황이라면 items 형태는 object들로 이루어진 Array로 지정해주는 것을 권장함! *****
  let options = [];
  if (!Array.isArray(items)) {
    for (const key in items) {
      options.push({
        key: `${key}-${items[key]}`,
        value: key,
        label: items[key],
      });
    }
  } else {
    if (!useResourceItemsFormatter) {
      // MEMO : item마다 고유의 key값이 있어야 delete chip 가능해서 key값 넣어주는 부분.
      // MEMO : key값 규칙은 "[label]-[value]"로 지정해주고 있음. defaultValues로 들어오는 값에 대해서도 이와 같이 key값 만들어서 지정해줌.
      options = items.map(item => {
        return { key: item.key || `${item.label}-${item.value}`, label: item.label, value: item.value };
      });
    }
  }
  const toggleOpen = () => {
    window.addEventListener('click', onWindowClick);
    setIsOpen(!isOpen);
  };

  const clearAll = () => {
    setValue(name, []);
  };

  const onDeleteChip = (chipGroup, chip) => {
    const newValues = selectedValues?.filter(item => chip.key !== item.key);
    setValue(name, newValues);
  };

  return (
    <DataToolbar id="multidropdown-toolbar" clearAllFilters={clearAll} clearFiltersButtonText={`Clear all`}>
      <DataToolbarContent>
        <DataToolbarItem>
          <DataToolbarFilter
            deleteChipGroup={clearAll}
            chips={selectedValues?.map(item => {
              return {
                key: item.key,
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
            <Dropdown ref={dropdownElement} isOpen={isOpen} onClose={toggleOpen} target={<DropdownMainButton label={placeholder} toggleOpen={toggleOpen} count={selectedValues.length || 0} buttonWidth={buttonWidth} />}>
              <Select
                name={name}
                autoFocus
                styles={customStyles}
                value={selectedValues || []}
                options={useResourceItemsFormatter ? formattedOptions : options}
                controlShouldRenderValue={false}
                isMulti
                components={{
                  Option: useResourceItemsFormatter ? ResourceItem : TextItem,
                  IndicatorSeparator: null,
                  DropdownIndicator: null,
                }}
                ref={ref}
                onChange={(value, action) => {
                  handleChange(value, action, null, 'subtype');
                }}
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

type MultiSelectDropdownWithRefProps = {
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
};

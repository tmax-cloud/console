import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';
import { usePrevious } from '@console/metal3-plugin/src/hooks';

const DropDownRow: React.SFC<DropdownRowProps> = React.memo(props => {
  const { itemKey, content, onClick, hover, selected } = props;

  return (
    <li key={itemKey}>
      <button className={classNames('pf-c-dropdown__menu-item', { hover, focus: selected })} id={`${itemKey}-link`} data-test-id="dropdown-menu" data-test-dropdown-menu={itemKey} onClick={e => onClick(itemKey, e)}>
        {content}
      </button>
    </li>
  );
});

type DropdownRowProps = {
  itemKey: string;
  content: React.ReactNode;
  onClick: (selected: string, e: any) => void;
  className?: string;
  hover: boolean;
  selected: boolean;
};

const Dropdown_: React.SFC<DropdownProps> = props => {
  const { name, ariaLabel, className, buttonClassName, menuClassName, dropDownClassName, titlePrefix, describedBy, disabled, required, methods, defaultValue } = props;
  const { register, unregister, setValue, watch } = methods ? methods : useFormContext();

  const selectedKey = watch(name, defaultValue);

  const [itemList, setItemList] = React.useState(props.items);
  const [active, setActive] = React.useState(!!props.active);
  const [keyboardHoverKey, setKeyboardHoverKey] = React.useState(selectedKey);

  const prevItems = usePrevious(itemList); //itemList가 바뀔 때만 prevItems 갱신하도록 의도함

  React.useEffect(() => {
    register({ name }, { required });

    return () => {
      unregister(name);
      window.removeEventListener('click', onWindowClick);
    };
  }, [name, register, unregister]);

  React.useEffect(() => {
    if (!_.isEqual(prevItems, props.items)) {
      setItemList(props.items);
      setValue(name, defaultValue);
      setKeyboardHoverKey(defaultValue);
    }
  }, [props.items]);

  React.useEffect(() => {
    setValue(name, defaultValue);
    setKeyboardHoverKey(defaultValue);
  }, [defaultValue]);

  const dropdownElement = React.useRef<HTMLDivElement>();
  const dropdownList = React.useRef<HTMLUListElement>();

  const onWindowClick = event => {
    if (active) {
      return;
    }

    const { current } = dropdownElement;
    if (!current) {
      return;
    }

    if (event.target === current || (current && current.contains(event.target))) {
      return;
    }

    hide(event);
  };

  const onClickItem = (selected, e) => {
    e.preventDefault();
    e.stopPropagation();

    setValue(name, selected);
    setKeyboardHoverKey(selected);

    hide(e);
  };

  const toggle = e => {
    e.preventDefault();

    if (disabled) {
      return;
    }

    if (active) {
      hide(e);
    } else {
      show();
    }
  };

  const show = () => {
    window.removeEventListener('click', onWindowClick);
    window.addEventListener('click', onWindowClick);
    setActive(true);
  };

  const hide = e => {
    e && e.stopPropagation();
    window.removeEventListener('click', onWindowClick);
    setActive(false);
  };

  const onKeyDown = e => {
    const { key } = e;
    if (key === 'Escape') {
      hide(e);
      return;
    }

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') {
      return;
    }

    if (key === 'Enter') {
      if (active && itemList[keyboardHoverKey]) {
        onClickItem(keyboardHoverKey, e);
      }
      return;
    }

    const keys = _.keys(itemList);

    let index = _.indexOf(keys, keyboardHoverKey);

    if (key === 'ArrowDown') {
      index += 1;
    } else {
      index -= 1;
    }

    // periodic boundaries
    if (index >= keys.length) {
      index = 0;
    }
    if (index < 0) {
      index = keys.length - 1;
    }

    const newKey = keys[index];
    setKeyboardHoverKey(newKey);
    e.stopPropagation();
    e.preventDefault(); // 키보드 사용시 화면 스크롤되지 않도록 처리
  };

  const spacerBefore = props.spacerBefore || new Set();
  const headerBefore = props.headerBefore || {};
  const rows = [];

  const addItem = (key, content) => {
    const selected = key === selectedKey;
    const hover = key === keyboardHoverKey;
    const klass = classNames({ active: selected });
    if (spacerBefore.has(key)) {
      rows.push(
        <li key={`${key}-spacer`}>
          <div className="dropdown-menu__divider" />
        </li>,
      );
    }

    if (_.has(headerBefore, key)) {
      rows.push(
        <li key={`${key}-header`}>
          <div className="dropdown-menu__header">{headerBefore[key]}</div>
        </li>,
      );
    }
    rows.push(<DropDownRow className={klass} key={key} itemKey={key} content={content} onClick={onClickItem} selected={selected} hover={hover} />);
  };

  _.each(itemList, (v, k) => addItem(k, v));

  return (
    <div className={classNames(className)} ref={dropdownElement} style={...props.style}>
      <div className={classNames({ 'dropdown pf-c-dropdown hc-dropdown': true, 'pf-m-expanded': active, 'col-md-12': true }, dropDownClassName)}>
        <button aria-label={ariaLabel} aria-haspopup="true" aria-expanded={active} aria-describedby={describedBy} className={classNames('pf-c-dropdown__toggle hc-dropdown__button', buttonClassName)} data-test-id="dropdown-button" onClick={toggle} onKeyDown={onKeyDown} type="button" id={props.id} disabled={disabled}>
          <span className="pf-c-dropdown__toggle-text">
            {titlePrefix && `${titlePrefix}: `}
            {_.get(props.items, selectedKey ?? defaultValue, props.title)}
          </span>
          <CaretDownIcon className="pf-c-dropdown__toggle-icon" />
        </button>
        {active && (
          <ul ref={dropdownList} data-test-id="menu-list" className={classNames('pf-c-dropdown__menu hc-dropdown__menu', menuClassName)}>
            {rows}
          </ul>
        )}
      </div>
    </div>
  );
};

export const Dropdown = React.memo(Dropdown_);

export type DropdownProps = {
  id?: string;
  name: string;
  className?: string;
  style?: any;
  dropDownClassName?: string;
  ariaLabel?: string;
  headerBefore?: { [key: string]: string };
  items: object;
  menuClassName?: string;
  itemClassName?: string;
  buttonClassName?: string;
  spacerBefore?: Set<string>;
  textFilter?: string;
  title?: React.ReactNode;
  titlePrefix?: React.ReactNode;
  defaultValue?: string;
  describedBy?: string;
  active?: boolean;
  required?: boolean;
  disabled?: boolean;
  methods?: any;
};

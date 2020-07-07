import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';

import { history, ResourceName } from './index';
import { useTranslation } from 'react-i18next';

export class DropdownMixin extends React.PureComponent {
  constructor(props) {
    super(props);
    this.listener = this._onWindowClick.bind(this);
    this.state = { active: !!props.active, selectedKey: props.selectedKey };
    this.toggle = this.toggle.bind(this);
    this.dropdownElement = React.createRef();
    this.dropdownList = React.createRef();
  }

  _onWindowClick(event) {
    if (!this.state.active) {
      return;
    }

    const { current } = this.dropdownElement;
    if (!current) {
      return;
    }

    if (event.target === current || (current && current.contains(event.target))) {
      return;
    }

    this.hide(event);
  }

  componentWillReceiveProps({ selectedKey }) {
    if (selectedKey !== this.props.selectedKey) {
      this.setState({ selectedKey });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.listener);
  }

  onClick_(selectedKey, e) {
    e.preventDefault();
    e.stopPropagation();

    const { onChange, noSelection, title } = this.props;

    if (onChange) {
      onChange(selectedKey, e);
    }

    this.setState({
      active: false,
      selectedKey: selectedKey,
      title: noSelection ? title : this.props.items[selectedKey],
    });
  }

  toggle(e) {
    e.preventDefault();
    if (this.state.active) {
      this.hide(e);
    } else {
      this.show(e);
    }
  }

  show() {
    /* If you're wondering why this isn't in componentDidMount, it's because
     * cogs are dropdowns. A list of 200 pods would mean 200 global event
     * listeners. This is bad for performance. - ggreer
     */
    window.removeEventListener('click', this.listener);
    window.addEventListener('click', this.listener);
    this.setState({ active: true });
  }

  hide(e) {
    e && e.stopPropagation();
    window.removeEventListener('click', this.listener);
    this.setState({ active: false });
  }
}

const Caret = () => <span className="caret" />;

class DropDownRow extends React.PureComponent {
  render() {
    const { itemKey, content, onclick, className, selected, hover } = this.props;
    return (
      <li role="option" className={classNames(className)} key={itemKey}>
        <a href="#" ref={this.link} id={`${itemKey}-link`} className={classNames({ 'next-to-bookmark': hover, focus: selected })} onClick={e => onclick(itemKey, e)}>
          {content}
        </a>
      </li>
    );
  }
}

/** @augments {React.Component<any>} */
export class Dropdown extends DropdownMixin {
  constructor(props) {
    super(props);
    this.onClick = (...args) => this.onClick_(...args);

    this.state.items = props.items;

    this.state.title = props.noSelection ? props.title : _.get(props.items, props.selectedKey, props.title);
    this.onKeyDown = e => this.onKeyDown_(e);
    this.changeTextFilter = e => this.applyTextFilter_(e.target.value, this.props.items);
    const { shortCut } = this.props;
    this.globalKeyDown = e => {
      const { nodeName } = e.target;

      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
        return;
      }

      if (!shortCut || e.key !== shortCut) {
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      this.show(e);
    };
  }

  componentDidMount() {
    if (this.props.shortCut) {
      window.addEventListener('keydown', this.globalKeyDown);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener('keydown', this.globalKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    const props = this.props;

    if (_.isEqual(nextProps.items, props.items) && nextProps.title === props.title) {
      return;
    }
    const title = nextProps.title || props.title;
    this.setState({ title });

    this.applyTextFilter_(this.state.autocompleteText, nextProps.items);
  }

  componentDidUpdate(prevProps, prevState) {
    // kans: we have to move the carret to the end for some presently unknown reason
    if (!prevState.active && this.state.active && this.input) {
      const position = this.state.autocompleteText && this.state.autocompleteText.length;
      this.input.setSelectionRange(position, position);
    }
  }

  applyTextFilter_(autocompleteText, items) {
    const { autocompleteFilter } = this.props;
    if (autocompleteFilter && !_.isEmpty(autocompleteText)) {
      items = _.pickBy(items, (item, key) => autocompleteFilter(autocompleteText, item, key));
    }
    this.setState({ autocompleteText, items });
  }

  onKeyDown_(e) {
    const { key } = e;
    if (key === 'Escape') {
      this.hide(e);
      return;
    }

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') {
      return;
    }

    const { items, keyboardHoverKey } = this.state;

    if (key === 'Enter') {
      if (this.state.active && items[keyboardHoverKey]) {
        this.onClick(keyboardHoverKey, e);
      }
      return;
    }

    const keys = _.keys(items);

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
    this.setState({ keyboardHoverKey: newKey });
    e.stopPropagation();
  }

  render() {
    const { active, autocompleteText, selectedKey, items, title, keyboardHoverKey } = this.state;
    const { autocompleteFilter, autocompletePlaceholder, noButton, className, buttonClassName, menuClassName, dropDownClassName, titlePrefix } = this.props;

    const rows = [];

    const addItem = (key, content) => {
      const selected = key === selectedKey && !this.props.noSelection;
      const hover = key === keyboardHoverKey;
      const klass = classNames({ active: selected });
      rows.push(<DropDownRow className={klass} key={key} itemKey={key} content={content} onclick={this.onClick} selected={selected} hover={hover} />);
    };

    _.each(items, (v, k) => addItem(k, v));

    //Adding `dropDownClassName` specifically to use patternfly's context selector component, which expects `bootstrap-select` class on the dropdown. We can remove this additional property if that changes in upcoming patternfly versions.
    return (
      <div className={classNames(className)} ref={this.dropdownElement} style={this.props.style}>
        <div className={classNames('dropdown', dropDownClassName)}>
          {noButton ? (
            <div role="button" tabIndex="0" onClick={this.toggle} onKeyDown={this.onKeyDown} className="dropdown__not-btn" id={this.props.id}>
              {titlePrefix && `${titlePrefix}: `}
              <span className="dropdown__not-btn__title">{title}</span>&nbsp;
              <Caret />
            </div>
          ) : (
            <button aria-haspopup="true" onClick={this.toggle} onKeyDown={this.onKeyDown} type="button" className={classNames('btn', 'btn--dropdown', 'dropdown-toggle', buttonClassName ? buttonClassName : 'btn-default')} id={this.props.id}>
              <div className="btn--dropdown__content-wrap">
                <span className="btn--dropdown__item">
                  {titlePrefix && `${titlePrefix}: `}
                  {title}
                </span>
                <Caret />
              </div>
            </button>
          )}
          {active && (
            <ul role="listbox" ref={this.dropdownList} className={classNames('dropdown-menu', menuClassName)}>
              {autocompleteFilter && (
                <div className="dropdown-menu__filter">
                  <input autoFocus type="text" ref={input => (this.input = input)} onChange={this.changeTextFilter} placeholder={autocompletePlaceholder} value={autocompleteText || ''} autoCapitalize="none" onKeyDown={this.onKeyDown} className="form-control dropdown--text-filter" onClick={e => e.stopPropagation()} />
                </div>
              )}
              {rows}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  autocompleteFilter: PropTypes.func,
  autocompletePlaceholder: PropTypes.string,
  className: PropTypes.string,
  dropDownClassName: PropTypes.string,
  headerBefore: PropTypes.objectOf(PropTypes.string),
  items: PropTypes.object.isRequired,
  menuClassName: PropTypes.string,
  noButton: PropTypes.bool,
  noSelection: PropTypes.bool,
  textFilter: PropTypes.string,
  title: PropTypes.node,
};

export const ActionsMenu = props => {
  const { actions, title = undefined, menuClassName = undefined, noButton = false } = props;
  const shownActions = _.reject(actions, o => _.get(o, 'hidden', false));
  const items = _.fromPairs(_.map(shownActions, (v, k) => [k, v.label]));
  const { t } = useTranslation();
  const btnTitle = title || <span id="action-dropdown">{t('CONTENT:ACTIONS')}</span>;
  const onChange = (key, e) => {
    const action = shownActions[key];
    if (action.callback) {
      return action.callback(e);
    }
    if (action.href) {
      history.push(action.href);
    }
  };
  return <Dropdown className="btn--actions" menuClassName={menuClassName || 'dropdown-menu-right'} items={items} title={btnTitle} onChange={onChange} noSelection={true} noButton={noButton} />;
};

ActionsMenu.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      callback: PropTypes.func,
    }),
  ).isRequired,
  menuClassName: PropTypes.string,
  noButton: PropTypes.bool,
  title: PropTypes.node,
};

const containerLabel = container => <ResourceName name={container ? container.name : ''} kind="Container" />;

export class ContainerDropdown extends React.PureComponent {
  getSpacer(container) {
    const spacerBefore = new Set();
    return container ? spacerBefore.add(container.name) : spacerBefore;
  }

  getHeaders(container, initContainer) {
    return initContainer
      ? {
          [container.name]: 'Containers',
          [initContainer.name]: 'Init Containers',
        }
      : {};
  }

  render() {
    const { currentKey, containers, initContainers, onChange } = this.props;
    if (_.isEmpty(containers) && _.isEmpty(initContainers)) {
      return null;
    }
    const firstInitContainer = _.find(initContainers, { order: 0 });
    const firstContainer = _.find(containers, { order: 0 });
    const spacerBefore = this.getSpacer(firstInitContainer);
    const headerBefore = this.getHeaders(firstContainer, firstInitContainer);
    const dropdownItems = _.mapValues(_.merge(containers, initContainers), containerLabel);
    const title = _.get(dropdownItems, currentKey) || containerLabel(firstContainer);
    return <Dropdown className="btn-group" menuClassName="dropdown-menu--text-wrap" headerBefore={headerBefore} items={dropdownItems} spacerBefore={spacerBefore} title={title} onChange={onChange} />;
  }
}

ContainerDropdown.propTypes = {
  containers: PropTypes.object.isRequired,
  currentKey: PropTypes.string,
  initContainers: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

ContainerDropdown.defaultProps = {
  currentKey: '',
  initContainers: {},
};

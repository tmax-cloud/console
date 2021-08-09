import * as React from 'react';
import * as _ from 'lodash-es';
import { OrderedMap } from 'immutable';
import * as classNames from 'classnames';
import * as fuzzy from 'fuzzysearch';
import { useFormContext } from 'react-hook-form';

import { Dropdown, ResourceIcon } from '../../utils';
import { K8sResourceKind } from '../../../module/k8s';
import { Badge, Checkbox, DataToolbar, DataToolbarContent, DataToolbarFilter, DataToolbarItem, DataToolbarChip } from '@patternfly/react-core';
import { usePrevious } from '@console/metal3-plugin/src/hooks';
import { useTranslation } from 'react-i18next';

const autocompleteFilter = (text, item) => {
  const { resource } = item.props;
  if (!resource) {
    return false;
  }

  return fuzzy(_.toLower(text), _.toLower(resource.fakeMetadata?.fakename ?? resource.metadata.name));
};

export type HCK8sResourceKind = K8sResourceKind & {
  fakeMetadata?: any;
};

const DropdownItem: React.SFC<DropdownItemProps> = ({ resource }) => (
  <>
    <span className={'co-resource-item'}>
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={resource.kind} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>{resource.fakeMetadata?.fakename ?? resource.metadata.name}</span>
      </span>
    </span>
  </>
);

const DropdownItemWithCheckbox: React.SFC<DropdownItemWithCheckboxProps> = ({ resource, checked }) => (
  <>
    <span className={'co-resource-item'}>
      <Checkbox tabIndex={-1} id={`${resource.metadata.uid}:checkbox`} checked={checked} />
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={resource.kind} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>{resource.fakeMetadata?.fakename ?? resource.metadata.name}</span>
      </span>
    </span>
  </>
);

type DropdownItemProps = {
  resource: HCK8sResourceKind;
};

type DropdownItemWithCheckboxProps = DropdownItemProps & {
  checked: boolean;
};

export const SingleResourceListDropdown: React.SFC<BaseResourceListDropdown & SingleResourceDropdownProps & { selected: string; onChange: (value: string) => void }> = props => {
  const { resourceList, onChange, className, selected, kind, idFunc } = props;

  // Create dropdown items for each resource.
  const items = OrderedMap(_.map(resourceList, resource => [idFunc ? idFunc(resource) : resource.metadata.name, <DropdownItem resource={{ kind: kind, ...resource }} />])).toJS() as { [s: string]: JSX.Element };

  const isSelected = !!selected && items[selected];

  const autocompletePlaceholder = props.autocompletePlaceholder ?? 'Select Resource';
  const placeholder = props.placeholder ?? props.resourceType;

  return <Dropdown menuClassName="dropdown-menu--text-wrap" className={classNames('co-type-selector', className)} items={items} title={props.title ?? (isSelected ? items[selected] : placeholder)} onChange={onChange} autocompleteFilter={props.autocompleteFilter ?? autocompleteFilter} autocompletePlaceholder={autocompletePlaceholder} type="single" />;
};

export const MultipleResourceListDropdown: React.SFC<BaseResourceListDropdown & MultipleResourceDropdownProps & { selected: Set<string>; onChange: (value: string) => void }> = props => {
  const { resourceList, onChange, className, selected, showAll, resourceType, kind, idFunc } = props;
  const { t } = useTranslation();
  const selectedSize = selected.size;

  const isSelected = (name: string) => {
    return selected.has('All') || selected.has(name);
  };
  // Create dropdown items for each resource.
  const items = OrderedMap(_.map(resourceList, resource => [idFunc ? idFunc(resource) : resource.metadata.name, <DropdownItemWithCheckbox resource={{ kind: kind, ...resource }} checked={isSelected(idFunc ? idFunc(resource) : resource.metadata.name)} />]));
  // Add an "All" item to the top if `showAll`.
  const allItems = (showAll
    ? OrderedMap({
        All: (
          <>
            <span className="co-resource-item">
              <Checkbox id="all-resources" checked={isSelected('All')} />
              <span className="co-resource-icon--fixed-width">
                <ResourceIcon kind="All" />
              </span>
              <span className="co-resource-item__resource-name">
                {t('SINGLE:MSG_CONTAINERREGISTRIES_CREATEIMAGESCANREQUESTPOPUP_1', { 0: resourceType })}
                {/* {`All ${resourceType}`} */}
              </span>
            </span>
          </>
        ),
      }).concat(items)
    : items
  ).toJS() as { [s: string]: JSX.Element };

  const autocompletePlaceholder = props.autocompletePlaceholder ?? 'Select Resources';

  return (
    <Dropdown
      menuClassName="dropdown-menu--text-wrap"
      className={classNames('co-type-selector', className)}
      items={allItems}
      title={
        props.title ?? (
          <div key="title-resource">
            {`${props.resourceType} `}
            <Badge isRead id="mrd-badge">{selected?.has('All') ? 'All' : selectedSize}</Badge>
          </div>
        )
      }
      onChange={onChange}
      autocompleteFilter={props.autocompleteFilter ?? autocompleteFilter}
      autocompletePlaceholder={autocompletePlaceholder}
      type="multiple"
    />
  );
};

export interface ResourceDropdownCommon {
  name?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  title?: string | JSX.Element;
  resourceType?: string;
  autocompletePlaceholder?: string;
  autocompleteFilter?: (text: any, item: any) => any;
  useHookForm?: boolean;
  className?: string;
  dropDownClassName?: string;
  menuClassName?: string;
  buttonClassName?: string;
  type: 'single' | 'multiple';
  methods?: any;
  idFunc?: (item: HCK8sResourceKind) => string;
}

export interface BaseResourceListDropdown extends ResourceDropdownCommon {
  resourceList: HCK8sResourceKind[];
  kind?: string;
}

export interface SingleResourceDropdownProps extends ResourceDropdownCommon {
  type: 'single';
  placeholder?: string | JSX.Element;
  defaultValue?: string;
}

export interface MultipleResourceDropdownProps extends ResourceDropdownCommon {
  type: 'multiple';
  showAll?: boolean;
  defaultValue?: string[];
}

const ResourceListDropdown_: React.SFC<ResourceListDropdownProps> = props => {
  const { name, required, methods, useHookForm, idFunc } = props;
  const { register, unregister, setValue, watch } = methods ? methods : useHookForm ? useFormContext() : { register: null, unregister: null, setValue: null, watch: null };

  const prevResourceList = usePrevious(props.resourceList);

  if (useHookForm || methods) {
    React.useEffect(() => {
      register({ name }, { required });

      return () => {
        unregister(name);
      };
    }, [name, register, unregister]);
  }

  const defaultSelected = watch?.(name, props.defaultValue);
  React.useEffect(() => {
    if (!_.isEqual(prevResourceList, props.resourceList)) {
      setValue?.(name, props.defaultValue);
    }
  }, [props.resourceList, props.defaultValue]);

  if (props.type === 'multiple') {
    const { resourceList } = props;
    const [selectedItems, setSelectedItems] = React.useState(new Set<string>(defaultSelected ?? []));
    const [selectedItemSize, setSelectedItemSize] = React.useState(selectedItems.size);
    const resourceListLength = resourceList.length;
    const allItems = new Set<string>(resourceList.map(resource => (idFunc ? idFunc(resource) : resource.metadata.name)));

    const selectAllItems = () => {
      setSelectedItems(new Set(['All']));
      setValue?.(name, [...allItems]);
      setSelectedItemSize(resourceListLength);
    };

    const clearAll = () => {
      setSelectedItems(new Set([]));
      setValue?.(name, []);
      setSelectedItemSize(0);
    };

    const updateSelectedItems = (selection: string) => {
      if (selection === 'All') {
        selectedItems.has(selection) ? clearAll() : selectAllItems();
      } else {
        if (selectedItems.has('All')) {
          const updateItems = new Set(allItems);
          updateItems.delete(selection);
          setSelectedItems(updateItems);
          setValue?.(name, [...updateItems]);
          setSelectedItemSize(resourceListLength - 1);
        } else {
          const updateItems = new Set(selectedItems);
          let updateItemSize = selectedItemSize;
          if (updateItems.has(selection)) {
            updateItems.delete(selection);
            updateItemSize--;
          } else {
            updateItems.add(selection);
            updateItemSize++;
          }
          updateItemSize === resourceListLength ? selectAllItems() : setSelectedItems(updateItems);
          setSelectedItemSize(updateItemSize);
          setValue?.(name, [...updateItems]);
        }
      }
      props.onChange?.(selection);
    };

    return <MultipleResourceListDropdown {...props} selected={selectedItems} onChange={updateSelectedItems} />;
  } else {
    const [selectedItem, setSelectedItem] = React.useState(defaultSelected ?? '');

    const updateSelectedItem = (selection: string) => {
      setSelectedItem(selection);
      setValue?.(name, selection);
      props.onChange?.(selection);
    };

    return <SingleResourceListDropdown {...props} selected={selectedItem} onChange={updateSelectedItem} />;
  }
};

function areEqual(prevProps, nextProps) {
  // MEMO : methods와 idFunc, onChange 속성은 매번 다르게 인식돼서 memo비교문에서 제거함
  return _.isEqual(_.omit(prevProps, ['methods', 'idFunc', 'onChange']), _.omit(nextProps, ['methods', 'idFunc', 'onChange']));
}

export const ResourceListDropdown = React.memo(ResourceListDropdown_, areEqual);

export type ResourceListDropdownProps = BaseResourceListDropdown & (SingleResourceDropdownProps | MultipleResourceDropdownProps);

ResourceListDropdown_.defaultProps = {
  resourceType: 'Resources',
  type: 'single',
  useHookForm: false,
};

export const ResourceListDropdownWithDataToolbar: React.SFC<ResourceListDropdownWithDataToolbarProps> = props => {
  const { resourceList } = props;
  const [selectedItems, setSelectedItems] = React.useState(new Set<string>([]));
  const { t } = useTranslation();

  const allItems = new Set<string>(resourceList.map(resource => resource.metadata.name));

  React.useEffect(() => {
    props.onSelectedItemChange?.(selectedItems);
  }, [selectedItems]);

  const updateSelectedItems = (selection: string) => {
    if (selection === 'All') {
      selectedItems.has(selection) ? clearAll() : selectAllItems();
    } else {
      if (selectedItems.has('All')) {
        const updateItems = new Set(allItems);
        updateItems.delete(selection);
        setSelectedItems(updateItems);
      } else {
        const updateItems = new Set(selectedItems);
        updateItems.has(selection) ? updateItems.delete(selection) : updateItems.add(selection);
        updateItems.size === resourceList.length ? selectAllItems() : setSelectedItems(updateItems);
      }
    }
    props.onChange?.(selection);
  };

  const updateNewItems = (filter: string, { key }: DataToolbarChip) => {
    updateSelectedItems(key);
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(['All']));
  };

  const clearAll = () => {
    setSelectedItems(new Set([]));
  };

  return (
    <DataToolbar id="search-toolbar" clearAllFilters={clearAll} clearFiltersButtonText={props.clearFiltersButtonText ?? t('COMMON:MSG_MAIN_POPUP_1', { 0: props.resourceType })}>
      <DataToolbarContent>
        <DataToolbarItem>
          <DataToolbarFilter
            deleteChipGroup={clearAll}
            chips={[...selectedItems].map(name => {
              const item = resourceList.find(i => i.metadata.name === name);
              return {
                key: name,
                node: (
                  <>
                    <ResourceIcon kind={item?.kind ?? name} />
                    {item?.fakeMetadata?.fakename ?? item?.metadata.name ?? name}
                  </>
                ),
              };
            })}
            deleteChip={updateNewItems}
            categoryName={props.resourceType}
          >
            <MultipleResourceListDropdown {...props} resourceList={resourceList} selected={selectedItems} onChange={updateSelectedItems} type="multiple" />
          </DataToolbarFilter>
        </DataToolbarItem>
      </DataToolbarContent>
    </DataToolbar>
  );
};

export type ResourceListDropdownWithDataToolbarProps = {
  name?: string;
  required?: boolean;
  resourceList: HCK8sResourceKind[];
  className?: string;
  showAll?: boolean;
  title?: string | JSX.Element;
  resourceType?: string;
  autocompletePlaceholder?: string;
  autocompleteFilter?: (text: any, item: any) => any;
  onChange?: (item: string) => any;
  onSelectedItemChange?: (items: Set<string>) => any;
  useHookForm?: boolean;
  clearFiltersButtonText?: string;
};

ResourceListDropdownWithDataToolbar.defaultProps = {
  resourceType: 'Resources',
};

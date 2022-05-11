import * as React from 'react';
import * as _ from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { Checkbox, DataToolbar, DataToolbarContent, DataToolbarFilter, DataToolbarChip, DataToolbarItem, DropdownItem, Dropdown, DropdownToggle, DropdownGroup, Badge } from '@patternfly/react-core';
import { CaretDownIcon, FilterIcon } from '@patternfly/react-icons';
import { Dropdown as DropdownInternal } from '@console/internal/components/utils';
import { setQueryArgument, removeQueryArgument } from './utils';
import { filterList } from '../actions/k8s';
import AutocompleteInput from './autocomplete';
import { storagePrefix } from './row-filter';
import { useTranslation } from 'react-i18next';
import { ServicePlanModel, ClusterServicePlanModel, ServiceClassModel, ClusterServiceClassModel } from '@console/internal/models';

/**
 * Housing both the row filter and name/label filter in the same file.
 */
enum FilterType {
  NAME = 'Name',
  LABEL = 'Label',
  EXTERNAL_NAME = 'ExternalName',
}

const filterTypeMap = Object.freeze({
  [FilterType.LABEL]: 'labels',
  [FilterType.NAME]: 'name',
  [FilterType.EXTERNAL_NAME]: 'externalName',
});

type Filter = {
  [key: string]: string[];
};

type FilterKeys = {
  [key: string]: string;
};

const requireExternalNameFiltering = [ServicePlanModel.kind, ClusterServicePlanModel.kind, ServiceClassModel.kind, ClusterServiceClassModel.kind];

const getDropdownItems = (rowFilters: RowFilter[], selectedItems, data, props) =>
  rowFilters.map(grp => {
    const items = grp.itemsGenerator ? grp.itemsGenerator(props, props.kind) : grp.items;
    return (
      <DropdownGroup key={grp.filterGroupName} label={grp.filterLabel || grp.filterGroupName} className="co-filter-dropdown-group">
        {_.map(items, item => (
          <DropdownItem data-test-row-filter={item.id} key={item.id} id={item.id} className="co-filter-dropdown__item" listItemClassName="co-filter-dropdown__list-item">
            <div className="co-filter-dropdown-item">
              <span className="co-filter-dropdown-item__checkbox">
                <Checkbox isChecked={selectedItems.includes(item.id)} id={`${item.id}-checkbox`} />
              </span>
              <span className="co-filter-dropdown-item__name">{item.title}</span>
              <Badge key={item.id} isRead>
                {_.countBy(data, grp.reducer)?.[item.id] ?? '0'}
              </Badge>
            </div>
          </DropdownItem>
        ))}
      </DropdownGroup>
    );
  });

const FilterToolbar_: React.FC<FilterToolbarProps & RouteComponentProps> = props => {
  const { rowFilters = [], data, hideToolbar, hideLabelFilter, location, textFilter = filterTypeMap[FilterType.NAME], storeSelectedRows = new Set(), defaultSelectedRows = [], setCheckedRowFilter, setNameFilterText, isK8SResource = true } = props;

  const [inputText, setInputText] = React.useState('');
  const [filterType, setFilterType] = React.useState(FilterType.NAME);
  const [isOpen, setOpen] = React.useState(false);

  // (rowFilters) => {'rowFilterTypeA': ['staA', 'staB'], 'rowFilterTypeB': ['stbA'] }
  const filters: Filter = rowFilters.reduce((acc, curr) => {
    const rowItems = curr.itemsGenerator ? curr.itemsGenerator(props, props?.kinds) : curr.items;
    const items = _.map(rowItems, 'id');
    acc[curr.filterGroupName] = items;
    return acc;
  }, {});

  // {id: 'a' , title: 'A'} => filterNameMap['a'] = A
  const filtersNameMap: FilterKeys = rowFilters.reduce((acc, curr) => {
    const rowItems = curr.itemsGenerator ? curr.itemsGenerator(props, props?.kinds) : curr.items;
    const items = rowItems.reduce((itemAcc, itemCurr) => {
      itemAcc[itemCurr.id] = itemCurr.title;
      return itemAcc;
    }, {});
    return { ...acc, ...items };
  }, {});

  // (storagePrefix, rowFilters) => { 'rowFilterTypeA' = 'storagePrefix-filterTypeA' ...}
  const filterKeys: FilterKeys = rowFilters.reduce((acc, curr) => {
    const str = `${storagePrefix}${curr.type}`;
    acc[curr.filterGroupName] = str;
    return acc;
  }, {});

  // (url) => {nameFilter, labelFilters, rowFilters}
  const { name: nameFilter, labels: labelFilters, externalName: externalNameFilter, rowFiltersFromURL: selectedRowFilters } = (() => {
    const rowFiltersFromURL: string[] = [];
    const params = new URLSearchParams(location.search);
    const q = params.get('label');
    const name = params.get(textFilter);
    _.map(filterKeys, f => {
      const vals = params.get(f);
      if (vals) {
        rowFiltersFromURL.push(...vals.split(','));
      }
    });
    const labels = q ? q.split(',') : [];
    const externalName = params.get('externalName');
    return { name, labels, externalName, rowFiltersFromURL };
  })();

  /* Logic for Name and Label Filter */

  const applyFilter = (input: string | string[], type: FilterType) => {
    const filter = filterTypeMap[type];
    const value = type === FilterType.LABEL ? { all: input } : input;
    isK8SResource && props.reduxIDs.forEach(id => props.filterList(id, filter, value));
  };

  const updateLabelFilter = (filterValues: string[]) => {
    if (filterValues.length > 0) {
      setQueryArgument('label', filterValues.join(','));
    } else {
      removeQueryArgument('label');
    }
    setInputText('');
    applyFilter(filterValues, FilterType.LABEL);
  };

  const updateNameFilter = (filterValue: string) => {
    if (!_.isEmpty(filterValue)) {
      setQueryArgument(textFilter, filterValue);
    } else {
      removeQueryArgument(textFilter);
    }
    setInputText(filterValue);
    isK8SResource ? applyFilter(filterValue, FilterType.NAME) : setNameFilterText(filterValue); ;
  };

  const updateExternalNameFilter = (filterValue: string) => {
    if (!_.isEmpty(filterValue)) {
      setQueryArgument(filterTypeMap[FilterType.EXTERNAL_NAME], filterValue);
    } else {
      removeQueryArgument(filterTypeMap[FilterType.EXTERNAL_NAME]);
    }
    setInputText(filterValue);
    applyFilter(filterValue, FilterType.EXTERNAL_NAME);
  };

  const updateSearchFilter = (value: string) => {
    switch (filterType) {
      case FilterType.NAME:
        updateNameFilter(value);
        break;
      case FilterType.LABEL:
        setInputText(value);
        break;
      case FilterType.EXTERNAL_NAME:
        updateExternalNameFilter(value);
        break;
      default:
        break;
    }
  };

  /* Logic Related to Row Filters Ex:(Status, Type) */

  const applyRowFilter = (selected: string[]) => {
    rowFilters.forEach(filter => {
      const rowItems = filter.itemsGenerator ? filter.itemsGenerator(props, props?.kinds) : filter.items;
      const all = _.map(rowItems, 'id');
      const recognized = _.intersection(selected, all);
      isK8SResource && (props.reduxIDs || []).forEach(id => props.filterList(id, filter.type, { selected: new Set(recognized), all }));
    });
  };

  const setQueryParameters = (selected: string[]) => {
    if (!_.isEmpty(selectedRowFilters) || !_.isEmpty(selected)) {
      _.forIn(filters, (value, key) => {
        const recognized = _.filter(selected, item => value.includes(item));
        if (recognized.length > 0) {
          setQueryArgument(filterKeys[key], recognized.join(','));
        } else {
          removeQueryArgument(filterKeys[key]);
        }
      });
    }
  };

  const updateRowFilterSelected = (id: string[]) => {
    const selectedNew = _.xor(selectedRowFilters, id);
    isK8SResource ? applyRowFilter(selectedNew) : setCheckedRowFilter(selectedNew.join());
    setQueryParameters(selectedNew);
    setOpen(false);
  };

  const defaultRowFilterSetting = (filterList: string[]) => {
    applyRowFilter(filterList);
    setQueryParameters(filterList);
    setOpen(false);
  };

  const clearAllRowFilter = (f: string) => {
    updateRowFilterSelected(_.intersection(filters[f], selectedRowFilters));
  };

  const onRowFilterSelect = event => {
    event.preventDefault();
    updateRowFilterSelected([event?.target?.id]);
  };

  const clearAll = () => {
    updateRowFilterSelected(selectedRowFilters);
    updateNameFilter('');
    updateLabelFilter([]);
    updateExternalNameFilter('');
  };

  // Initial URL parsing
  React.useEffect(() => {
    !_.isEmpty(labelFilters) && applyFilter(labelFilters, FilterType.LABEL);
    !_.isEmpty(nameFilter) && applyFilter(nameFilter, FilterType.NAME);
    !_.isEmpty(externalNameFilter) && applyFilter(externalNameFilter, FilterType.EXTERNAL_NAME);

    if (_.isEmpty(selectedRowFilters)) {
      if (storeSelectedRows.size == 0 && !_.isEmpty(defaultSelectedRows) && !hideToolbar) {
        applyRowFilter(defaultSelectedRows);
        setQueryParameters(defaultSelectedRows);
      }
    } else {
      applyRowFilter(selectedRowFilters);
    }

    if (location.search.indexOf('rowFilter-pod-status') >= 0) {
      defaultRowFilterSetting(location.search.split('rowFilter-pod-status=')[1].split('%2C'));
    }
  }, []);

  React.useEffect(() => {
    if (_.isEmpty(selectedRowFilters) && storeSelectedRows.size > 0) {
      applyRowFilter(Array.from(storeSelectedRows));
      setQueryParameters(Array.from(storeSelectedRows));
    }
  });
  const switchFilter = type => {
    setFilterType(type);
    switch (type) {
      case FilterType.NAME:
        setInputText(nameFilter || '');
        break;
      case FilterType.EXTERNAL_NAME:
        setInputText(externalNameFilter || '');
        break;
      default:
        setInputText('');
    }
  };

  const dropdownItems = getDropdownItems(rowFilters, selectedRowFilters, data, props);

  const { t } = useTranslation();
  const searchFilterTitle = {
    [FilterType.LABEL]: t('COMMON:MSG_COMMON_SEARCH_FILTER_2'),
    [FilterType.NAME]: t('COMMON:MSG_COMMON_SEARCH_FILTER_1'),
  };

  const placeHolders = {
    [FilterType.LABEL]: 'app=frontend',
    [FilterType.NAME]: t('COMMON:MSG_COMMON_SEARCH_PLACEHOLDER_1'),
    [FilterType.EXTERNAL_NAME]: t('COMMON:MSG_COMMON_SEARCH_PLACEHOLDER_3'),
  };

  // MEMO : 특정 리소스 타입에서만 필요로 하는 검색기준이 있을 때
  if (props.kinds.length === 1) {
    if (requireExternalNameFiltering.includes(props.kinds[0])) {
      searchFilterTitle[FilterType.EXTERNAL_NAME] = t('COMMON:MSG_COMMON_SEARCH_FILTER_5');
    }
  }

  return (
    !hideToolbar && (
      <DataToolbar id="filter-toolbar" clearAllFilters={clearAll} clearFiltersButtonText={t('COMMON:MSG_COMMON_FILTER_11')}>
        <DataToolbarContent>
          {rowFilters.length > 0 && (
            <DataToolbarItem>
              {_.reduce(
                Object.keys(filters),
                (acc, key) => (
                  <DataToolbarFilter
                    key={key}
                    chips={_.intersection(selectedRowFilters, filters[key]).map(item => {
                      return { key: item, node: filtersNameMap[item] };
                    })}
                    deleteChip={(filter, chip: DataToolbarChip) => updateRowFilterSelected([chip.key])}
                    categoryName={key}
                    deleteChipGroup={() => clearAllRowFilter(key)}
                  >
                    {acc}
                  </DataToolbarFilter>
                ),
                <Dropdown
                  dropdownItems={dropdownItems}
                  onSelect={onRowFilterSelect}
                  isOpen={isOpen}
                  toggle={
                    <DropdownToggle data-test-id="filter-dropdown-toggle" onToggle={() => setOpen(!isOpen)} iconComponent={CaretDownIcon}>
                      <FilterIcon className="span--icon__right-margin" />
                      {t('COMMON:MSG_COMMON_FILTER_7')}
                    </DropdownToggle>
                  }
                />,
              )}
            </DataToolbarItem>
          )}
          <DataToolbarItem className="co-filter-search--full-width">
            <DataToolbarFilter deleteChipGroup={() => updateLabelFilter([])} chips={!hideLabelFilter ? [...labelFilters] : []} deleteChip={(filter, chip: string) => updateLabelFilter(_.difference(labelFilters, [chip]))} categoryName={t('COMMON:MSG_COMMON_SEARCH_FILTER_2')}>
              <DataToolbarFilter chips={nameFilter?.length ? [nameFilter] : []} deleteChip={() => updateNameFilter('')} categoryName={t('COMMON:MSG_COMMON_SEARCH_FILTER_1')}>
                <DataToolbarFilter chips={externalNameFilter?.length ? [externalNameFilter] : []} deleteChip={() => updateExternalNameFilter('')} categoryName={t('COMMON:MSG_COMMON_SEARCH_FILTER_5')}>
                  <div className="pf-c-input-group">
                    {!hideLabelFilter && <DropdownInternal items={searchFilterTitle} onChange={switchFilter} selectedKey={filterType} title={searchFilterTitle[filterType]} />}
                    <AutocompleteInput
                      className="co-text-node"
                      onSuggestionSelect={selected => {
                        updateLabelFilter(_.uniq([...labelFilters, selected]));
                      }}
                      showSuggestions={FilterType.LABEL === filterType}
                      textValue={inputText}
                      setTextValue={updateSearchFilter}
                      placeholder={placeHolders[filterType]}
                      data={data}
                    />
                  </div>
                </DataToolbarFilter>
              </DataToolbarFilter>
            </DataToolbarFilter>
          </DataToolbarItem>
        </DataToolbarContent>
      </DataToolbar>
    )
  );
};

type FilterToolbarProps = {
  rowFilters?: RowFilter[];
  data?: any;
  reduxIDs?: string[];
  filterList?: any;
  textFilter?: string;
  hideToolbar?: boolean;
  hideLabelFilter?: boolean;
  parseAutoComplete?: any;
  kinds?: any;
  storeSelectedRows?: any;
  defaultSelectedRows?: string[];
  setCheckedRowFilter?: Function;
  setNameFilterText?: Function;
  isK8SResource?: boolean;
};

export type RowFilter = {
  filterLabel?: string;
  filterGroupName: string;
  type: string;
  items?: {
    [key: string]: string;
  }[];
  itemsGenerator?: (...args) => { [key: string]: string }[];
  reducer: (param) => React.ReactText;
  filter?: any;
};

//TODO: doesnt consider multiple filters
const mapStateToProps = (state, props) => {
  const id = props.reduxIDs?.[0];
  const name = `filters`;
  const type = props.rowFilters?.[0].type;
  const storeSelectedRows = state.k8s.getIn([id, name, type])?.selected;

  return { storeSelectedRows };
};

export const FilterToolbar = withRouter(connect(mapStateToProps, { filterList })(FilterToolbar_));
FilterToolbar.displayName = 'FilterToolbar';

import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import * as fuzzy from 'fuzzysearch';
import { toLower } from 'lodash';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Tooltip, Button } from '@patternfly/react-core';
import { NavBar } from '../utils/horizontal-nav';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '../utils';
import { Dropdown as DropdownInternal } from '@console/internal/components/utils';
import { Checkbox, DataToolbar, DataToolbarContent, DataToolbarFilter, DataToolbarChip, DataToolbarItem, Dropdown, DropdownItem, DropdownToggle, DropdownGroup, Badge } from '@patternfly/react-core';
import { CaretDownIcon, FilterIcon } from '@patternfly/react-icons';
import AutocompleteInput from '../autocomplete';
import { storagePrefix } from '../row-filter';
import { setQueryArgument, getQueryArgument, removeQueryArgument } from '../utils';

export type NonK8SListPageProps = {
  namespace?: string;
  title: string;
  displayTitleRow?: boolean;
  items: any[];
  canCreate?: boolean;
  createProps?: { to: string; items: string[] };
  createButtonText?: string;
  textFilter?: string;
  rowFilters?: any;
  multiNavPages?: any;
  multiNavBaseURL?: string;
  helpText?: string;
  badge?: React.ReactNode;
  ListComponent?: React.ComponentType<any>;
  hideToolbar?: boolean;
  hideLabelFilter?: boolean;
  kind?: string;
  kinds?: string[];
  data?: any;
  reducer?: Function;
};
export const NonK8SListPage: React.FC<NonK8SListPageProps> = props => {
  const { namespace, title, displayTitleRow = true, items, canCreate, createProps, createButtonText, textFilter, rowFilters, multiNavPages, multiNavBaseURL, helpText, badge, ListComponent, hideToolbar = false, hideLabelFilter = false, kind, kinds = [kind], reducer } = props;
  const { t } = useTranslation();

  const isNSSelected = namespace;
  let unclickableMsg = !isNSSelected ? t('COMMON:MSG_COMMON_ERROR_MESSAGE_48') : undefined;
  unclickableMsg = window.location.pathname.startsWith('/k8s/cluster/customresourcedefinitions') ? undefined : unclickableMsg;

  const titleClassName = displayTitleRow ? 'co-m-nav-title--row' : 'co-m-nav-title--column';
  let createLink;
  if (canCreate) {
    if (createProps.to) {
      createLink = (
        <Link className="co-m-primary-action" {...createProps}>
          <Button variant="primary" id="yaml-create" isDisabled={!!unclickableMsg}>
            {createButtonText}
          </Button>
        </Link>
      );
    } else {
      createLink = (
        <div className="co-m-primary-action">
          <Button variant="primary" id="yaml-create" {...createProps}>
            {createButtonText}
          </Button>
        </div>
      );
    }
  }
  const buttonComponent = createLink && (
    <div
      className={classNames('co-m-pane__createLink', {
        'co-m-pane__createLink--no-title': !title,
      })}
    >
      {unclickableMsg ? (
        <Tooltip content={unclickableMsg}>
          <div className={classNames('list-page__button-unclickable')}>{createLink}</div>
        </Tooltip>
      ) : (
        <>{createLink}</>
      )}
    </div>
  );
  const data = items ? items : [];
  const [checkedRowFilter, setCheckedRowFilter] = React.useState(getQueryArgument(`rowFilter-${rowFilters[0].type}`));
  const [nameFilterText, setNameFilterText] = React.useState(getQueryArgument('name'));
  const [filteredData, setFilteredData] = React.useState(data);

  React.useEffect(() => {
    setFilteredData(
      data.filter(d => {
        if (nameFilterFunction(d, nameFilterText) && rowFilterFunction(d, checkedRowFilter)) {
          return true;
        }
      }),
    );
  }, [checkedRowFilter, nameFilterText]);
  const nameFilterFunction = (data: any, name: string) => {
    if (!name || name === '') {
      return true;
    } else {
      if (fuzzy(toLower(name), toLower(data.name))) {
        return true;
      } else {
        return false;
      }
    }
  };
  const rowFilterFunction = (data: any, rowFilter: string) => {
    const filterList = rowFilter?.split(',');
    if (!filterList || filterList?.length === 0 || filterList[0] === '') {
      return true;
    } else {
      if (filterList.indexOf(reducer(data)) > -1) {
        return true;
      } else {
        return false;
      }
    }
  };
  const Filter = <FilterToolbar rowFilters={rowFilters} setCheckedRowFilter={setCheckedRowFilter} setNameFilterText={setNameFilterText} textFilter={textFilter} hideToolbar={hideToolbar} hideLabelFilter={hideLabelFilter} kinds={kinds} reducer={reducer} {...props} />;
  //const Filter = <></>;
  //const List = tableProps ? <DefaultListComponent {...props} data={data} /> : <ListComponent data={data} />;

  return (
    <div className="co-m-list">
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <PageHeading title={title} badge={title ? badge : null} className={classNames({ [titleClassName]: createLink })}>
        {multiNavPages ? undefined : <div style={{ marginBottom: displayTitleRow ? 0 : '10px' }}>{buttonComponent}</div>}
        {!title && badge && <div>{badge}</div>}
      </PageHeading>
      {multiNavPages && (
        <div style={{ borderTop: '1px solid #ccc', paddingBottom: '10px' }}>
          <NavBar pages={multiNavPages} baseURL={multiNavBaseURL} basePath={multiNavBaseURL} />
        </div>
      )}
      {multiNavPages && <div style={{ paddingLeft: '30px', paddingBottom: '10px', width: 'fit-content' }}>{buttonComponent}</div>}
      {helpText && <p className="co-m-pane__help-text co-help-text">{helpText}</p>}
      <div className="co-m-pane__body co-m-pane__body--no-top-margin">
        <div>
          {!_.isEmpty(data) && Filter}
          <div className="row">
            <div className="col-xs-12">
              <ListComponent data={filteredData} loaded={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
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
  reducer?: Function;
  setCheckedRowFilter?: Function;
  setNameFilterText?: Function;
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

const FilterToolbar: React.FC<FilterToolbarProps> = props => {
  const { rowFilters = [], data, hideToolbar, hideLabelFilter, textFilter = filterTypeMap[FilterType.NAME], setCheckedRowFilter, setNameFilterText } = props;
  const { t } = useTranslation();
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

  // {id: 'a' , title: 'A'} => filterNameMap['a'] = A
  const filtersNameMap: FilterKeys = rowFilters.reduce((acc, curr) => {
    const rowItems = curr.itemsGenerator ? curr.itemsGenerator(props, props?.kinds) : curr.items;
    const items = rowItems.reduce((itemAcc, itemCurr) => {
      itemAcc[itemCurr.id] = itemCurr.title;
      return itemAcc;
    }, {});
    return { ...acc, ...items };
  }, {});

  const updateLabelFilter = (filterValues: string[]) => {
    if (filterValues.length > 0) {
      setQueryArgument('label', filterValues.join(','));
    } else {
      removeQueryArgument('label');
    }
    setInputText('');
    // applyFilter(filterValues, FilterType.LABEL);
  };

  const updateNameFilter = (filterValue: string) => {
    if (!_.isEmpty(filterValue)) {
      setQueryArgument(textFilter, filterValue);
    } else {
      removeQueryArgument(textFilter);
    }
    setInputText(filterValue);
    setNameFilterText(filterValue);
    // applyFilter(filterValue, FilterType.NAME);
  };

  const updateExternalNameFilter = (filterValue: string) => {
    if (!_.isEmpty(filterValue)) {
      setQueryArgument(filterTypeMap[FilterType.EXTERNAL_NAME], filterValue);
    } else {
      removeQueryArgument(filterTypeMap[FilterType.EXTERNAL_NAME]);
    }
    setInputText(filterValue);
    // applyFilter(filterValue, FilterType.EXTERNAL_NAME);
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

  const clearAll = () => {
    updateRowFilterSelected(selectedRowFilters);
    updateNameFilter('');
    updateLabelFilter([]);
    updateExternalNameFilter('');
  };
  const clearAllRowFilter = (f: string) => {
    updateRowFilterSelected(_.intersection(filters[f], selectedRowFilters));
  };

  const updateRowFilterSelected = (id: string[]) => {
    const selectedNew = _.xor(selectedRowFilters, id);
    // applyRowFilter(selectedNew);
    setQueryParameters(selectedNew);
    setCheckedRowFilter(selectedNew.join());
    setOpen(false);
  };

  // const applyFilter = (input: string | string[], type: FilterType) => {
  //     const filter = filterTypeMap[type];
  //     const value = type === FilterType.LABEL ? { all: input } : input;
  //     //props.reduxIDs.forEach(id => props.filterList(id, filter, value));
  // };

  // const applyRowFilter = (selected: string[]) => {
  //     rowFilters.forEach(filter => {
  //         const rowItems = filter.itemsGenerator ? filter.itemsGenerator(props, props?.kinds) : filter.items;
  //         const all = _.map(rowItems, 'id');
  //         const recognized = _.intersection(selected, all);
  //         //(props.reduxIDs || []).forEach(id => props.filterList(id, filter.type, { selected: new Set(recognized), all }));
  //     });
  //     // updateNameFilter(inputText);
  // };

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
  const searchFilterTitle = {
    //[FilterType.LABEL]: t('COMMON:MSG_COMMON_SEARCH_FILTER_2'),
    [FilterType.NAME]: t('COMMON:MSG_COMMON_SEARCH_FILTER_1'),
  };
  const placeHolders = {
    //[FilterType.LABEL]: 'app=frontend',
    [FilterType.NAME]: t('COMMON:MSG_COMMON_SEARCH_PLACEHOLDER_1'),
    [FilterType.EXTERNAL_NAME]: t('COMMON:MSG_COMMON_SEARCH_PLACEHOLDER_3'),
  };

  const onRowFilterSelect = event => {
    event.preventDefault();
    updateRowFilterSelected([event?.target?.id]);
  };

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

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
import { getQueryArgument } from '../utils';
import { FilterToolbar } from '../filter-toolbar';
import { DefaultListComponent } from '../hypercloud/utils/default-list-component';

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
  kind?: string;
  kinds?: string[];
  data?: any;
  reducer?: Function;
  clusterScope?: boolean;
  tableProps?: any
};
export const NonK8SListPage: React.FC<NonK8SListPageProps> = props => {
  const { namespace, title, displayTitleRow = true, items, clusterScope, canCreate, createProps, createButtonText, textFilter, rowFilters, multiNavPages, multiNavBaseURL, helpText, badge, ListComponent, hideToolbar = false, kind, kinds = [kind], reducer, tableProps } = props;
  const { t } = useTranslation();

  const isNSSelected = clusterScope || namespace;
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
  const [checkedRowFilter, setCheckedRowFilter] = React.useState(getQueryArgument(rowFilters ? `rowFilter-${rowFilters[0].type}` : ''));
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
  }, [data, checkedRowFilter, nameFilterText]);
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
  const Filter = <FilterToolbar rowFilters={rowFilters} setCheckedRowFilter={setCheckedRowFilter} setNameFilterText={setNameFilterText} textFilter={textFilter} hideToolbar={hideToolbar} hideLabelFilter={true} kinds={kinds} {...props} />;
  const List = tableProps ? <DefaultListComponent tableProps={tableProps} data={filteredData} loaded={true} /> : <ListComponent data={filteredData} loaded={true} />;

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
              {List}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

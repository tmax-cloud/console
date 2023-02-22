import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as fuzzy from 'fuzzysearch';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip, Button, TextInput } from '@patternfly/react-core';

import { withFallback } from '@console/shared/src/components/error/error-boundary';
import { useDocumentListener, KEYBOARD_SHORTCUTS } from '@console/shared';
import { filterList } from '../../actions/k8s';
import { storagePrefix } from '../row-filter';
import { ErrorPage404, ErrorBoundaryFallback } from '../error';
import { k8sList, kindForReference, referenceForModel } from '../../module/k8s';
import { CrdNotFound, Dropdown, Firehose, history, inject, kindObj, makeQuery, makeReduxID, LoadingBox, PageHeading, RequireCreatePermission } from '../utils';
import { FilterToolbar } from '../filter-toolbar';
import { ResourceLabel, ResourceLabelPlural } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import './list-page.scss';
import { NavBar } from '../utils/horizontal-nav';
import { DefaultListComponent } from '../hypercloud/utils/default-list-component';
import { getQueryArgument } from '../utils';
import { CustomResourceDefinitionModel } from '../../models';
import { isResourceSchemaBasedMenu, isResourceSchemaBasedOrCreateMenu } from '../hypercloud/form';

/** @type {React.SFC<{disabled?: boolean, label?: string, onChange: (value: string) => void;, defaultValue?: string, value?: string, placeholder?: string, autoFocus?: boolean, onFocus?:any, name?:string, id?: string, onKeyDown?: any, parentClassName?: string }}>} */
export const TextFilter = props => {
  const { label, className, placeholder = `${label}...`, autoFocus = false, parentClassName } = props;
  const { ref } = useDocumentListener();

  return (
    <div className={classNames('has-feedback', parentClassName)}>
      <TextInput {...props} className={classNames('co-text-filter', className)} data-test-id="item-filter" aria-label={placeholder} placeholder={placeholder} ref={ref} autoFocus={autoFocus} tabIndex={0} type="text" />
      <span className="form-control-feedback form-control-feedback--keyboard-hint">
        <kbd>{KEYBOARD_SHORTCUTS.focusFilterInput}</kbd>
      </span>
    </div>
  );
};
TextFilter.displayName = 'TextFilter';

// TODO (jon) make this into "withListPageFilters" HOC
/** @type {React.SFC<{ListComponent?: React.ComponentType<any>, kinds: string[], filters?:any, flatten?: function, data?: any[], rowFilters?: any[], hideToolbar?: boolean, hideLabelFilter?: boolean, tableProps?: any, items?: any[], startDate?: Date, endDate?: Date }>} */
export const ListPageWrapper_ = props => {
  const { flatten, ListComponent, reduxIDs, rowFilters, textFilter, hideToolbar, hideLabelFilter, tableProps, items, startDate, endDate } = props;
  let data = flatten ? flatten(props.resources) : [];
  if (startDate && endDate) {
    data = data.filter(d => startDate <= new Date(d.metadata?.creationTimestamp) && new Date(d.metadata?.creationTimestamp) <= endDate);
  }
  // const Filter = <FilterToolbar rowFilters={rowFilters} data={data} reduxIDs={reduxIDs} textFilter={textFilter} hideToolbar={hideToolbar} hideLabelFilter={hideLabelFilter} defaultSelectedItems={['Awaiting']} {...this.props} />;
  const Filter = <FilterToolbar rowFilters={rowFilters} data={data} reduxIDs={reduxIDs} textFilter={textFilter} hideToolbar={hideToolbar} hideLabelFilter={hideLabelFilter} {...props} />;
  const List = tableProps ? <DefaultListComponent {...props} data={data} /> : <ListComponent {...props} data={data} />;
  return (
    <div>
      {!_.isEmpty(data) && Filter}
      <div className="row">
        <div className="col-xs-12">{List}</div>
      </div>
    </div>
  );
};

ListPageWrapper_.displayName = 'ListPageWrapper_';
ListPageWrapper_.propTypes = {
  setShowSidebar: PropTypes.any,
  setSidebarDetails: PropTypes.any,
  setSidebarTitle: PropTypes.any,
  data: PropTypes.array,
  kinds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
  ListComponent: PropTypes.elementType,
  rowFilters: PropTypes.array,
  staticFilters: PropTypes.array,
  customData: PropTypes.any,
  hideToolbar: PropTypes.bool,
  hideLabelFilter: PropTypes.bool,
  tableProps: PropTypes.any,
};

const mapStateToProps = state => ({
  k8s: state.k8s,
});

/** @type {React.FC<<WrappedComponent>, {canCreate?: Boolean, textFilter:string, createAccessReview?: Object, createButtonText?: String, createProps?: Object, fieldSelector?: String, filterLabel?: String, resources: any, badge?: React.ReactNode, unclickableMsg?: String, multiNavBaseURL?: String}> }*/
export const FireMan_ = connect(mapStateToProps, { filterList })(
  class ConnectedFireMan extends React.PureComponent {
    constructor(props) {
      super(props);
      this.onExpandChange = this.onExpandChange.bind(this);
      this.applyFilter = this.applyFilter.bind(this);

      const reduxIDs = props.resources.map(r => makeReduxID(kindObj(r.kind), makeQuery(r.namespace, r.selector, r.fieldSelector, r.name)));
      this.state = { reduxIDs, modelExists: true, kindsInFlight: false };
    }

    UNSAFE_componentWillReceiveProps({ resources }) {
      const reduxIDs = resources.map(r => makeReduxID(kindObj(r.kind), makeQuery(r.namespace, r.selector, r.fieldSelector, r.name)));
      if (_.isEqual(reduxIDs, this.state.reduxIDs)) {
        return;
      }

      // reapply filters to the new list...
      // TODO (kans): we probably just need to be able to create new lists with filters already applied
      this.setState({ reduxIDs }, () => this.UNSAFE_componentWillMount());
    }

    onExpandChange(expand) {
      this.setState({ expand });
    }

    updateURL(filterName, options) {
      if (filterName !== this.props.textFilter) {
        // TODO (ggreer): support complex filters (objects, not just strings)
        return;
      }
      const params = new URLSearchParams(window.location.search);
      if (options) {
        params.set(filterName, options);
      } else {
        params.delete(filterName);
      }
      const url = new URL(window.location);
      history.replace(`${url.pathname}?${params.toString()}${url.hash}`);
    }

    applyFilter(filterName, options) {
      // TODO: (ggreer) lame blacklist of query args. Use a whitelist based on resource filters
      if (['q', 'kind', 'orderBy', 'sortBy'].includes(filterName)) {
        return;
      }
      if (filterName.indexOf(storagePrefix) === 0) {
        return;
      }
      this.state.reduxIDs.forEach(id => this.props.filterList(id, filterName, options));
      this.updateURL(filterName, options);
    }

    updateModelExists() {
      const modelExists = _.map(this.props.resources).every(resource => {
        if (resource.nonK8SResource) {
          return !!resource.kindObj;
        }
        const { kind } = resource;
        return (!_.isEmpty(kind) ? this.props.k8s.getIn(['RESOURCES', 'models', kind]) || this.props.k8s.getIn(['RESOURCES', 'models', kindForReference(kind)]) : null);
      });
      const kindsInFlight = this.props.k8s.getIn(['RESOURCES', 'inFlight']);
      this.setState({ modelExists, kindsInFlight });
    }

    UNSAFE_componentWillMount() {
      const params = new URLSearchParams(window.location.search);
      this.defaultValue = params.get(this.props.textFilter);
      params.forEach((v, k) => this.applyFilter(k, v));
    }

    componentDidMount() {
      this.updateModelExists();
    }

    componentDidUpdate(prevProps) {
      if (!_.isEqual(this.props.k8s, prevProps.k8s)) {
        this.updateModelExists();
      }
    }

    runOrNavigate = itemName => {
      const { createProps = {} } = this.props;
      const action = _.isFunction(createProps.action) && createProps.action(itemName);
      if (action) {
        action();
      } else if (_.isFunction(createProps.createLink)) {
        history.push(createProps.createLink(itemName));
      }
    };

    render() {
      const { canCreate, createAccessReview, createButtonText, createProps = {}, helpText, resources, badge, title, displayTitleRow, unclickableMsg, multiNavPages, baseURL, basePath } = this.props;

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
        } else if (createProps.items) {
          createLink = (
            <div className="co-m-primary-action">
              <Dropdown buttonClassName="pf-m-primary" id="item-create" menuClassName={classNames({ 'pf-m-align-right-on-md': title })} title={createButtonText} noSelection items={createProps.items} onChange={this.runOrNavigate} />
            </div>
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
        // if (!_.isEmpty(createAccessReview)) {
        //   createLink = (
        //     <RequireCreatePermission
        //       model={createAccessReview.model}
        //       namespace={createAccessReview.namespace}
        //     >
        //       {createLink}
        //     </RequireCreatePermission>
        //   );
        // }
      }

      // CRD가 없을 경우 생성 버튼 감춤
      const buttonComponent = createLink && this.state.modelExists && (
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

      const titleClassName = displayTitleRow ? 'co-m-nav-title--row' : 'co-m-nav-title--column';

      return (
        <>
          {/* Badge rendered from PageHeading only when title is present */}

          <PageHeading title={title} badge={title ? badge : null} className={classNames({ [titleClassName]: createLink })}>
            {multiNavPages ? undefined : <div style={{ marginBottom: displayTitleRow ? 0 : '10px' }}>{buttonComponent}</div>}
            {!title && badge && <div>{badge}</div>}
          </PageHeading>

          {multiNavPages && (
            <div style={{ borderTop: '1px solid #ccc', paddingBottom: '10px' }}>
              <NavBar pages={multiNavPages} baseURL={baseURL} basePath={baseURL} />
            </div>
          )}
          {multiNavPages && <div style={{ paddingLeft: '30px', paddingBottom: '10px', width: 'fit-content' }}>{buttonComponent}</div>}
          {this.state.kindsInFlight ? (
            <LoadingBox />
          ) : this.state.modelExists ? (
            <>
              {helpText && <p className="co-m-pane__help-text co-help-text">{helpText}</p>}
              <div className="co-m-pane__body co-m-pane__body--no-top-margin">
                {inject(this.props.children, {
                  resources,
                  expand: this.state.expand,
                  reduxIDs: this.state.reduxIDs,
                  applyFilter: this.applyFilter,
                })}
              </div>
            </>
          ) : (
            <CrdNotFound />
          )}
        </>
      );
    }
  },
);

FireMan_.displayName = 'FireMan';

FireMan_.defaultProps = {
  textFilter: 'name',
};

FireMan_.propTypes = {
  canCreate: PropTypes.bool,
  createAccessReview: PropTypes.object,
  createButtonText: PropTypes.string,
  createProps: PropTypes.object,
  fieldSelector: PropTypes.string,
  filterLabel: PropTypes.string,
  helpText: PropTypes.any,
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      fieldSelector: PropTypes.string,
      filters: PropTypes.object,
      isList: PropTypes.bool,
      kind: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      name: PropTypes.string,
      namespace: PropTypes.string,
      namespaced: PropTypes.bool,
      selector: PropTypes.shape({
        matchLabels: PropTypes.objectOf(PropTypes.string),
        matchExpressions: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  ).isRequired,
  selectorFilterLabel: PropTypes.string,
  textFilter: PropTypes.string,
  title: PropTypes.string,
  displayTitleRow: PropTypes.bool,
};

/** @type {React.SFC<{ListComponent?: React.ComponentType<any>, kind: string, helpText?: any, namespace?: string, filterLabel?: string, textFilter?: string, title?: string, showTitle?: boolean, displayTitleRow?: boolean, rowFilters?: any[], selector?: any, fieldSelector?: string, canCreate?: boolean, createButtonText?: string, createProps?: any, mock?: boolean, badge?: React.ReactNode, createHandler?: any, hideToolbar?: boolean, hideLabelFilter?: boolean, customData?: any, setSidebarDetails?:any, setShowSidebar?:any, setSidebarTitle?: any, multiNavPages?: any, isClusterScope?: boolean, defaultSelectedRows?: string[], tableProps?: any, items?: any[], isK8sResource?: boolean, startDate?: Date, endDate?: Date} >} */
export const ListPage = withFallback(props => {
  const { autoFocus, canCreate, createButtonText, createHandler, customData, fieldSelector, filterLabel, filters, helpText, kind, limit, ListComponent, mock, name, nameFilter, namespace, selector, showTitle = true, displayTitleRow, skipAccessReview, textFilter, match, badge, hideToolbar, hideLabelFilter, setSidebarDetails, setShowSidebar, setSidebarTitle, multiNavPages, isClusterScope, defaultSelectedRows, tableProps, items, isK8sResource = true, startDate, endDate } = props;
  let { createProps } = props;
  const { t } = useTranslation();
  const ko = isK8sResource ? kindObj(kind) : customData.kindObj;
  const { namespaced, plural, nonK8SResource } = ko;
  const label = isK8sResource ? ResourceLabel(ko, t) : t(ko.i18nInfo?.label);
  const labelPlural = isK8sResource ? ResourceLabelPlural(ko, t) : t(ko.i18nInfo?.labelPlural);
  const title = props.title || labelPlural;
  const usedNamespace = !namespace && namespaced ? _.get(match, 'params.ns') : namespace;
  const helmRepo = customData?.helmRepo ? customData.helmRepo : null;
  const sas = customData?.sas ? customData.sas : null;

  let href = namespaced ? `/k8s/ns/${usedNamespace || 'default'}/${plural}/~new` : `/k8s/cluster/${plural}/~new`;
  if (ko.crd) {
    try {
      const ref = referenceForModel(ko);
      href = namespaced ? `/k8s/ns/${usedNamespace || 'default'}/customresourcedefinitions/${ref}/~new` : `/k8s/cluster/customresourcedefinitions/${ref}/~new`;
    } catch (unused) {
      /**/
    }
  }

  let multiNavBaseURL;
  if (namespaced) {
    if (usedNamespace) {
      multiNavBaseURL = `/k8s/ns/${usedNamespace}`;
    } else {
      multiNavBaseURL = `/k8s/all-namespaces`;
    }
  } else {
    multiNavBaseURL = `/k8s/cluster`;
  }

  if (ko.crd) {
    try {
      const ref = referenceForModel(ko);
      multiNavBaseURL = `${multiNavBaseURL}/customresourcedefinitions`;
    } catch (unused) {
      /**/
    }
  }

  createProps = createProps || (createHandler ? { onClick: createHandler } : { to: href });

  const createAccessReview = skipAccessReview ? null : { model: ko, namespace: usedNamespace };
  const resources = [
    {
      fieldSelector,
      filters,
      kind,
      limit,
      name: name || nameFilter,
      namespaced,
      selector,
      kindObj: ko,
      nonK8SResource,
      helmRepo,
      sas,
    },
  ];

  // Don't show row filters if props.filters were passed. The content is already filtered and the row filters will have incorrect counts.
  const rowFilters = _.isEmpty(filters) ? props.rowFilters : undefined;

  if (!namespaced && usedNamespace) {
    return <ErrorPage404 />;
  }

  return (
    <MultiListPage
      autoFocus={autoFocus}
      canCreate={canCreate}
      createAccessReview={createAccessReview}
      createButtonText={createButtonText || t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: label })}
      createProps={createProps}
      customData={customData}
      filterLabel={filterLabel || 'by name'}
      flatten={_resources => _.get(_resources, name || kind, {}).data}
      helpText={helpText}
      label={labelPlural}
      ListComponent={ListComponent}
      setShowSidebar={setShowSidebar}
      setSidebarDetails={setSidebarDetails}
      setSidebarTitle={setSidebarTitle}
      mock={mock}
      namespace={usedNamespace}
      resources={resources}
      rowFilters={rowFilters}
      selectorFilterLabel="Filter by selector (app=nginx) ..."
      showTitle={showTitle}
      displayTitleRow={displayTitleRow}
      textFilter={textFilter}
      title={title}
      badge={badge}
      hideToolbar={hideToolbar}
      hideLabelFilter={hideLabelFilter}
      multiNavPages={multiNavPages}
      multiNavBaseURL={multiNavBaseURL}
      isClusterScope={isClusterScope}
      defaultSelectedRows={defaultSelectedRows}
      tableProps={tableProps}
      items={items}
      startDate={startDate}
      endDate={endDate}
    />
  );
}, ErrorBoundaryFallback);

ListPage.displayName = 'ListPage';

/** @type {React.SFC<{canCreate?: boolean, createButtonText?: string, createProps?: any, createAccessReview?: Object, flatten?: Function, title?: string, label?: string, hideTextFilter?: boolean, showTitle?: boolean, displayTitleRow?: boolean, helpText?: any, filterLabel?: string, textFilter?: string, rowFilters?: any[], resources: any[], ListComponent?: React.ComponentType<any>, namespace?: string, customData?: any, badge?: React.ReactNode, hideToolbar?: boolean, hideLabelFilter?: boolean setSidebarDetails?:any setShowSidebar?:any setSidebarTitle?: any, multiNavPages?: any, multiNavBaseURL?: string, isClusterScope?: boolean, defaultSelectedRows?: string[], tableProps?: any, items?: any[], startDate?: Date, endDate?: Date} >} */
export const MultiListPage = props => {
  const { autoFocus, canCreate, createAccessReview, createButtonText, createProps, filterLabel, flatten, helpText, label, ListComponent, setSidebarDetails, setShowSidebar, setSidebarTitle, mock, namespace, rowFilters, showTitle = true, displayTitleRow = true, staticFilters, textFilter, title, customData, badge, hideToolbar, hideLabelFilter, multiNavPages, multiNavBaseURL, isClusterScope, defaultSelectedRows, tableProps, items, startDate, endDate } = props;
  const [createPropsState, setCreatePropsState] = React.useState(createProps);
  const { t } = useTranslation();
  let href = '';
  const isNSSelected = !props.resources?.[0]?.namespaced || namespace;
  let unclickableMsg = !isNSSelected && !isClusterScope ? t('COMMON:MSG_COMMON_ERROR_MESSAGE_48') : undefined;
  unclickableMsg = window.location.pathname.startsWith('/k8s/cluster/customresourcedefinitions') ? undefined : unclickableMsg;
  const resources = _.map(props.resources, r => ({
    ...r,
    isList: r.isList !== undefined ? r.isList : true,
    namespace: r.namespaced ? namespace : r.namespace,
    prop: r.prop || r.kind,
  }));
  const kind = props?.resources[0]?.kindObj?.kind || props?.resources[0]?.kind;
  const isCustomResourceType = !isResourceSchemaBasedOrCreateMenu(kind);
  React.useEffect(() => {
    setCreatePropsState(createProps);
  }, [createProps]);
  React.useEffect(() => {
    isCustomResourceType &&
      k8sList(CustomResourceDefinitionModel).then(res => {
        _.find(res, function(data) {
          return data.spec.names.kind === kind;
        }) ||
          ((href = namespace ? `/k8s/ns/${namespace}/import` : `/k8s/all-namespaces/import`) && setCreatePropsState({ to: href }));
      });
  }, []);

  const listPageWrapper = (
    <ListPageWrapper_
      flatten={flatten}
      kinds={_.map(resources, 'kind')}
      label={label}
      ListComponent={ListComponent}
      setSidebarDetails={setSidebarDetails}
      setShowSidebar={setShowSidebar}
      setSidebarTitle={setSidebarTitle}
      textFilter={textFilter}
      rowFilters={rowFilters}
      staticFilters={staticFilters}
      customData={customData}
      hideToolbar={hideToolbar}
      hideLabelFilter={hideLabelFilter}
      defaultSelectedRows={defaultSelectedRows}
      tableProps={tableProps}
      items={items}
      startDate={startDate}
      endDate={endDate}
    />
  );

  return (
    <FireMan_
      autoFocus={autoFocus}
      canCreate={canCreate}
      createAccessReview={createAccessReview}
      createButtonText={createButtonText || 'Create'}
      createProps={createPropsState}
      filterLabel={filterLabel || 'by name'}
      helpText={helpText}
      resources={mock ? [] : resources}
      selectorFilterLabel="Filter by selector (app=nginx) ..."
      textFilter={textFilter}
      title={showTitle ? title : undefined}
      displayTitleRow={displayTitleRow}
      badge={badge}
      unclickableMsg={unclickableMsg}
      multiNavPages={multiNavPages}
      baseURL={multiNavBaseURL}
    >
      <Firehose resources={mock ? [] : resources}>{listPageWrapper}</Firehose>
    </FireMan_>
  );
};

MultiListPage.displayName = 'MultiListPage';

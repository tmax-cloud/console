import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import { Helmet } from 'react-helmet';
import * as classNames from 'classnames';
import ReactPaginate from 'react-paginate';
import * as PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TextFilter } from '../factory';
import { Dropdown, Box, Timestamp, PageHeading } from '../utils';
import { coFetchJSON, coFetch } from '../../co-fetch';
import { getId, getUserGroup } from '../../hypercloud/auth';
import { setQueryArgument, getQueryArgument, removeQueryArgument } from '../utils/router.ts';
import { k8sGet } from '@console/internal/module/k8s';
import { withTranslation } from 'react-i18next';

// TODO: date picker 빼기 - 리뷰 후 결정

const Resources = {
  all: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_RESOURCEFILTER_1',
    value: 'all',
  },
  users: {
    label: 'users',
    value: 'users',
  },
};

const Actions = {
  all: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_1',
    value: 'all',
  },
  create: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_2',
    value: 'create',
  },
  delete: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_3',
    value: 'delete',
  },
  login: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_4',
    value: 'LOGIN',
  },
  logout: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_5',
    value: 'LOGOUT',
  },
  patch: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_6',
    value: 'patch',
  },
  update: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_7',
    value: 'update',
  },
  login_error: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_ACTIONFILTER_8',
    value: 'LOGIN_ERROR',
  },
};

const Statuses = {
  all: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_STATUSFILTER_1',
    value: 'all',
  },
  success: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_STATUSFILTER_2',
    value: 'Success',
  },
  failure: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_STATUSFILTER_3',
    value: 'Failure',
  },
};

const Codes = {
  all: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_CODEFILTER_1',
    value: 'all',
  },
  100: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_CODEFILTER_2',
    value: '100',
  },
  200: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_CODEFILTER_3',
    value: '200',
  },
  300: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_CODEFILTER_4',
    value: '300',
  },
  400: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_CODEFILTER_5',
    value: '400',
  },
  500: {
    label: 'SINGLE:MSG_AUDITLOGS_MAIN_CODEFILTER_6',
    value: '500',
  },
};

class Inner extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      angle: 'down',
    };
  }

  onClickDetail() {
    this.state.angle === 'down' ? this.setState({ angle: 'up' }) : this.setState({ angle: 'down' });
  }

  render() {
    const { klass, status, verb, objectRef, user, stageTimestamp, responseStatus } = this.props;
    let timestamp = Date.parse(stageTimestamp);
    timestamp -= 9 * 60 * 60 * 1000;
    timestamp = new Date(timestamp).toISOString();

    return (
      <div className={`${klass} slide-${status}`} style={{ height: 'fit-content' }}>
        <div className="co-sysevent__icon-box">
          <i className="co-sysevent-icon" style={{ top: '33px' }} />
          <div className="co-sysevent__icon-line" style={{ top: '33px' }}></div>
        </div>
        <div className="co-sysevent__box">
          <div className="co-sysevent__header">
            <div className="co-sysevent__subheader">
              {objectRef.Resource} ({objectRef.Name})
              <Timestamp timestamp={timestamp} />
            </div>
            <div
              className={classNames('co-sysevent__details', {
                'co-sysevent__details__alignRight': !user.username,
              })}
            >
              {user.username}
            </div>
          </div>
          <div className="co-sysevent__message" style={{ margin: '0', height: 'fit-content' }}>
            {verb}, {verb} {responseStatus.status} with status code : {responseStatus.code}
            {this.state.angle === 'up' && <p style={{ margin: '0' }}>{responseStatus.message}</p>}
          </div>
        </div>
      </div>
    );
  }
}

const timeout = { enter: 150 };

class SysEvent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { Verb, ObjectRef, User, ResponseStatus, StageTimestamp } = this.props;
    const klass = classNames('co-sysevent', { 'co-sysevent--error': this.props.ResponseStatus.code === 400 || this.props.ResponseStatus.code === 500 || this.props.ResponseStatus.status === 'Failure' });
    // console.log(this.props);
    const style = {
      height: 110,
      left: 0,
      position: 'absolute',
      top: this.props.index * 110,
      width: '100%',
    };

    return (
      <div style={style}>
        <CSSTransition mountOnEnter={true} appear={true} in exit={false} timeout={timeout} classNames="slide">
          {status => <Inner klass={klass} status={status} verb={Verb} objectRef={ObjectRef} responseStatus={ResponseStatus} user={User} stageTimestamp={StageTimestamp} width={style.width} />}
        </CSSTransition>
      </div>
    );
  }
}

class AuditPage_ extends React.Component {
  constructor(props) {
    super(props);
    let date = new Date();
    date.setDate(date.getDate() - 7);
    const { t } = props;

    this.codeList = Object.values(Codes);
    this.statuslist = Object.values(Statuses);
    this.resourcelist = [Resources.all];

    this.state = {
      namespace: '',
      isResourceLoaded: false,
      actionList: [Actions.all],
      resourceType: Resources.all,
      action: Actions.all,
      status: Statuses.all,
      code: Codes.all,
      textFilter: '',
      data: [],
      start: date,
      end: new Date(),
      offset: 0,
      pages: 0,
      paginationPos: '215px',
    };

    this.getResourceList = this.getResourceList.bind(this);
    this.onChangeResourceType = e => this.onChangeResourceType_(e);
    this.onChangeAction = e => this.onChangeAction_(e);
    this.onChangeStatus = e => this.onChangeStatus_(e);
    this.onChangeCode = e => this.onChangeCode_(e);
    this.onChangeStartDate = e => this.onChangeStartDate_(e);
    this.onChangeEndDate = e => this.onChangeEndDate_(e);
    this.onChangePage = e => this.onChangePage_(e);
    this.onSearch = e => this.onSearch_(e);
  }

  makeQuery(uri, queryName, queryValue) {
    let _uri = uri;
    const condition = queryName === 'namespace' ? undefined : 'all';
    if (queryValue !== condition) {
      _uri += `&${queryName}=${queryValue}`;
    }
    return _uri;
  }

  makeSearchQuery(uri) {
    let _uri = uri;
    const search = getQueryArgument('user');
    if (search) {
      _uri += `&search=${search}`;
    }
    return _uri;
  }

  makeUri(uri, ...queries) {
    let _uri = this.makeSearchQuery(uri);
    for (let i = 0; i < queries.length - 1; i += 2) {
      _uri = this.makeQuery(_uri, queries[i], queries[i + 1]);
    }
    return _uri;
  }

  fetch(uri) {
    coFetchJSON(uri)
      .then(response => {
        this.setState({
          data: response.eventList.Items,
          pages: Math.ceil(response.rowsCount / 100),
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  async getResourceList() {
    await coFetch('/api/webhook/audit/resources')
      .then(res => res.json())
      .then(res => {
        const _resourcelist = res.sort().map(cur => {
          return { label: cur, value: cur };
        });
        this.resourcelist = [...this.resourcelist, ..._resourcelist];
      })
      .catch(function(myJson) {
        console.error(myJson);
      });
  }

  onChangeResourceType_(resource) {
    this.setState({ resourceType: resource !== Resources.all.value ? this.resourcelist.find(item => resource === item.value) : Resources.all });
    this.setState({ offset: 0 });

    // 리소스 타입 선택에 따라 액션 드롭다운 항목 설정
    if (resource === Resources.all.value) {
      this.setState({
        actionList: [Actions.all],
      });
    } else if (resource === Resources.users.value) {
      this.setState({
        actionList: [Actions.all, Actions.create, Actions.delete, Actions.patch, Actions.update, Actions.login, Actions.logout, Actions.login_error],
      });
    } else {
      this.setState({
        actionList: [Actions.all, Actions.create, Actions.delete, Actions.patch, Actions.update],
      });
    }
    this.setState({ action: Actions.all }); // 액션 초기화
    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeUri(uri, 'resource', resource, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', Actions.all.value, 'code', this.state.code.value);
    this.fetch(uri);
  }

  onChangeAction_(action) {
    this.setState({ action: action !== Actions.all.value ? this.state.actionList.find(item => action === item.value) : Actions.all });
    this.setState({ offset: 0 });
    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', action, 'code', this.state.code.value);
    this.fetch(uri);
  }

  onChangeStatus_(status) {
    this.setState({ status: status !== Statuses.all.value ? this.statuslist.find(item => status === item.value) : Statuses.all });
    this.setState({ offset: 0 });
    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', status, 'verb', this.state.action.value, 'code', this.state.code.value);
    this.fetch(uri);
  }

  onChangeCode_(code) {
    this.setState({ code: code !== Codes.all.value ? this.codeList.find(item => code === item.value) : Codes.all });
    this.setState({ offset: 0 });
    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', this.state.action.value, 'code', code);
    this.fetch(uri);
  }

  onChangeStartDate_(value) {
    let date = new Date(value);
    let date_ = new Date(value);
    this.setState({
      start: date,
    });

    this.setState({ offset: 0 });

    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${date.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;

    date_.setDate(date_.getDate() + 7);
    if (date_ < this.state.end || date > this.state.end) {
      this.setState({
        end: date_,
      });
      uri += `&endTime=${date_.getTime() / 1000}`;
    } else {
      uri += `&endTime=${this.state.end.getTime() / 1000}`;
    }
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', this.state.action.value, 'code', this.state.code.value);
    this.fetch(uri);
  }

  onChangeEndDate_(value) {
    let date = new Date(value);
    let date_ = new Date(value);
    this.setState({
      end: date,
    });

    this.setState({ offset: 0 });

    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&endTime=${date.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;

    date_.setDate(date_.getDate() - 7);
    if (date_ <= this.state.start) {
      uri += `&startTime=${this.state.start.getTime() / 1000}`;
    } else {
      this.setState({
        start: date_,
      });
      uri += `&startTime=${date_.getTime() / 1000}`;
    }
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', this.state.action.value, 'code', this.state.code.value);
    this.fetch(uri);
  }

  onChangePage_(e) {
    this.setState({
      offset: e.selected,
      textFilter: '',
    });

    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=${e.selected * 100}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', this.state.action.value, 'code', this.state.code.value);
    this.fetch(uri);
  }

  onSearch_(e) {
    // if (e.key !== 'Enter') {
    //   return;
    // }

    let value = e;

    value ? setQueryArgument('user', value) : removeQueryArgument('user');
    this.setState({
      offset: 0,
    });

    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeUri(uri, 'resource', this.state.resourceType.value, 'namespace', this.state.namespace, 'status', this.state.status.value, 'verb', this.state.action.value, 'code', this.state.code.value);

    coFetchJSON(uri).then(response => {
      this.setState({
        data:
          response.eventList?.Items?.filter(cur => {
            if (cur.User.username.indexOf(value) >= 0) {
              return true;
            } else {
              return false;
            }
          }) ?? [],
        pages: Math.ceil(response.rowsCount / 100),
      });
    });
  }

  async componentDidUpdate() {
    const namespace = _.get(this.props, 'match.params.ns');

    if (namespace !== this.state.namespace) {
      this.setState({
        namespace: namespace,
        offset: 0,
        actionList: [Actions.all],
        resourceType: Resources.all,
        action: Actions.all,
        status: Statuses.all,
        code: Codes.all,
      });
      let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=0&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
      uri = this.makeSearchQuery(uri);
      if (namespace === undefined) {
        // all namespace
        this.fetch(uri);
      } else if (namespace === 'default') {
        this.setState({
          data: [],
          pages: 0,
        });
      } else {
        uri += `&namespace=${namespace}`;
        await coFetchJSON(uri).then(response => {
          this.setState({
            data: response.eventList.Items,
            pages: Math.ceil(response.rowsCount / 100),
          });
        });
      }
      this.setState({ isResourceLoaded: true });
    }
  }

  async componentDidMount() {
    const namespace = _.get(this.props, 'match.params.ns');
    await this.getResourceList();
    this.setState({ namespace: namespace });
    let uri = `${document.location.origin}/api/webhook/audit?limit=100&offset=${this.state.offset}&startTime=${this.state.start.getTime() / 1000}&endTime=${this.state.end.getTime() / 1000}&userId=${getId()}${getUserGroup()}`;
    uri = this.makeSearchQuery(uri);
    if (namespace === undefined) {
      // all namespace
      this.fetch(uri);
    } else if (namespace === 'default') {
      this.setState({
        data: [],
        pages: 0,
      });
    } else {
      uri += `&namespace=${namespace}`;
      this.fetch(uri);
    }
    this.setState({ isResourceLoaded: true });
  }
  onIconClick = e => {
    const datePickerElem = e.target.previousElementSibling.firstChild.firstChild;
    datePickerElem.focus();
  };

  makeItems = (items = [], newItems = {}, isResourceItems = false) => {
    if (isResourceItems) {
      items.forEach(item => {
        newItems[item.value] = item.value === Resources.all.value ? t(item.label) : item.label;
      });
    } else {
      items.forEach(item => {
        newItems[item.value] = t(item.label);
      });
    }
    return newItems;
  };

  makeResourceTitle = resource => {
    return resource.value === Resources.all.value ? t(resource.label) : resource.label;
  };

  render() {
    const { t } = this.props;
    const { data, start, end, textFilter, actionList } = this.state;

    return (
      <React.Fragment>
        {this.state.isResourceLoaded ? (
          <div>
            <Helmet>
              <title>{t('COMMON:MSG_LNB_MENU_5')}</title>
            </Helmet>
            <PageHeading detail={true} title={t('COMMON:MSG_LNB_MENU_5')}>
              <div className="co-m-pane__filter-bar" style={{ marginBottom: 0, marginLeft: 0 }}>
                <div className="co-m-pane__filter-bar-group">
                  <Dropdown title={this.makeResourceTitle(this.state.resourceType)} value={this.state.resourceType.value} className="btn-group btn-group-audit" items={this.makeItems(this.resourcelist, {}, true)} onChange={this.onChangeResourceType} />
                  <Dropdown title={t(this.state.action.label)} value={this.state.action.value} className="btn-group" items={this.makeItems(actionList, {})} onChange={this.onChangeAction} />
                  <Dropdown title={t(this.state.status.label)} value={this.state.status.value} className="btn-group" items={this.makeItems(this.statuslist, {})} onChange={this.onChangeStatus} />
                  <Dropdown style={{ marginRight: '30px' }} title={t(this.state.code.label)} value={this.state.code.value} className="btn-group" items={this.makeItems(this.codeList, {})} onChange={this.onChangeCode} />
                  <p style={{ marginRight: '10px', lineHeight: '30px' }}>{t('SINGLE:MSG_AUDITLOGS_MAIN_SEARCHPERIOD_1')}</p>
                  <div className="co-datepicker-wrapper">
                    <DatePicker className="co-datepicker" placeholderText="From" startDate={start} endDate={end} selected={start} onChange={this.onChangeStartDate} />
                    <i className="fa fa-calendar" aria-hidden="true" onClick={this.onIconClick}></i>
                  </div>
                  <p style={{ marginRight: '10px', lineHeight: '30px' }}>{t('SINGLE:MSG_AUDITLOGS_MAIN_SEARCHPERIOD_2')}</p>
                  <div className="co-datepicker-wrapper">
                    <DatePicker className="co-datepicker" placeholderText="To" startDate={start} endDate={end} selected={end} onChange={this.onChangeEndDate} minDate={start} maxDate={new Date()} />
                    <i className="fa fa-calendar" aria-hidden="true" onClick={this.onIconClick}></i>
                  </div>
                </div>
                <div className="co-m-pane__filter-bar-group co-m-pane__filter-bar-group--filter">
                  <TextFilter id="audit" label={t('SINGLE:MSG_AUDITLOGS_MAIN_2')} autoFocus={true} onChange={this.onSearch} />
                </div>
              </div>
            </PageHeading>

            <AuditList {...this.props} textFilter={textFilter} data={data} />
            {data && data.length !== 0 && (
              <div className="pagination-div">
                <ReactPaginate previousLabel={'<'} nextLabel={'>'} breakLabel={'...'} breakClassName={'break-me'} pageCount={this.state.pages} marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={this.onChangePage} containerClassName={'pagination'} subContainerClassName={'pages pagination'} activeClassName={'active'} forcePage={this.state.offset} />
              </div>
            )}
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

const AuditList = withTranslation()(
  class AuditList extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        filteredEvents: [],
        items: [],
      };

      this.rowRenderer = function rowRenderer({ index, style, key }) {
        const event = this.state.filteredEvents[index];
        return <SysEvent {...event} key={key} style={style} index={index} />;
      }.bind(this);
    }

    static filterEvents(messages, { textFilter }) {
      const words = _.uniq(_.toLower(textFilter).match(/\S+/g)).sort((a, b) => {
        // Sort the longest words first.
        return b.length - a.length;
      });

      const textMatches = obj => {
        if (_.isEmpty(words)) {
          return true;
        }
        const message = _.get(obj, 'responseStatus.message', '');
        return _.every(words, word => message.indexOf(word) !== -1);
      };

      const f = obj => {
        if (!textMatches(obj)) {
          return false;
        }
        return true;
      };

      return _.filter(messages, f);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      const { textFilter, filteredEvents, items } = prevState;

      if (textFilter === nextProps.textFilter && filteredEvents === nextProps.data) {
        return {};
      }

      return {
        filteredEvents: AuditList.filterEvents(nextProps.data, nextProps),
        items: AuditList.filterEvents(nextProps.data, nextProps).map((item, index) => <SysEvent {...item} key={index} index={index} />),
        textFilter: nextProps.textFilter,
      };
    }

    // componentDidMount() {
    //   super.componentDidMount();
    // }

    // componentWillUnmount() {
    //   super.componentWillUnmount();
    // }

    render() {
      const { items } = this.state;
      const { t } = this.props;

      let count;
      if (this.state.filteredEvents) {
        count = this.state.filteredEvents.length;
      } else {
        count = 0;
      }
      const noEvents = count === 0;
      let sysEventStatus;
      if (noEvents) {
        sysEventStatus = (
          <Box className="co-sysevent-stream__status-box-empty">
            <div className="text-center cos-status-box__detail">{t('COMMON:MSG_COMMON_NOTIFICATIONS_1')}</div>
          </Box>
        );
      }

      const klass = classNames('co-sysevent-stream__timeline co-sysevent-audit__timeline', {
        'co-sysevent-stream__timeline--empty': !count,
      });

      const len = `${items.length * 110 + 51}px`;
      const timelineLen = `${items.length * 110 - 110}px`;
      return (
        <div className="co-m-pane__body" style={{ border: 'none' }}>
          <div className="co-sysevent-stream co-sysevent-audit" style={{ height: len }}>
            <div className={klass} style={{ marginLeft: 0, height: timelineLen }}></div>
            {items !== undefined && items}
            {sysEventStatus}
          </div>
        </div>
      );
    }
  },
);

AuditList.propTypes = {
  textFilter: PropTypes.string,
};

export const AuditPage = withTranslation()(AuditPage_);

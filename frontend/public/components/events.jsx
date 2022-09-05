import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button, Chip, ChipGroup, ChipGroupToolbarItem } from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';

import { namespaceProptype } from '../propTypes';
import { ResourceListDropdown } from './resource-dropdown';
import { TextFilter } from './factory';
import { apiGroupForReference, isGroupVersionKind, kindForReference, referenceFor, watchURL } from '../module/k8s';
import { withStartGuide } from './start-guide';
import { WSFactory } from '../module/ws-factory';
import { EventModel, NodeModel } from '../models';
import { connectToFlags } from '../reducers/features';
import { FLAGS } from '@console/shared/src/constants';
import { Box, Dropdown, Loading, PageHeading, pluralize, ResourceIcon, ResourceLink, resourcePathFromModel, Timestamp, TogglePlay } from './utils';
import { EventStreamList } from './utils/event-stream';
import { coFetchJSON } from '@console/internal/co-fetch';
import { useTranslation, withTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css'
// import 'react-clock/dist/Clock.css'

const maxMessages = 500;
const flushInterval = 500;

// We have to check different properties depending on whether events were
// created with the core/v1 events API or the new events.k8s.io API.
const getFirstTime = event => event.firstTimestamp || event.eventTime;
export const getLastTime = event => {
  const lastObservedTime = event.series ? event.series.lastObservedTime : null;
  return event.lastTimestamp || lastObservedTime || event.eventTime;
};
export const sortEvents = events => {
  return _.orderBy(events, [getLastTime, getFirstTime, 'name'], ['desc', 'desc', 'asc']);
};

// Predicate function to filter by event "type" (normal, warning, or all)
export const typeFilter = (eventType, event) => {
  if (eventType === 'all') {
    return true;
  }
  const { type = 'normal' } = event;
  return type.toLowerCase() === eventType;
};

const kindFilter = (reference, { involvedObject }) => {
  if (reference === 'all') {
    return true;
  }
  const kinds = reference.split(',');
  return kinds.some(ref => {
    if (!isGroupVersionKind(ref)) {
      return involvedObject.kind === ref;
    }
    // Use `referenceFor` to resolve `apiVersion` when missing from `involvedObject`.
    // We need `apiVersion` to get the group.
    const involvedObjectRef = referenceFor(involvedObject);
    if (!involvedObjectRef) {
      return false;
    }
    // Only check the group and kind, not the API version, so that we catch
    // events for the same resource under a different API version.
    return involvedObject.kind === kindForReference(ref) && apiGroupForReference(involvedObjectRef) === apiGroupForReference(ref);
  });
};

const Inner = connectToFlags(FLAGS.CAN_LIST_NODE)(
  withTranslation()(
    class Inner extends React.PureComponent {
      render() {
        const { event, flags, t } = this.props;
        const { involvedObject: obj, source, message, reason, series } = event;
        const tooltipMsg = `${reason} (${obj.kind})`;
        const isWarning = typeFilter('warning', event);
        const firstTime = getFirstTime(event);
        const lastTime = getLastTime(event);
        const count = series ? series.count : event.count;
        return (
          <div className={classNames('co-sysevent', { 'co-sysevent--warning': isWarning })}>
            <div className="co-sysevent__icon-box">
              <i className="co-sysevent-icon" title={tooltipMsg} />
              <div className="co-sysevent__icon-line" />
            </div>
            <div className="co-sysevent__box" role="gridcell">
              <div className="co-sysevent__header">
                <div className="co-sysevent__subheader">
                  <ResourceLink className="co-sysevent__resourcelink" kind={referenceFor(obj)} namespace={obj.namespace} name={obj.name} />
                  {obj.namespace && <ResourceLink className="co-sysevent__resourcelink hidden-xs" kind="Namespace" name={obj.namespace} />}
                  {lastTime && <Timestamp className="co-sysevent__timestamp" timestamp={lastTime} />}
                </div>
                <div className="co-sysevent__details">
                  {source?.component && (
                    <small className="co-sysevent__source">
                      {t('SINGLE:MSG_EVENTS_MAIN_1', { something: source.component })}
                      {source.component === 'kubelet' && <span> on {flags[FLAGS.CAN_LIST_NODE] ? <Link to={resourcePathFromModel(NodeModel, source.host)}>{source.host}</Link> : <>{source.host}</>}</span>}
                    </small>
                  )}
                  {count > 1 && (
                    <small className="co-sysevent__count text-secondary">
                      {t('COMMON:MSG_DETAILS_TABEVENTS_7', { 0: count })}
                      <Timestamp timestamp={firstTime} simple={true} omitSuffix={true} />
                      {/* {count} times
                      {firstTime && (
                        <>
                          in the last <Timestamp timestamp={firstTime} simple={true} omitSuffix={true} />
                        </>
                      )} */}
                    </small>
                  )}
                </div>
              </div>

              <div className="co-sysevent__message">{message}</div>
            </div>
          </div>
        );
      }
    },
  ),
);

class _EventsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'all',
      textFilter: '',
      selected: new Set(['All']),
      getMethod: 'streaming',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    };
  }

  toggleSelected = selection => {
    if (this.state.selected.has('All') || selection === 'All') {
      this.setState({ selected: new Set([selection]) });
    } else {
      const updateItems = new Set(this.state.selected);
      updateItems.has(selection) ? updateItems.delete(selection) : updateItems.add(selection);
      updateItems.size === 0 ? this.clearSelection() : this.setState({ selected: updateItems });
    }
  };

  clearSelection = () => {
    this.setState({ selected: new Set(['All']) });
  };

  onStartChange = (value) => {
    this.setState({
      start: value,
    });
  };
  onEndChange = (value) => {
    this.setState({
      end: value,
    });
  };

  render() {
    const { type, selected, textFilter, getMethod, start, end } = this.state;
    const { autoFocus = true, t } = this.props;

    const eventTypes = { all: t('SINGLE:MSG_EVENTS_MAIN_TYPES_1'), normal: t('SINGLE:MSG_EVENTS_MAIN_TYPES_2'), warning: t('SINGLE:MSG_EVENTS_MAIN_TYPES_3') };
    const getMethods = { streaming: '실시간', interval: '직접입력' };
    const selectedType = eventTypes[type];
    const selectedGetMethod = getMethods[getMethod];
    return (
      <>
        <PageHeading detail={true} title={this.props.title}>
          <div className="co-search-group">
            <ResourceListDropdown onChange={this.toggleSelected} selected={Array.from(selected)} showAll clearSelection={this.clearSelection} className="co-search-group__resource" />
            <Dropdown className="btn-group co-search-group__resource" items={eventTypes} onChange={v => this.setState({ type: v })} selectedKey={type} title={selectedType} />
            <TextFilter autoFocus={autoFocus} label={t('SINGLE:MSG_EVENTS_MAIN_PLACEHOLDER_1')} onChange={val => this.setState({ textFilter: val || '' })} />
            <div className='co-m-pane__filter-bar-group co-m-pane__filter-bar-group--filter'>
              <Dropdown className="btn-group co-search-group__resource" items={getMethods} onChange={v => this.setState({ getMethod: v })} selectedKey={getMethod} title={selectedGetMethod} />
              <p style={{ marginRight: '10px', lineHeight: '30px' }}>{t('SINGLE:MSG_AUDITLOGS_MAIN_SEARCHPERIOD_1')}</p>
              <div className="co-datepicker-wrapper">
                <DateTimePicker onChange={this.onStartChange} value={start} disabled={getMethod==='streaming'} />
              </div>
              <p style={{ marginRight: '10px', lineHeight: '30px' }}>{t('SINGLE:MSG_AUDITLOGS_MAIN_SEARCHPERIOD_2')}</p>
              <div className="co-datepicker-wrapper">
                <DateTimePicker onChange={this.onEndChange} value={end} disabled={getMethod==='streaming'} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <ChipGroup withToolbar defaultIsOpen={false}>
              <ChipGroupToolbarItem key="resources-category" categoryName={t('COMMON:MSG_COMMON_FILTER_1')}>
                {[...selected].map(chip => (
                  <Chip key={chip} onClick={() => this.toggleSelected(chip)}>
                    <ResourceIcon kind={chip} />
                    {kindForReference(chip)}
                  </Chip>
                ))}
                {selected.size > 0 && (
                  <>
                    <Button variant="plain" aria-label="Close" onClick={this.clearSelection}>
                      <CloseIcon />
                    </Button>
                  </>
                )}
              </ChipGroupToolbarItem>
            </ChipGroup>
          </div>
        </PageHeading>
        <_EventStream {...this.props} key={[...selected].join(',')} type={type} kind={selected.has('All') || selected.size === 0 ? 'all' : [...selected].join(',')} mock={this.props.mock} textFilter={textFilter} start={start} end={end} getMethod={getMethod}/>
      </>
    );
  }
}

export const EventsList = withTranslation()(_EventsList);

export const NoEvents = () => {
  const { t } = useTranslation();
  return (
    <Box className="co-sysevent-stream__status-box-empty">
      <div className="text-center cos-status-box__detail">{t('COMMON:MSG_DETAILS_TABEVENTS_5')}</div>
    </Box>
  );
};

export const NoMatchingEvents = ({ allCount }) => {
  const { t } = useTranslation();
  return (
    <Box className="co-sysevent-stream__status-box-empty">
      <div className="cos-status-box__title">{t('SINGLE:MSG_EVENTS_MAIN_RESULT_2')}</div>
      <div className="text-center cos-status-box__detail">
        {allCount}
        {allCount >= maxMessages && '+'} {t('SINGLE:MSG_EVENTS_MAIN_RESULT_3', { 0: '' })}
      </div>
    </Box>
  );
};

export const ErrorLoadingEvents = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <div className="cos-status-box__title cos-error-title">{t('SINGLE:MSG_EVENTS_MAIN_ERROR_3')}</div>
      <div className="cos-status-box__detail text-center">{t('SINGLE:MSG_EVENTS_MAIN_ERROR_4')}</div>
    </Box>
  );
};

export const EventStreamPage = withStartGuide(({ noProjectsAvailable, ...rest }) => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_6')}</title>
      </Helmet>
      <EventsList {...rest} autoFocus={!noProjectsAvailable} mock={noProjectsAvailable} title={t('COMMON:MSG_LNB_MENU_6')} />
    </>
  );
});

class _EventStream extends React.Component {
  constructor(props) {
    super(props);
    this.messages = {};
    this.state = {
      active: true,
      sortedMessages: [],
      filteredEvents: [],
      error: null,
      loading: true,
      oldestTimestamp: new Date(),
      start: props.start,
      end: props.end,
      apiEvents: [],
      getMethod: props.getMethod,
      getApiStart: null,
      getApiEnd: null,
      getApiType: null,
      getApiKind: null,
      getAPiTextFilter: null,
    };
    this.toggleStream = this.toggleStream_.bind(this);
  }

  wsInit(ns) {
    const { fieldSelector, cluster } = this.props;
    const params = { ns, cluster };
    if (fieldSelector) {
      params.queryParams = { fieldSelector: encodeURIComponent(fieldSelector) };
    }

    this.ws = new WSFactory(`${ns || 'all'}-sysevents`, {
      host: 'auto',
      reconnect: true,
      path: watchURL(EventModel, params),
      jsonParse: true,
      bufferFlushInterval: flushInterval,
      bufferMax: maxMessages,
    })
      .onbulkmessage(events => {
        events.forEach(({ object, type }) => {
          const uid = object.metadata.uid;

          switch (type) {
            case 'ADDED':
            case 'MODIFIED':
              if (this.messages[uid] && this.messages[uid].count > object.count) {
                // We already have a more recent version of this message stored, so skip this one
                return;
              }
              this.messages[uid] = object;
              break;
            case 'DELETED':
              delete this.messages[uid];
              break;
            default:
              // eslint-disable-next-line no-console
              console.error(`UNHANDLED EVENT: ${type}`);
              return;
          }
        });
        this.flushMessages();
      })
      .onopen(() => {
        this.setState({ error: false, loading: false });
        this.flushMessages();
      })
      .onclose(evt => {
        if (evt && evt.wasClean === false) {
          this.setState({ error: evt.reason || 'Connection did not close cleanly.' });
        }
      })
      .onerror(() => {
        this.setState({ error: true });
      });
  }

  componentDidMount() {
    if (!this.props.mock) {
      this.wsInit(this.props.namespace);
    }
  }

  componentWillUnmount() {
    this.ws && this.ws.destroy();
  }

  static filterEvents(messages, { kind, type, filter, textFilter }) {
    // Don't use `fuzzy` because it results in some surprising matches in long event messages.
    // Instead perform an exact substring match on each word in the text filter.
    const words = _.uniq(_.toLower(textFilter).match(/\S+/g)).sort((a, b) => {
      // Sort the longest words first.
      return b.length - a.length;
    });

    const textMatches = obj => {
      if (_.isEmpty(words)) {
        return true;
      }
      const name = _.get(obj, 'involvedObject.name', '');
      const message = _.toLower(obj.message);
      return _.every(words, word => name.indexOf(word) !== -1 || message.indexOf(word) !== -1);
    };

    const f = obj => {
      if (type && !typeFilter(type, obj)) {
        return false;
      }
      if (kind && !kindFilter(kind, obj)) {
        return false;
      }
      if (filter && !filter.some(flt => flt(obj.involvedObject))) {
        return false;
      }
      if (!textMatches(obj)) {
        return false;
      }
      return true;
    };

    return _.filter(messages, f);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { filter, kind, type, textFilter, loading } = prevState;

    if (_.isEqual(filter, nextProps.filter) && kind === nextProps.kind && type === nextProps.type && textFilter === nextProps.textFilter) {
      return {};
    }

    return {
      active: !nextProps.mock,
      loading: !nextProps.mock && loading,
      // update the filteredEvents
      filteredEvents: _EventStream.filterEvents(prevState.sortedMessages, nextProps),
      // we need these for bookkeeping because getDerivedStateFromProps doesn't get prevProps
      textFilter: nextProps.textFilter,
      kind: nextProps.kind,
      type: nextProps.type,
      filter: nextProps.filter,
    };
  }

  componentDidUpdate(prevProps) {
    // If the namespace has changed, created a new WebSocket with the new namespace
    if (prevProps.namespace !== this.props.namespace) {
      this.messages = {}; // namespace 변경이후에 들고 있던 messages 초기화
      this.ws && this.ws.destroy();
      this.wsInit(this.props.namespace);
    }
  }

  // Messages can come in extremely fast when the buffer flushes.
  // Instead of calling setState() on every single message, let onmessage()
  // update an instance variable, and throttle the actual UI update (see constructor)
  flushMessages() {
    const sorted = sortEvents(this.messages);
    const oldestTimestamp = _.min([this.state.oldestTimestamp, getLastTime(new Date(_.last(sorted)))]);
    sorted.splice(maxMessages);
    this.setState({
      oldestTimestamp,
      sortedMessages: sorted,
      filteredEvents: _EventStream.filterEvents(sorted, this.props),
    });

    // Shrink this.messages back to maxMessages messages, to stop it growing indefinitely
    this.messages = _.keyBy(sorted, 'metadata.uid');
  }

  toggleStream_() {
    this.setState({ active: !this.state.active }, () => {
      if (this.state.active) {
        this.ws && this.ws.unpause();
      } else {
        this.ws && this.ws.pause();
      }
    });
  }

  getEvent = async (start, end, kind, type, textFilter, namespace) => {
    const startTime = parseInt(start.getTime() / 1000);
    const endTime = parseInt(end.getTime() / 1000);
    let url = `/api/hypercloud/event?startTime=${startTime}&endTime=${endTime}`;
    if (namespace) {
      url = url + `&namespace=${namespace}`;
    }
    if (kind && kind !== 'all') {
      const kinds = kind.split(',')
      let kindsquery = '';
      kinds.forEach(k => {
        kindsquery = kindsquery + '&kind=' + k.split('~')[2];
      });
      url = url + kindsquery;
    }
    if (type && type !== 'all') {
      const capitalizeType = type.charAt(0).toUpperCase() + type.slice(1);
      url = url + `&type=${capitalizeType}`;
    }
    // text filter 는 ui에서 처리함 추후 논의 필요
    // if (textFilter) {
    //   url = url + `&text=${textFilter}`;
    // }
    //test
    url = url + `&offset=0&limit=${Number.MAX_SAFE_INTEGER}`;

    const response = await coFetchJSON(url);
    if (response) {
      this.setState({ apiEvents: response, getApiStart: start, getApiEnd: end, getApiType: type, getApiKind: kind, getAPiTextFilter: textFilter });
    }
  };

  render() {
    const { mock, resourceEventStream, t, namespace, start, end, kind, type, textFilter, getMethod } = this.props;
    const { active, error, loading, filteredEvents, sortedMessages, apiEvents, getApiStart, getApiEnd, getApiType, getApiKind, getAPiTextFilter } = this.state;
    if (getMethod === 'interval' && (start !== getApiStart || end !== getApiEnd || kind !== getApiKind || type !== getApiType || textFilter !== getAPiTextFilter)) {
      this.getEvent(start, end, kind, type, textFilter, namespace);
    }
    const count = getMethod === 'interval' ? apiEvents.length : filteredEvents.length;
    const allCount = sortedMessages.length;
    const noEvents = allCount === 0 && this.ws && this.ws.bufferSize() === 0;
    const noMatches = allCount > 0 && count === 0;
    let sysEventStatus, statusBtnTxt;

    if (noEvents || mock || (noMatches && resourceEventStream)) {
      sysEventStatus = <NoEvents />;
    }
    if (noMatches && !resourceEventStream) {
      sysEventStatus = <NoMatchingEvents />;
    }

    if (error) {
      statusBtnTxt = <span className="co-sysevent-stream__connection-error">{t('COMMON:MSG_DETAILS_TABEVENTS_1', { 0: _.isString(error) ? error : '' })}</span>;
      sysEventStatus = <ErrorLoadingEvents />;
    } else if (loading) {
      statusBtnTxt = <span>{t('SINGLE:MSG_EVENTS_MAIN_STATUS_1')}</span>;
      sysEventStatus = <Loading />;
    } else if (active) {
      statusBtnTxt = <span>{t('SINGLE:MSG_EVENTS_MAIN_STATUS_1')}</span>;
    } else {
      statusBtnTxt = <span>{t('SINGLE:MSG_EVENTS_MAIN_STATUS_2')}</span>;
    }

    const klass = classNames('co-sysevent-stream__timeline', {
      'co-sysevent-stream__timeline--empty': !allCount || !count,
    });
    // const messageCount = count < maxMessages ? `Showing ${pluralize(count, 'event')}` : `Showing ${count} of ${allCount}+ events`;
    const messageCount = count < maxMessages ? t('SINGLE:MSG_EVENTS_MAIN_COUNT_1', { something: count }) : t('SINGLE:MSG_EVENTS_MAIN_2', { something1: count, something2: allCount });

    const words = _.uniq(_.toLower(textFilter).match(/\S+/g)).sort((a, b) => {
      // Sort the longest words first.
      return b.length - a.length;
    });

    const textMatches = obj => {
      if (_.isEmpty(words)) {
        return true;
      }
      const name = _.get(obj, 'involvedObject.name', '');
      const message = _.toLower(obj.message);
      return _.every(words, word => name.indexOf(word) !== -1 || message.indexOf(word) !== -1);
    };

    // text filter 처리
    const filterdApiEvents =
      textFilter === ''
        ? apiEvents
        : apiEvents.filter(obj => {
            if (!textMatches(obj)) {
              return false;
            }
            return true;
          });

    return (
      <div className="co-m-pane__body">
        <div className="co-sysevent-stream">
          {getMethod === 'interval' ? (
            <>
              <div className="co-sysevent-stream__status">
                <div className="co-sysevent-stream__timeline__btn-text"><span></span></div>
                <div className="co-sysevent-stream__totals text-secondary">{t('SINGLE:MSG_EVENTS_MAIN_COUNT_1', { something: count })}</div>
              </div>
              <EventStreamList events={filterdApiEvents} EventComponent={Inner} />
              {filterdApiEvents.length === 0 && <NoMatchingEvents />}
            </>
          ) : (
            <>
              <div className="co-sysevent-stream__status">
                <div className="co-sysevent-stream__timeline__btn-text">{statusBtnTxt}</div>
                <div className="co-sysevent-stream__totals text-secondary">{messageCount}</div>
              </div>
              <div className={klass}>
                <TogglePlay active={active} onClick={this.toggleStream} className="co-sysevent-stream__timeline__btn" />
                <div className="co-sysevent-stream__timeline__end-message">
                  {t('COMMON:MSG_DETAILS_TABEVENTS_6')} <Timestamp timestamp={this.state.oldestTimestamp} />
                </div>
              </div>
              {count > 0 && <EventStreamList events={filteredEvents} EventComponent={Inner} />}
              {sysEventStatus}
            </>
          )}
        </div>
      </div>
    );
  }
}

const EventStream = withTranslation()(_EventStream);

_EventStream.defaultProps = {
  type: 'all',
  kind: 'all',
  mock: false,
};

_EventStream.propTypes = {
  type: PropTypes.string,
  filter: PropTypes.array,
  kind: PropTypes.string.isRequired,
  mock: PropTypes.bool,
  namespace: namespaceProptype,
  showTitle: PropTypes.bool,
  textFilter: PropTypes.string,
};

export const ResourceEventStream = ({
  obj: {
    kind,
    metadata: { name, namespace, uid },
  },
}) => {
  const { t } = useTranslation();
  const fieldSelector = kind === NodeModel.kind ? `involvedObject.name=${name},involvedObject.kind=${kind}` : `involvedObject.uid=${uid},involvedObject.name=${name},involvedObject.kind=${kind}`;
  return <_EventStream t={t} fieldSelector={fieldSelector} namespace={namespace} resourceEventStream />;
};
export const ResourcesEventStream = ({ filters, namespace }) => {
  const { t } = useTranslation();
  return <_EventStream filter={filters} resourceEventStream namespace={namespace} />;
};

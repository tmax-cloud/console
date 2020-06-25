import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { requirePrometheus } from './graphs';
import { SectionHeading } from './utils';
import { coFetch } from './../co-fetch';

// TODO:
// - Server 주소 변수화? proxy? --> run-bridge (동민 or 진수연구원님께 요청해야 함)
// - limit 선택지 문의

// const jaegerServer = 'http://222.122.67.135:31281/jaeger'; // 실장님
// const jaegerServer = 'http://192.168.6.196:30573/jaeger'; // 효욱연구원님
const jaegerServer = 'https://192.168.6.218/jaeger'; // 효욱연구원님 ssl

export const TracePage = ({ namespace: namespace, name: name }) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState('20');
  const [statusCode, setStatusCode] = React.useState('');
  const statusCodeRef = React.useRef();
  const [display, setDisplay] = React.useState('All');
  const [operationList, setOperationList] = React.useState([]);

  React.useEffect(() => {
    coFetch(`${jaegerServer}/api/services/${name}/operations`)
      .then(res => res.json())
      .then(({ data }) => {
        setOperationList(data);
      });
  }, []);

  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('CONTENT:TRACE')} />
      <div>
        <span style={{ marginRight: '15px' }}>
          <label style={{ marginRight: '10px' }}>Limit Results</label>
          <select name="limit" onChange={e => setLimit(e.target.value)}>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
        </span>
        <span style={{ marginRight: '15px' }}>
          <label style={{ marginRight: '10px' }}>Status Code</label>
          <input style={{ display: 'inline-block' }} ref={statusCodeRef} className="form-control" name="statusCode" type="number" onChange={e => (statusCodeRef.current = e.target.value)} onKeyDown={e => e.keyCode === 13 && setStatusCode(statusCodeRef.current)} />
        </span>
        <span style={{ marginRight: '15px' }}>
          <label style={{ marginRight: '10px' }}>Display</label>
          <select name="display" onChange={e => setDisplay(e.target.value)}>
            <option value="all">All</option>
            {operationList &&
              operationList.map(ops => (
                <option key={ops} value={ops}>
                  {ops}
                </option>
              ))}
          </select>
        </span>
      </div>
      <TraceGraphs namespace={namespace} name={name} limit={limit} statusCode={statusCode} display={display} />
    </div>
  );
};

const TraceGraphs = requirePrometheus(({ namespace, name, limit, statusCode, display }) => {
  const query = `?uiEmbed=v0&service=${name}` + (limit.toLowerCase() === 'all' ? '' : `&limit=${limit}`) + (!parseInt(statusCode) ? '' : `&tags={"http.status_code":"${statusCode}"}`) + (display.toLowerCase() === 'all' ? '' : `&operation=${display}`);
  const jaegerURL = `${jaegerServer}/search${query}`;

  return <iframe style={{ width: '100%', height: '100vh', border: 0 }} src={jaegerURL} target="_blank"></iframe>;
});

import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { requirePrometheus } from './graphs';
import { SectionHeading } from './utils';
import { coFetch } from './../co-fetch';

export const TracePage = ({ namespace: namespace, name: name }) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState('20');
  const [statusCode, setStatusCode] = React.useState('');
  const statusCodeRef = React.useRef();
  const [display, setDisplay] = React.useState('All');
  const [operationList, setOperationList] = React.useState([]);

  React.useEffect(() => {
    coFetch(`/api/jaeger/api/services/${name}/operations`)
      .then(res => res.json())
      .then(res => {
        console.log(res);
        // setOperationList(data);
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
            {!!operationList &&
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
  const iframeRef = React.useRef();
  const query = `?uiEmbed=v0&service=${name}` + (limit.toLowerCase() === 'all' ? '' : `&limit=${limit}`) + (!parseInt(statusCode) ? '' : `&tags={"http.status_code":"${statusCode}"}`) + (display.toLowerCase() === 'all' ? '' : `&operation=${display}`);
  const jaegerURL = `${document.location.origin}/api/jaeger/search${query}`;

  React.useEffect(() => {
    const resizeHeight = () => {
      if (iframeRef.current.contentDocument.readyState === 'complete') {
        iframeRef.current.style.height = null;
        iframeRef.current.style.height = iframeRef.current.contentDocument.documentElement.scrollHeight + 'px';

        iframeRef.current.contentDocument.onclick = () => {
          iframeRef.current.style.height = null;
          iframeRef.current.style.height = iframeRef.current.contentDocument.documentElement.scrollHeight + 'px';
        };
      } else {
        setTimeout(resizeHeight, 300);
      }
    };
    setTimeout(resizeHeight, 300);
  });

  return <iframe id="iframe-jaeger" ref={iframeRef} width="100%" style={{ border: 0 }} src={jaegerURL} target="_blank"></iframe>;
});

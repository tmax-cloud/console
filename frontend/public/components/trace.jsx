import * as React from 'react';
import * as _ from 'lodash-es';
//import { useTranslation } from 'react-i18next';
import { requirePrometheus } from './graphs';
import { SectionHeading } from './utils';
import { coFetch } from '../co-fetch';
import { coFetchJSON } from '@console/internal/co-fetch';

const DoneMessage = 'done';

const initializeMenuUrl = (urlMap) => {
  const ingressQuery = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent('ingress.tmaxcloud.org/name=jaeger-query')}`;  
  const ingressQeuryURL = `${document.location.origin}/api/console/apis/networking.k8s.io/v1/ingresses?&${ingressQuery}`;
  return new Promise((resolve, reject) => {
    coFetchJSON(ingressQeuryURL)
      .then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {              
            urlMap.set('jaeger', `https://${host}`);
          }
        }          
        resolve(DoneMessage);
      })
      .catch(err => {
        resolve(DoneMessage);
      });
  });
};

export const TracePage = ({ namespace: namespace, name: name }) => {
  //const { t } = useTranslation();
  const [limit, setLimit] = React.useState('20');
  const [statusCode, setStatusCode] = React.useState('');
  const statusCodeRef = React.useRef();
  const [display, setDisplay] = React.useState('All');
  const [operationList, setOperationList] = React.useState([]);

  const urlMap = new Map();


  React.useEffect(() => {
    //coFetch(`/api/jaeger/api/services/${name}/operations`)    
    initializeMenuUrl(urlMap);
    coFetch(urlMap.get('jaeger') + `/api/services/${name}/operations`)
      .then(res => res.json())
      .then(res => {
        res.data && setOperationList(res.data);
      });
  }, []);

  return (
    <div className="co-m-pane__body">
      <SectionHeading text='Trace' />
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

const TraceGraphs = requirePrometheus(({ name, limit, statusCode, display }) => {
  //const iframeRef = React.useRef();
  const query = `?uiEmbed=v0` + (limit.toLowerCase() === 'all' ? '' : `&limit=${limit}`) + (!parseInt(statusCode) ? '' : `&tags={"http.status_code":"${statusCode}"}`) + (display.toLowerCase() === 'all' ? '' : `&operation=${display}`) + `&service=${name}`;
  //const jaegerURL = `${document.location.origin}/api/jaeger/search${query}`;
  //const ingressQuery = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent('ingress.tmaxcloud.org/name=jaeger-query')}`;
  //const ingressQeuryURL = `${document.location.origin}/api/console/apis/networking.k8s.io/v1/ingresses?&labelSelector=ingress.tmaxcloud.org%2Fname%3Djaeger-query`;
  //const ingressQeuryURL = `${document.location.origin}/api/console/apis/networking.k8s.io/v1/ingresses?&${ingressQuery}`;
  //const jaegerURL = `/api/jaeger/search${query}`;
  const urlMap = new Map();  
  
  initializeMenuUrl(urlMap);

  const jaegerURL = urlMap.get('jaeger') + `${query}`;
  
  /*
  const onLoad = () => {
    iframeRef.current.contentWindow.document.body.style.height = 'auto';
    iframeRef.current.style.height = iframeRef.current.contentDocument.documentElement.scrollHeight + 'px';
  };
  */
  
  return <iframe style={{ width: '100%', height: '100vh', border: 0 }} src={jaegerURL} target="_blank" />

  //return <iframe ref={iframeRef} width="100%" height="500px" style={{ border: 0 }} src={jaegerURL} target="_blank" onLoad={onLoad}></iframe>;
});
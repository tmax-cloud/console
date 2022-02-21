import * as React from 'react';
import * as _ from 'lodash-es';
//import { useTranslation } from 'react-i18next';
import { requirePrometheus } from './graphs';
import { SectionHeading } from './utils';
import { coFetch } from '../co-fetch';
import { coFetchJSON } from '@console/internal/co-fetch';

const DoneMessage = 'done';

const initializeMenuUrl = (urlsMap) => {
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
            urlsMap.set('jaeger', `https://${host}`);
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
  const [serviceName, setServiceName] = React.useState(name);
  const [limit, setLimit] = React.useState('20');
  const [statusCode, setStatusCode] = React.useState('');
  const statusCodeRef = React.useRef();
  const [display, setDisplay] = React.useState('All');
  const [operationList, setOperationList] = React.useState([]);
  const [urlsMap, setUrlsMap] = React.useState(new Map());

  const [jaegerURL, setJaegerURL] = React.useState('https://jaeger-query.tmaxcloud.org');


  React.useEffect(() => {
    (async () => {
      const response = await initializeMenuUrl(urlsMap);
      setJaegerURL(urlsMap.get('jaeger'));
    })();
  }, [jaegerURL]);


  React.useEffect(() => {
    if (name === 'jaeger-query' || name === 'istio-ingressgateway' || name === 'istio-egressgateway') {
      setServiceName(name);
    } else {
      coFetch(`/api/kubernetes/api/v1/namespaces/${namespace}/services/${name}`)
        .then(res => res.json())
        .then(res => {
          if (!res.spec.selector || res.spec.selector.length === 0) return;
          const appValue = res.spec.selector.app;
          if (!!appValue) {
            setServiceName(`${appValue}.${namespace}`);
          } else {
            const key = Object.entries(res.spec.selector)[0][0];
            const value = Object.entries(res.spec.selector)[0][1];
            coFetch(`/api/kubernetes/api/v1/namespaces/${namespace}/pods?labelSelector=${key}%3D${value}`)
              .then(res => res.json())
              .then(res => {
                if (!res.items || res.items.length === 0) return;
                const proxyContainer = res.items.reduce((acc, item) => {
                  const proxy = item.spec.containers.find(cont => cont.name === 'istio-proxy');
                  return !!acc ? acc : proxy;
                }, null);
                const serviceClusterIdx = proxyContainer && proxyContainer.args.findIndex(str => str.includes('--serviceCluster'));
                const serviceCluster = serviceClusterIdx && proxyContainer.args[serviceClusterIdx + 1];
                serviceCluster && setServiceName(serviceCluster.replace('$(POD_NAMESPACE)', namespace));
              });
          }
        });
    }
  }, []);

  React.useEffect(() => {
    coFetch(`${jaegerURL}/api/services/${serviceName}/operations`).catch(e=>{console.log('caught', e);})
      .then(res => res.json()).catch(e=>{console.log('caught', e);})
      .then(res => {
        res.data && setOperationList(res.data);
      }).catch(e=>{console.log('caught', e);});
  }, [serviceName]);

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
      <Trace serviceName={serviceName} limit={limit} statusCode={statusCode} display={display} jaegerURL={jaegerURL} />
    </div>
  );
};

const Trace = ({ serviceName, limit, statusCode, display, jaegerURL }) => {
  const query = `?uiEmbed=v0` + (limit.toLowerCase() === 'all' ? '' : `&limit=${limit}`) + (!parseInt(statusCode) ? '' : `&tags={"http.status_code":"${statusCode}"}`) + (display.toLowerCase() === 'all' ? '' : `&operation=${display}`) + `&service=${serviceName}`;
  const jaegerURLwithQuery = `${jaegerURL}/search${query}`;

  return <iframe width="100%" height="750px" style={{ border: 0 }} src={jaegerURLwithQuery} target="_blank"></iframe>;
};
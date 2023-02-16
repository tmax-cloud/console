import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { WSFactory } from '@console/internal/module/ws-factory';

const SasServicePage = () => {
  const watchURL = 'wss://console.tmaxcloud.org/api/sas';
  const ws: WSFactory = new WSFactory('sas', {
    host: '',
    reconnect: true,
    path: watchURL,
    jsonParse: true,
  });
  ws.onopen(() => {
    // eslint-disable-next-line no-console
    console.log('연결완료');
  });
  ws.onmessage(msg => {
    // eslint-disable-next-line no-console
    console.log('Message from server ', msg.data);
  });

  const getResource = type => {
    switch (type) {
      case 'worker':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetWorker', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'binary':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetBinary', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'application':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetApplication', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'controller':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetController', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'service':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetService', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Helmet>
        <title>SAS</title>
      </Helmet>
      <div className="co-m-nav-title">
        <h1 className="co-m-pane__heading">
          <div className="co-m-pane__name co-resource-item">
            <span data-test-id="resource-title" className="co-resource-item__resource-name">
              서비스
            </span>
          </div>
        </h1>
      </div>
      <Flex>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('worker')}>
            Get Worker
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('binary')}>
            Get binary
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('application')}>
            Get application
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('controller')}>
            Get controller
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('service')}>
            Get service
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};

export default SasServicePage;

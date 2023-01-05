import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

const SasPage = () => {
  const output = React.useRef<any>(null);
  const exampleSocket = new WebSocket('wss://console.tmaxcloud.org/api/sas');
  exampleSocket.onopen = function(event) {
    console.log(event, '연결완료');
  };
  exampleSocket.onmessage = function(event) {
    output.current.innerHtml = event.data;
    console.log('Message from server ', event.data);
  };

  const getResource = type => {
    switch (type) {
      case 'worker':
        exampleSocket.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetWorker', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'binary':
        exampleSocket.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetBinary', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'application':
        exampleSocket.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetApplication', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'controller':
        exampleSocket.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetController', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'service':
        exampleSocket.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetService', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
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
              Get Resource
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
      <div className="box">
        <p ref={output}> </p>
      </div>
    </>
  );
};

export default SasPage;

import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from './utils';

export const VNCPage = ({ namespace: namespace, name: name }) => {
  const iframeRef = React.useRef();
  const { t } = useTranslation();
  const proxyPrefix = 'api/vnc';
  const vncSrc = `${document.location.origin}/${proxyPrefix}/vnc_lite.html?path=${proxyPrefix}/k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/${namespace}/virtualmachineinstances/${name}/vnc`;

  const onLoad = () => {
    let timerId = null;
    const loadedCanvas = () => {
      const canvasElements = iframeRef.current.contentDocument.getElementsByTagName('canvas');
      if (canvasElements.length > 0) {
        clearTimeout(timerId);
        canvasElements[0].clientHeight > 475 && (iframeRef.current.style.height = canvasElements[0].clientHeight + 25 + 'px');
      } else {
        timerId = setTimeout(loadedCanvas, 500);
      }
    };
    loadedCanvas();
  };

  return (
    <div className="co-m-pane__body">
      {/* <SectionHeading text={'VNC'} /> */}
      <iframe ref={iframeRef} width="100%" height="500px" style={{ border: 0 }} src={vncSrc} onLoad={onLoad} target="_blank"></iframe>
    </div>
  );
};

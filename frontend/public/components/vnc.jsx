import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from './utils';

export const VNCPage = ({ namespace: namespace, name: name }) => {
  const { t } = useTranslation();
  const proxyPrefix = 'api/vnc';
  const vncSrc = `${document.location.origin}/${proxyPrefix}/vnc_lite.html?path=${proxyPrefix}/k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/${namespace}/virtualmachineinstances/${name}/vnc`;

  return (
    <div className="co-m-pane__body">
      {/* <SectionHeading text={'VNC'} /> */}
      <iframe width="100%" height="500px" style={{ border: 0 }} src={vncSrc} target="_blank"></iframe>
    </div>
  );
};

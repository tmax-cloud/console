import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
// import Iframe from 'react-iframe'

// <Iframe url="http://192.168.0.191:9000/api/grafana/"
//   width="1700" height="880" scrolling="auto"
//   id="myId"
//   className="myClassname"
//   display="initial"
//   position="relative" />

export const Grafana = props => {
  const { t } = useTranslation();
  return (
    <div>
      {/* <iframe width="1700" height="880" scrolling="auto" src="https://192.168.0.191:9000/api/grafana/d/bbb2a765a623ae38130206c7d94a160f/kubernetes-networking-namespace-workload?orgId=1&refresh=30s" sandbox="allow-scripts">
        https://192.168.0.191:9000/api/grafana/d/UAJdHJmGk/2-cluster-monitor?orgId=1&refresh=10s&var-Cluster1=prometheus&var-cluster=&var-interval=4h&var-Cluster2=Cluester2
      </iframe> */}
      {/* <iframe width="1700" height="880" scrolling="auto" src="http://192.168.0.191:9000/api/grafana/" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox allow-presentation allow-top-navigation allow-top-navigation-by-user-activation"> */}
      {/* <iframe width="1700" height="880" scrolling="auto" src="http://192.168.0.191:9000/api/grafana/" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox allow-presentation allow-top-navigation allow-top-navigation-by-user-activation">   */}
      <iframe width="1700" height="880" scrolling="auto" src="https://192.168.0.191:9000/api/grafana/">
        https://192.168.0.191:9000/api/grafana/
      </iframe>
    </div>
  );
};


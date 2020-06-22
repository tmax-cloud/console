import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const Grafana = props => {
  const { t } = useTranslation();
  return (
    <div>
      <iframe width="1700" height="880" scrolling="auto" src="https://192.168.8.61:9000/api/grafana/d/UAJdHJmGk/2-cluster-monitor?orgId=1&refresh=10s&var-Cluster1=prometheus&var-cluster=&var-interval=4h&var-Cluster2=Cluester2">
        https://192.168.8.61:9000/api/grafana/d/UAJdHJmGk/2-cluster-monitor?orgId=1&refresh=10s&var-Cluster1=prometheus&var-cluster=&var-interval=4h&var-Cluster2=Cluester2
      </iframe>
    </div>
  );
};

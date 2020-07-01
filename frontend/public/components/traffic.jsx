import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { Line, requirePrometheus } from './graphs';
import { SectionHeading } from './utils';

export const TrafficPage = ({ namespace: namespace, name: name }) => {
    const { t } = useTranslation();
    const [reporter, setReporter] = React.useState('destination', '');
    return <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:TRAFFIC')} />
        <div>
            <label style={{ marginRight: '10px' }}>{t('CONTENT:REPORTEDFROM')}</label>
            <select name="reporter" onChange={e => setReporter(e.target.value)}>
                <option value="destination">{t('CONTENT:DESTINATION')}</option>
                <option value="source">{t('CONTENT:SOURCE')}</option>
            </select>
        </div>
        <TrafficGraphs namespace={namespace} name={name} showTitle={false} reporter={reporter} />
    </div>
}
const TrafficGraphs = requirePrometheus(({ reporter, namespace, name }) => {
    const serviceName = `${name}.${namespace}.svc.cluster.local`;
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-md-4">
                    <Line title={t('CONTENT:SERVERREQUESTVOLUME')} query={serviceName && `round(sum(irate(istio_requests_total{reporter="${reporter}", destination_service=~"${serviceName}"}[5m])), 0.001)`} units="binaryBytes" />
                </div>
                <div className="col-md-4">
                    <Line title={t('CONTENT:SERVERREQUESTDURATION')} query={serviceName && `histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="${reporter}", destination_service=~"${serviceName}"}[1m])) by (le))`} units="binaryBytes" />
                </div>
                <div className="col-md-4">
                    <Line title={t('CONTENT:REQUESTSIZE')} query={serviceName && `histogram_quantile(0.50, sum(irate(istio_request_bytes_bucket{reporter="${reporter}", destination_service=~"${serviceName}"}[1m])) by (destination_workload, destination_workload_namespace, le))`} units="binaryBytes" />
                </div>
                <div className="col-md-4">
                    <Line title={t('CONTENT:RESPONSESIZE')} query={serviceName && `histogram_quantile(0.50, sum(irate(istio_response_bytes_bucket{reporter="${reporter}", destination_service=~"${serviceName}"}[1m])) by (destination_workload, destination_workload_namespace, le))`} units="binaryBytes" />
                </div>
                <div className="col-md-4">
                    <Line title={t('CONTENT:TCPRECEIVED')} query={serviceName && `round(sum(irate(istio_tcp_received_bytes_total{reporter="${reporter}", destination_service=~"${serviceName}"}[1m])) by (destination_workload, destination_workload_namespace), 0.001)`} units="binaryBytes" />
                </div>
                <div className="col-md-4">
                    <Line title={t('CONTENT:TCPSENT')} query={serviceName && `round(sum(irate(istio_tcp_sent_bytes_total{reporter="${reporter}", destination_service=~"${serviceName}"}[1m])) by (destination_workload, destination_workload_namespace), 0.001)`} units="binaryBytes" />
                </div>
            </div>

            <br />
        </React.Fragment>
    );
});
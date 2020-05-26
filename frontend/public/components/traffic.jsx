import * as React from 'react';
import * as _ from 'lodash-es';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Gauge, prometheusBasePath, requirePrometheus } from './graphs';
import { PromiseComponent, LoadingBox, AsyncComponent, ResourceIcon, SectionHeading } from './utils';

export const TrafficPage = () => {
    const { t } = useTranslation();
    const [timeUnit, setTimeUnit] = React.useState('hour', '');
    return <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:TRAFFIC')} />
        <div style={{ float: 'left' }}>
            <p text='Reported from' />
            <select name="reporter" onChange={e => setTimeUnit(e.target.value)}>
                <option value="destination">Destination</option>
                <option value="source">Source</option>
            </select>
        </div>
        <MeteringPage showTitle={false} timeUnit={timeUnit} />
    </div>
}
const MeteringPage = requirePrometheus(props => {
    let timeUnit = props.timeUnit;
    const { t } = useTranslation();
    return (
        <div className="co-m-pane__body">
            <div className="container-fluid group__body group__graphs">
                <div className="row">
                    <div className="col-md-3 col-sm-6">
                        <Gauge title={t('CONTENT:APISERVERSUP')} query={'(sum(up{job="apiserver"} == 1) / count(up{job="apiserver"})) * 100'} invert={true} thresholds={{ warn: 15, error: 50 }} />
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <Gauge title={t('CONTENT:APIREQUESTSUCCESSRATE')} query={'sum(rate(apiserver_request_count{code=~"2.."}[5m])) / sum(rate(apiserver_request_count[5m])) * 100'} invert={true} thresholds={{ warn: 15, error: 30 }} />
                    </div>
                </div>
            </div>
        </div>
    );
});
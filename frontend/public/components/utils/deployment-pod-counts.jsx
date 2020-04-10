import * as _ from 'lodash-es';
import * as React from 'react';
import { Tooltip } from './tooltip';

// import { K8sKind, K8sResourceKind } from '../../module/k8s';
// import { SafetyFirst } from '../safety-first';
import { configureReplicaCountModal } from '../modals';
import { LoadingInline, pluralize } from '.';
import { useTranslation } from 'react-i18next';

/* eslint-disable no-undef, no-unused-vars */
// type DPCProps = {
//   resource: K8sResourceKind,
//   resourceKind: K8sKind,
// };

// type DPCState = {
//   desiredCount: number,
//   waitingForUpdate: boolean,
// };
/* eslint-enable no-undef, no-unused-vars */

// Common representation of desired / up-to-date / matching pods for Deployment like things
// export class DeploymentPodCounts extends SafetyFirst<DPCProps, DPCState> {
export class DeploymentPodCounts extends React.Component {
  /* eslint-disable no-undef, no-unused-vars */
  // openReplicaCountModal: any;
  /* eslint-enable no-undef, no-unused-vars */

  constructor(props) {
    super(props);

    this.state = {
      desiredCount: -1,
      waitingForUpdate: false,
    };

    this.openReplicaCountModal = event => {
      event.preventDefault();
      event.target.blur();

      const { resourceKind, resource } = this.props;

      configureReplicaCountModal({
        resourceKind,
        resource,
        invalidateState: (waitingForUpdate, desiredCount) => this.setState({ waitingForUpdate, desiredCount }),
      });
    };
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    if (!nextState.waitingForUpdate) {
      return null;
    }

    if (_.get(nextProps, 'resource.spec.replicas') !== nextState.desiredCount) {
      return null;
    }

    return { waitingForUpdate: false, desiredCount: -1 };
  }

  render() {
    const { resource, resourceKind, t } = this.props;
    const { spec, status } = resource;

    return (
      <div className="co-m-pane__body-group">
        <div className="co-detail-table">
          <div className="co-detail-table__row row">
            <div className="co-detail-table__section col-sm-3">
              <dl className="co-m-pane__details">
                <dt className="co-detail-table__section-header">{t('CONTENT:DESIREDCOUNT')}</dt>
                <dd>
                  {this.state.waitingForUpdate ? (
                    <LoadingInline />
                  ) : (
                    <a className="co-m-modal-link" href="#" onClick={this.openReplicaCountModal}>
                      {t('PLURAL:POD', { count: status.replicas })}
                    </a>
                  )}
                </dd>
              </dl>
            </div>
            <div className="co-detail-table__section col-sm-3">
              <dl className="co-m-pane__details">
                <dt className="co-detail-table__section-header">{t('CONTENT:UP-TO-DATECOUNT')}</dt>
                <dd>
                  {/* <Tooltip content={t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_0', { something: t(`RESOURCE:${resourceKind.kind.toUpperCase()}`) })}>{pluralize(status.updatedReplicas, 'pod')}</Tooltip> */}
                  <Tooltip content={t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_0', { something: t(`RESOURCE:${resourceKind.kind.toUpperCase()}`) })}>{t('PLURAL:POD', { count: status.updatedReplicas })}</Tooltip>
                </dd>
              </dl>
            </div>
            <div className="co-detail-table__section co-detail-table__section--last col-sm-6">
              <dl className="co-m-pane__details">
                <dt className="co-detail-table__section-header">{t('CONTENT:MATCHINGPODS')}</dt>
                <dd>
                  <Tooltip content={t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_1', { something: t(`RESOURCE:${resourceKind.kind.toUpperCase()}`) })}>{t('PLURAL:POD', { count: status.replicas })}</Tooltip>
                </dd>
              </dl>
              <div className="co-detail-table__bracket"></div>
              <div className="co-detail-table__breakdown">
                <Tooltip content={t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_2', { something: t(`RESOURCE:${resourceKind.kind.toUpperCase()}`) })}>
                  {status.availableReplicas || 0} {t('CONTENT:AVAILABLE')}
                </Tooltip>
                <Tooltip content={t('ADDITIONAL:DEPLOYMENT_DETAIL_TOOLTIP_2', { something: t(`RESOURCE:${resourceKind.kind.toUpperCase()}`) })}>
                  {status.unavailableReplicas || 0} {t('CONTENT:UNAVAILABLE')}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

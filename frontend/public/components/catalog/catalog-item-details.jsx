import * as React from 'react';
import * as _ from 'lodash-es';
import * as PropTypes from 'prop-types';
import { PropertiesSidePanel, PropertyItem } from '@patternfly/react-catalog-view-extension';

import { ClusterServicePlanModel } from '../../models';
import { k8sGet } from '../../module/k8s';
import { Timestamp, ExternalLink, SectionHeading, LoadingBox } from '../utils';
import { SyncMarkdownView } from '../markdown-view';
import { withTranslation } from 'react-i18next';

export const CatalogTileDetails = withTranslation()(
  class CatalogTileDetails extends React.Component {
    state = {
      plans: [],
      markdown: '',
      markdownLoading: false,
    };

    componentDidMount() {
      const { obj, kind, markdownDescription } = this.props.item;
      if (kind === 'ClusterServiceClass') {
        this.getPlans(obj);
      }

      if (_.isFunction(markdownDescription)) {
        this.setState({ markdownLoading: true });
        markdownDescription()
          .then(md => this.setState({ markdown: md, markdownLoading: false }))
          .catch(() => this.setState({ markdownLoading: false }));
      } else {
        this.setState({ markdown: markdownDescription });
      }
    }

    getPlans(obj) {
      k8sGet(ClusterServicePlanModel, null, null, {
        queryParams: { fieldSelector: `spec.clusterServiceClassRef.name=${obj.metadata.name}` },
      }).then(({ items: plans }) => {
        this.setState({
          plans: _.orderBy(plans, ['spec.externalMetadata.displayName', 'metadata.name']),
        });
      });
    }

    render() {
      const { t } = this.props;
      const { obj, kind, tileProvider, tileDescription, supportUrl, longDescription, documentationUrl, sampleRepo, customProperties } = this.props.item;
      const { plans, markdown, markdownLoading } = this.state;

      const creationTimestamp = _.get(obj, 'metadata.creationTimestamp');

      const supportUrlLink = <ExternalLink href={supportUrl} text="Get support" />;
      const documentationUrlLink = <ExternalLink href={documentationUrl} additionalClassName="co-break-all" text={documentationUrl} />;
      const sampleRepoLink = <ExternalLink href={sampleRepo} additionalClassName="co-break-all" text={sampleRepo} />;
      const planItems = _.map(plans, plan => <li key={plan.metadata.uid}>{plan.spec.description || plan.spec.externalName}</li>);
      return (
        <div className="modal-body modal-body-border">
          <div className="modal-body-content">
            <div className="modal-body-inner-shadow-covers">
              <div className="co-catalog-page__overlay-body">
                <PropertiesSidePanel>
                  {customProperties}
                  {tileProvider && <PropertyItem label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_SIDEPANEL_1')} value={tileProvider} />}
                  {supportUrl && <PropertyItem label="Support" value={supportUrlLink} />}
                  {creationTimestamp && <PropertyItem label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_SIDEPANEL_3')} value={<Timestamp timestamp={creationTimestamp} />} />}
                </PropertiesSidePanel>
                <div className="co-catalog-page__overlay-description">
                  <SectionHeading text={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_SIDEPANEL_2')} />
                  {tileDescription && <p>{tileDescription}</p>}
                  {markdownLoading && <LoadingBox message="Loading Markdown..." />}
                  {markdown && <SyncMarkdownView content={markdown} />}
                  {longDescription && <p>{longDescription}</p>}
                  {sampleRepo && <p>Sample repository: {sampleRepoLink}</p>}
                  {documentationUrl && (
                    <>
                      <h2 className="h5">Documentation</h2>
                      <p>{documentationUrlLink}</p>
                    </>
                  )}
                  {!_.isEmpty(plans) && (
                    <>
                      <h2 className="h5">Service Plans</h2>
                      <ul>{planItems}</ul>
                    </>
                  )}
                  {kind === 'ImageStream' && (
                    <>
                      <hr />
                      <p>The following resources will be created:</p>
                      <ul>
                        <li>
                          A <span className="co-catalog-item-details__kind-label">build config</span> to build source from a Git repository.
                        </li>
                        <li>
                          An <span className="co-catalog-item-details__kind-label">image stream</span> to track built images.
                        </li>
                        <li>
                          A <span className="co-catalog-item-details__kind-label">deployment config</span> to rollout new revisions when the image changes.
                        </li>
                        <li>
                          A <span className="co-catalog-item-details__kind-label">service</span> to expose your workload inside the cluster.
                        </li>
                        <li>
                          An optional <span className="co-catalog-item-details__kind-label">route</span> to expose your workload outside the cluster.
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  },
);

CatalogTileDetails.displayName = 'CatalogTileDetails';
CatalogTileDetails.propTypes = {
  items: PropTypes.array,
  overlayClose: PropTypes.func,
};

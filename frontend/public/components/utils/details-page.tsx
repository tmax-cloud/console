import * as React from 'react';
import * as _ from 'lodash-es';
import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { Translation } from 'react-i18next';
import { DetailsItem } from './details-item';
import { Kebab } from './kebab';
import { LabelList } from './label-list';
import { OwnerReferences } from './owner-references';
import { ResourceLink } from './resource-link';
import { ServicePlanModel, ClusterServicePlanModel } from '../../models';
import { Selector } from './selector';
import { Timestamp } from './timestamp';
import { useAccessReview } from './rbac';
import { K8sResourceKind, modelFor, referenceFor, Toleration } from '../../module/k8s';

export const pluralize = (i: number, singular: string, plural: string = `${singular}s`, includeCount: boolean = true) => {
  const pluralized = `${i === 1 ? singular : plural}`;
  return includeCount ? `${i || 0} ${pluralized}` : pluralized;
};

export const detailsPage = <T extends {}>(Component: React.ComponentType<T>) =>
  function DetailsPage(props: T) {
    return <Component {...props} />;
  };

const getTolerationsPath = (obj: K8sResourceKind): string => {
  // FIXME: Is this correct for all types (jobs, cron jobs)? It would be better for the embedding page to pass in the path.
  return obj.kind === 'Pod' ? 'spec.tolerations' : 'spec.template.spec.tolerations';
};

const getDescriptionStringKey = (obj: K8sResourceKind): string => {
  switch (obj.kind) {
    case ServicePlanModel.kind:
      return 'COMMON:MSG_DETAILS_TABSERVICEPLANS_DETAILS_SIDEPANEL_12';
    case ClusterServicePlanModel.kind:
      return 'COMMON:MSG_DETAILS_TABSERVICEPLANS_DETAILS_SIDEPANEL_14';
    default:
      return 'COMMON:MSG_DETAILS_TABDETAILS_10';
  }
};

export const ResourceSummary: React.SFC<ResourceSummaryProps> = ({ children, resource, customPathName, customPathId, showName = true, showOwner = true, useHcOwnerPath = true, showID = false, showDescription = false, showPodSelector = false, showNodeSelector = false, showAnnotations = true, showTolerations = false, podSelector = 'spec.selector', nodeSelector = 'spec.template.spec.nodeSelector', showOwnerRole = false }) => {
  const { metadata, type } = resource;
  const reference = referenceFor(resource);
  const model = modelFor(reference);
  const tolerationsPath = getTolerationsPath(resource);
  const tolerations: Toleration[] = _.get(resource, tolerationsPath);
  const descriptionKey = getDescriptionStringKey(resource);
  const canUpdate = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'patch',
    name: metadata.name,
    namespace: metadata.namespace,
  });

  return (
    <Translation>
      {t => (
        <dl data-test-id="resource-summary" className="co-m-pane__details">
          {showName && <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')} obj={resource} path={customPathName || 'metadata.name'} />}
          {showID && <DetailsItem label="ID" obj={resource} path={customPathId || 'metadata.uid'} />}
          {showDescription && <DetailsItem label={t(descriptionKey)} obj={resource} path={'spec.description'} />}
          {metadata.namespace && (
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_6')} obj={resource} path="metadata.namespace">
              <ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.uid} namespace={null} />
            </DetailsItem>
          )}
          {type ? <dt>Type</dt> : null}
          {type ? <dd>{type}</dd> : null}
          <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_8')} obj={resource} path="metadata.labels">
            <LabelList kind={reference} labels={metadata.labels} />
          </DetailsItem>
          {showPodSelector && (
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_9')} obj={resource} path={podSelector}>
              <Selector selector={_.get(resource, podSelector)} namespace={_.get(resource, 'metadata.namespace')} />
            </DetailsItem>
          )}
          {showNodeSelector && (
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_10')} obj={resource} path={nodeSelector}>
              <Selector kind="Node" selector={_.get(resource, nodeSelector)} />
            </DetailsItem>
          )}
          {showTolerations && (
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_11')} obj={resource} path={tolerationsPath}>
              {canUpdate ? (
                <Button type="button" isInline onClick={Kebab.factory.ModifyTolerations(model, resource).callback.bind(null, t)} variant="link">
                  {t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_108', { 0: _.size(tolerations) })}
                  <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                </Button>
              ) : (
                t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_108', { 0: _.size(tolerations) })
              )}
            </DetailsItem>
          )}
          {showAnnotations && (
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_99')} obj={resource} path="metadata.annotations">
              {canUpdate ? (
                <Button data-test-id="edit-annotations" type="button" isInline onClick={Kebab.factory.ModifyAnnotations(model, resource).callback.bind(null, t)} variant="link">
                  {t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_100', { 0: _.size(metadata.annotations) })}
                  <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                </Button>
              ) : (
                t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_100', { 0: _.size(metadata.annotations) })
              )}
            </DetailsItem>
          )}
          {children}
          <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_43')} obj={resource} path="metadata.creationTimestamp">
            <Timestamp timestamp={metadata.creationTimestamp} />
          </DetailsItem>
          {showOwner && (
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')} obj={resource} path="metadata.ownerReferences">
              <OwnerReferences resource={resource} useHcOwnerPath={useHcOwnerPath} showOwnerRole={showOwnerRole} />
            </DetailsItem>
          )}
        </dl>
      )}
    </Translation>
  );
};

export const ResourcePodCount: React.SFC<ResourcePodCountProps> = ({ resource }) => (
  <Translation>
    {t => (
      <dl>
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_38')} obj={resource} path="status.replicas" defaultValue="0" />
        <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_39')} obj={resource} path="spec.replicas" defaultValue="0" />
      </dl>
    )}
  </Translation>
);

export type ResourceSummaryProps = {
  resource: K8sResourceKind;
  showName?: boolean;
  showID?: boolean;
  showDescription?: boolean;
  showPodSelector?: boolean;
  showNodeSelector?: boolean;
  showAnnotations?: boolean;
  showTolerations?: boolean;
  showOwner?: boolean;
  podSelector?: string;
  nodeSelector?: string;
  children?: React.ReactNode;
  customPathName?: string;
  customPathId?: string;
  useHcOwnerPath?: boolean;
  showOwnerRole?: boolean;
};

export type ResourcePodCountProps = {
  resource: K8sResourceKind;
};

ResourceSummary.displayName = 'ResourceSummary';
ResourcePodCount.displayName = 'ResourcePodCount';

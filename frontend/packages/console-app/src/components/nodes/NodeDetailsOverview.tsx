import * as _ from 'lodash';
import * as React from 'react';
import { NodeKind, referenceForModel } from '@console/internal/module/k8s';
import { useAccessReview, SectionHeading, LabelList, Kebab, ResourceLink, cloudProviderNames, cloudProviderID, Timestamp } from '@console/internal/components/utils';
import { NodeModel, MachineModel } from '@console/internal/models';
import { Button, pluralize } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { getNodeMachineNameAndNamespace, getNodeAddresses } from '@console/shared';
import NodeIPList from './NodeIPList';
import NodeStatus from './NodeStatus';
import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';

type NodeDetailsOverviewProps = {
  node: NodeKind;
};

const NodeDetailsOverview: React.FC<NodeDetailsOverviewProps> = ({ node }) => {
  const { t } = useTranslation();
  const machine = getNodeMachineNameAndNamespace(node);
  const canUpdate = useAccessReview({
    group: NodeModel.apiGroup,
    resource: NodeModel.plural,
    verb: 'patch',
    name: node.metadata.name,
    namespace: node.metadata.namespace,
  });
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(node, t) })} />
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_112')}</dt>
            <dd>{node.metadata.name || '-'}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_20')}</dt>
            <dd>
              <NodeStatus node={node} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_65')}</dt>
            <dd>{_.get(node, 'spec.externalID', '-')}</dd>
            <dt>{t('SINGLE:MSG_NODES_NODEDETAILS_1')}</dt>
            <dd>
              <NodeIPList ips={getNodeAddresses(node)} expand />
            </dd>
            <dt>{t('SINGLE:MSG_NODES_NODEDETAILS_2')}</dt>
            <dd>
              <LabelList kind="Node" labels={node.metadata.labels} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_113')}</dt>
            <dd>
              {canUpdate ? (
                <Button variant="link" type="button" isInline onClick={Kebab.factory.ModifyTaints(NodeModel, node).callback.bind(null, t)}>
                  {t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_142', { 0: _.size(node.spec.taints) })}
                  <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                </Button>
              ) : (
                pluralize(_.size(node.spec.taints), 'Taint')
              )}
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_99')}</dt>
            <dd>
              {canUpdate ? (
                <Button variant="link" type="button" isInline onClick={Kebab.factory.ModifyAnnotations(NodeModel, node).callback.bind(null, t)}>
                  {t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_100', { 0: _.size(node.metadata.annotations) })}
                  <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                </Button>
              ) : (
                pluralize(_.size(node.metadata.annotations), 'Annotation')
              )}
            </dd>
            {machine.name && (
              <>
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_121')}</dt>
                <dd>
                  <ResourceLink kind={referenceForModel(MachineModel)} name={machine.name} namespace={machine.namespace} />
                </dd>
              </>
            )}
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_68')}</dt>
            <dd>{cloudProviderNames([cloudProviderID(node)])}</dd>
            {_.has(node, 'spec.unschedulable') && <dt>Unschedulable</dt>}
            {_.has(node, 'spec.unschedulable') && <dd className="text-capitalize">{_.get(node, 'spec.unschedulable', '-').toString()}</dd>}
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_43')}</dt>
            <dd>
              <Timestamp timestamp={node.metadata.creationTimestamp} />
            </dd>
          </dl>
        </div>
        <div className="col-md-6 col-xs-12">
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_69')}</dt>
            <dd className="text-capitalize">{_.get(node, 'status.nodeInfo.operatingSystem', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_114')}</dt>
            <dd>{_.get(node, 'status.nodeInfo.osImage', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_70')}</dt>
            <dd className="text-uppercase">{_.get(node, 'status.nodeInfo.architecture', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_71')}</dt>
            <dd>{_.get(node, 'status.nodeInfo.kernelVersion', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_72')}</dt>
            <dd>{_.get(node, 'status.nodeInfo.bootID', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_73')}</dt>
            <dd>{_.get(node, 'status.nodeInfo.containerRuntimeVersion', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_74')}</dt>
            <dd>{_.get(node, 'status.nodeInfo.kubeletVersion', '-')}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_75')}</dt>
            <dd>{_.get(node, 'status.nodeInfo.kubeProxyVersion', '-')}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsOverview;

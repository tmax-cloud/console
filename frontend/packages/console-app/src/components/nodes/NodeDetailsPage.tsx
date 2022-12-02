import * as React from 'react';
import { navFactory } from '@console/internal/components/utils';
import { PodsPage } from '@console/internal/components/pod';
import { ResourceEventStream } from '@console/internal/components/events';
import { DetailsPage } from '@console/internal/components/factory';
import { nodeStatus } from '../../status/node';
import NodeDetails from './NodeDetails';
import { MarkAsSchedulable, MarkAsUnschedulable } from './menu-actions';
import NodeDashboard from './node-dashboard/NodeDashboard';
import { NodeKind } from '@console/internal/module/k8s';
const { editResource, events, pods } = navFactory;
import { Kebab } from '@console/internal/components/utils';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';
import { isSingleClusterPerspective } from '@console/internal/hypercloud/perspectives';
import { useTranslation } from 'react-i18next';

const SHOW_ALERT_IN_SINGLECLUSTER_NODEPAGE = 'show-alert-in-singlecluster-nodepage';

const NodePodsTab: React.FC<NodePodsTabProps> = ({ obj }) => <PodsPage canCreate={false} showTitle={false} fieldSelector={`spec.nodeName=${obj.metadata.name}`} />;
type NodePodsTabProps = {
  obj: NodeKind;
};
const NodeDetailsPage: React.FC<React.ComponentProps<typeof DetailsPage>> = props => {
  const { t } = useTranslation();
  const [isAlert, setIsAlert] = React.useState(sessionStorage.getItem(SHOW_ALERT_IN_SINGLECLUSTER_NODEPAGE) === 'true');
  const pages = [
    {
      href: '',
      name: 'COMMON:MSG_DETAILS_TABOVERVIEW_1',
      component: NodeDashboard,
    },
    {
      href: 'details',
      name: 'COMMON:MSG_DETAILS_TAB_1',
      component: NodeDetails,
    },
    editResource(),
    pods(NodePodsTab),
    events(ResourceEventStream),
    // {
    //   href: 'terminal',
    //   name: 'COMMON:MSG_DETAILS_TAB_8',
    //   component: NodeTerminal,
    // },
  ];
  const { ModifyLabels, ModifyAnnotations, Edit } = Kebab.factory;
  const menuActions = [MarkAsSchedulable, MarkAsUnschedulable, ModifyLabels, ModifyAnnotations, Edit];
  return (
    <>
      {isAlert && isSingleClusterPerspective() && (
        <Alert
          variant="info"
          title={t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_5')}
          action={
            <AlertActionCloseButton
              onClose={() => {
                sessionStorage.setItem(SHOW_ALERT_IN_SINGLECLUSTER_NODEPAGE, 'false');
                setIsAlert(false);
              }}
            />
          }
        >
          {t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_6')}
        </Alert>
      )}
      <DetailsPage {...props} getResourceStatus={nodeStatus} menuActions={menuActions} pages={pages} />
    </>
  );
};
export default NodeDetailsPage;

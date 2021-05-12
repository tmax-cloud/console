import * as React from 'react';
import { navFactory } from '@console/internal/components/utils';
import { PodsPage } from '@console/internal/components/pod';
import { ResourceEventStream } from '@console/internal/components/events';
import { DetailsPage } from '@console/internal/components/factory';
import { nodeStatus } from '../../status/node';
import NodeDetails from './NodeDetails';
import NodeTerminal from './NodeTerminal';
import { menuActions } from './menu-actions';
import NodeDashboard from './node-dashboard/NodeDashboard';
import { useTranslation } from 'react-i18next';

const { editResource, events, pods } = navFactory;

// const pages = [
//   {
//     href: '',
//     name: 'Overview',
//     component: NodeDashboard,
//   },
//   {
//     href: 'details',
//     name: 'Details',
//     component: NodeDetails,
//   },
//   editResource(),
//   pods(({ obj }) => <PodsPage showTitle={false} fieldSelector={`spec.nodeName=${obj.metadata.name}`} />),
//   events(ResourceEventStream),
//   {
//     href: 'terminal',
//     name: 'Terminal',
//     component: NodeTerminal,
//   },
// ];
const NodeDetailsPage: React.FC<React.ComponentProps<typeof DetailsPage>> = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: '',
      name: t('COMMON:MSG_DETAILS_TABOVERVIEW_1'),
      component: NodeDashboard,
    },
    {
      href: 'details',
      name: t('COMMON:MSG_DETAILS_TAB_1'),
      component: NodeDetails,
    },
    editResource(),
    pods(({ obj }) => <PodsPage showTitle={false} fieldSelector={`spec.nodeName=${obj.metadata.name}`} />),
    events(ResourceEventStream),
    {
      href: 'terminal',
      name: t('COMMON:MSG_DETAILS_TAB_8'),
      component: NodeTerminal,
    },
  ];
  return <DetailsPage {...props} getResourceStatus={nodeStatus} menuActions={menuActions} pages={pages} />;
};

export default NodeDetailsPage;

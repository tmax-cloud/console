import * as React from 'react';
import * as _ from 'lodash-es';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import { withDashboardResources } from '../../with-dashboard-resources';
import { EventModel } from '../../../../models';
import { FirehoseResource, FirehoseResult } from '../../../utils';
import { EventKind } from '../../../../module/k8s';
import ActivityBody, { RecentEventsBody } from '@console/shared/src/components/dashboard/activity-card/ActivityBody';
import { useTranslation } from 'react-i18next';

const viewEvents = '/k8s/all-namespaces/events';
let eventsResource: FirehoseResource;

const RecentEvent = withDashboardResources(({ watchK8sResource, stopWatchK8sResource, resources }) => {
  React.useEffect(() => {
    watchK8sResource(eventsResource);
    return () => {
      stopWatchK8sResource(eventsResource);
    };
  }, [watchK8sResource, stopWatchK8sResource]);
  return <RecentEventsBody events={resources.events as FirehoseResult<EventKind[]>} moreLink={viewEvents} />;
});

export const ActivityCard: React.FC<{}> = React.memo(props => {
  const { t } = useTranslation();
  eventsResource = { isList: true, kind: EventModel.kind, prop: 'events', ...props };
  return (
    <DashboardCard gradient data-test-id="activity-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDACTIVITY_TITLE_1')}</DashboardCardTitle>
        <DashboardCardLink to={viewEvents}>{t('SINGLE:MSG_OVERVIEW_MAIN_CARDACTIVITY_ALL_1')}</DashboardCardLink>
      </DashboardCardHeader>
      <DashboardCardBody>
        <ActivityBody className="co-overview-dashboard__activity-body">
          <RecentEvent />
        </ActivityBody>
      </DashboardCardBody>
    </DashboardCard>
  );
});

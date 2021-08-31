import * as React from 'react';
import { ClipboardListIcon, HourglassStartIcon, HourglassHalfIcon, SyncAltIcon, BanIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
//import { ClipboardListIcon, HourglassStartIcon, HourglassHalfIcon, SyncAltIcon, BanIcon, ExclamationTriangleIcon, UnknownIcon } from '@patternfly/react-icons';
import { DASH } from '../../constants';
import { NO_STATUS } from '@console/dev-console/src/utils/hc-status-reducers';
import { YellowExclamationTriangleIcon } from './icons';
import StatusIconAndText from './StatusIconAndText';
import { ErrorStatus, InfoStatus, SuccessStatus } from './statuses';
//import { ErrorStatus, InfoStatus, ProgressStatus, SuccessStatus } from './statuses';
import { StatusComponentProps } from './types';
import * as DeletedIcon from '@console/internal/imgs/hypercloud/delete.svg';
import * as AwaitingIcon from '@console/internal/imgs/hypercloud/awaiting.svg';
import * as ChartFetchedIcon from '@console/internal/imgs/hypercloud/chartfetched.svg';
import * as ChartFetchFailedIcon from '@console/internal/imgs/hypercloud/chartfetchfailed.svg';
import * as InstallingIcon from '@console/internal/imgs/hypercloud/installing.svg';
import * as UpgradingIcon from '@console/internal/imgs/hypercloud/Upgrading.svg';
import * as DeployedIcon from '@console/internal/imgs/hypercloud/deployed.svg';
import * as DeployedFailedIcon from '@console/internal/imgs/hypercloud/deployedfailed.svg';
import * as TestingIcon from '@console/internal/imgs/hypercloud/testing.svg';
import * as TestFailedIcon from '@console/internal/imgs/hypercloud/testfailed.svg';
import * as TestedIcon from '@console/internal/imgs/hypercloud/tested.svg';
import * as RollingBackIcon from '@console/internal/imgs/hypercloud/rollingback.svg';
import * as RolledBackIcon from '@console/internal/imgs/hypercloud/rolledback.svg';
import * as RollBackFailedIcon from '@console/internal/imgs/hypercloud/rollbackfailed.svg';
import * as AppliedIcon from '@console/internal/imgs/hypercloud/applied.svg';
import * as DestroyedIcon from '@console/internal/imgs/hypercloud/destroyed.svg';
import * as ReadyIcon from '@console/internal/imgs/hypercloud/ready.svg';
import * as UnreadyIcon from '@console/internal/imgs/hypercloud/unready.svg';
import * as NotreadyIcon from '@console/internal/imgs/hypercloud/notready.svg';
import * as PlannedIcon from '@console/internal/imgs/hypercloud/planned.svg';
import * as CreatingIcon from '@console/internal/imgs/hypercloud/creating.svg';
import * as NormalIcon from '@console/internal/imgs/hypercloud/normal.svg';
import * as WarningIcon from '@console/internal/imgs/hypercloud/warning.svg';
import * as ScanningIcon from '@console/internal/imgs/hypercloud/scanning.svg';
import * as CancelledIcon from '@console/internal/imgs/hypercloud/cancelled,terminating.svg';
import * as WorkerIcon from '@console/internal/imgs/hypercloud/worker.svg';
import * as MasterIcon from '@console/internal/imgs/hypercloud/master.svg';
import * as LostIcon from '@console/internal/imgs/hypercloud/lost.svg';
import * as BoundIcon from '@console/internal/imgs/hypercloud/bound.svg';
import * as Cash_loop_back_offIcon from '@console/internal/imgs/hypercloud/cash_loop_back_off.svg';
import * as RunningIcon from '@console/internal/imgs/hypercloud/running.svg';
import * as UnknownIcon from '@console/internal/imgs/hypercloud/unknown.svg';
import * as ThrobberIcon from '@console/internal/imgs/hypercloud/throbber.svg';
//import * as ErrorIcon from '@console/internal/imgs/hypercloud/error.failure.failed.svg';

export const Status: React.FC<StatusProps> = ({ status, title, children, iconOnly, noTooltip, className }) => {
  const statusProps = { title: title || status, iconOnly, noTooltip, className };
  switch (status) {
    case 'New':
      return <StatusIconAndText {...statusProps} icon={<HourglassStartIcon />} />;

    case 'Pending':
    case 'Waiting':
      return <StatusIconAndText {...statusProps} icon={<HourglassHalfIcon />} />;

    case 'Awaiting':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-awaiting-icon" src={AwaitingIcon} />} />;

    case 'Planning':
      return <StatusIconAndText {...statusProps} icon={<ClipboardListIcon />} />;

    case 'ContainerCreating':
    case 'Creating':
    case 'UpgradePending':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-creating-icon" src={CreatingIcon} />} />;
    //return <ProgressStatus {...statusProps} />;

    case 'In Progress':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Signing':
    case 'Updating':
    case 'Deploying':
      return <StatusIconAndText {...statusProps} icon={<SyncAltIcon />} />;

    case 'Cancelled':
    case 'Deleting':
    case 'Expired':
    case 'Not Ready':
    case 'NotReady':
    case 'Terminating':
    case 'Rejected':
      return <StatusIconAndText {...statusProps} icon={<BanIcon />} />;

    case 'Resource Quota Deleted':
    case 'Namespace Deleted':
    case 'Cluster Template Deleted':
    case 'Role Binding Deleted':
    case 'Deleted':
    case 'Delete':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-deleted-icon" src={DeletedIcon} />} />;

    case 'Warning':
      return <StatusIconAndText {...statusProps} icon={<ExclamationTriangleIcon />} />;

    case 'RequiresApproval':
      return <StatusIconAndText {...statusProps} icon={<YellowExclamationTriangleIcon />} />;

    case 'ContainerCannotRun':
    case 'CrashLoopBackOff':
    case 'Critical':
    case 'ErrImagePull':
    case 'Error':
    case 'Failed':
    case 'Fail':
    case 'ImagePullBackOff':
    case 'InstallCheckFailed':
    case 'Lost':
    case 'UpgradeFailed':
    case 'Failure':
      //return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-error-icon" src={ErrorIcon} />} />;
      return <ErrorStatus {...statusProps}>{children}</ErrorStatus>;

    case 'Accepted':
    case 'Succeeded':
    case 'Active':
    case 'Bound':
    case 'Complete':
    case 'Completed':
    case 'Created':
    case 'Enabled':
    case 'Succeeded':
    case 'Up to date':
    case 'Provisioned as node':
    case 'Approved':
    case 'Success':
      return <SuccessStatus {...statusProps} />;

    case 'Info':
      return <InfoStatus {...statusProps}>{children}</InfoStatus>;

    case 'Unknown':
    case 'unknown':
      //return <StatusIconAndText {...statusProps} icon={<UnknownIcon />} />;
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-unknown-icon" src={UnknownIcon} />} />;

    case 'ChartFetched':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-chartfetched-icon" src={ChartFetchedIcon} />} />;
    case 'ChartFetchFailed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-chartfetchfailed-icon" src={ChartFetchFailedIcon} />} />;
    case 'Installing':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-installing-icon" src={InstallingIcon} />} />;
    case 'Upgrading':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-upgrading-icon" src={UpgradingIcon} />} />;
    case 'Deployed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-deployed-icon" src={DeployedIcon} />} />;
    case 'DeployedFailed':
    case 'DeployFailed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-deployedfailed-icon" src={DeployedFailedIcon} />} />;
    case 'Testing':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-testing-icon" src={TestingIcon} />} />;
    case 'TestFailed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-testfailed-icon" src={TestFailedIcon} />} />;
    case 'Tested':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-tested-icon" src={TestedIcon} />} />;
    case 'RollingBack':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-rollingback-icon" src={RollingBackIcon} />} />;
    case 'RolledBack':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-rolledback-icon" src={RolledBackIcon} />} />;
    case 'RollBackFailed':
    case 'RollbackFailed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-rollbackfailed-icon" src={RollBackFailedIcon} />} />;
    case 'Applied':
    case 'applied':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-applied-icon" src={AppliedIcon} />} />;
    case 'Destroyed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-destroyed-icon" src={DestroyedIcon} />} />;
    case 'Ready':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-ready-icon" src={ReadyIcon} />} />;
    case 'UnReady':
    case 'Unready':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-unready-icon" src={UnreadyIcon} />} />;
    case 'Notready':
    case 'NotReady':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-notready-icon" src={NotreadyIcon} />} />;
    case 'Planned':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-planned-icon" src={PlannedIcon} />} />;
    case 'Normal':
    case 'normal':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-normal-icon" src={NormalIcon} />} />;
    case 'Warning':
    case 'warning':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-warning-icon" src={WarningIcon} />} />;
    case 'Scanning':
    case 'scanning':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-scanning-icon" src={ScanningIcon} />} />;
    case 'Cancelled':
    case 'cancelled':
    case 'Terminating':
    case 'terminating':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-cancelled-icon" src={CancelledIcon} />} />;
    case 'Worker':
    case 'worker':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-worker-icon" src={WorkerIcon} />} />;
    case 'Master':
    case 'master':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-master-icon" src={MasterIcon} />} />;
    case 'Lost':
    case 'lost':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-lost-icon" src={LostIcon} />} />;
    case 'Bound':
    case 'bound':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-bound-icon" src={BoundIcon} />} />;
    case 'Cash_loop_back_off':
    case 'cash_loop_back_off':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-cash_loop_back_off-icon" src={Cash_loop_back_offIcon} />} />;
    case 'Running':
    case 'running':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-running-icon" src={RunningIcon} />} />;
    case NO_STATUS:
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-throbber-icon" src={ThrobberIcon} />} />;
    default:
      return <>{status || DASH}</>;
  }
};

export const StatusIcon: React.FC<StatusIconProps> = ({ status }) => <Status status={status} iconOnly />;

type StatusIconProps = {
  status: string;
};

type StatusProps = StatusComponentProps & {
  status: string;
};

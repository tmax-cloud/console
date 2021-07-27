import * as React from 'react';
import { ClipboardListIcon, HourglassStartIcon, HourglassHalfIcon, SyncAltIcon, BanIcon, ExclamationTriangleIcon, UnknownIcon } from '@patternfly/react-icons';
import { DASH } from '../../constants';
import { YellowExclamationTriangleIcon } from './icons';
import StatusIconAndText from './StatusIconAndText';
import { InfoStatus, SuccessStatus } from './statuses';
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
import * as PlannedIcon from '@console/internal/imgs/hypercloud/planned.svg';
import * as CreatingIcon from '@console/internal/imgs/hypercloud/creating.svg';
import * as ErrorIcon from '@console/internal/imgs/hypercloud/error.failure.failed.svg';

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
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-error-icon" src={ErrorIcon} />} />;
      //return <ErrorStatus {...statusProps}>{children}</ErrorStatus>;

    case 'Accepted':
    case 'Success':
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
      return <StatusIconAndText {...statusProps} icon={<UnknownIcon />} />;

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
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-rollbackfailed-icon" src={RollBackFailedIcon} />} />;
    case 'Applied':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-applied-icon" src={AppliedIcon} />} />;
    case 'Destroyed':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-destroyed-icon" src={DestroyedIcon} />} />;
    case 'Ready':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-ready-icon" src={ReadyIcon} />} />;
    case 'Unready':
    case 'UnReady':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-unready-icon" src={UnreadyIcon} />} />;
    case 'Planned':
      return <StatusIconAndText {...statusProps} icon={<img className="font-icon co-status-planned-icon" src={PlannedIcon} />} />;

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

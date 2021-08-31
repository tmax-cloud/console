import * as React from 'react';
import { ClipboardListIcon, HourglassStartIcon, HourglassHalfIcon, SyncAltIcon, BanIcon, ExclamationTriangleIcon, UnknownIcon } from '@patternfly/react-icons';
import { DASH } from '../../constants';
import { NO_STATUS } from '@console/dev-console/src/utils/hc-status-reducers';
import { YellowExclamationTriangleIcon } from './icons';
import StatusIconAndText from './StatusIconAndText';
import { ErrorStatus, InfoStatus, ProgressStatus, SuccessStatus } from './statuses';
import { StatusComponentProps } from './types';
import * as DeletedIcon from '@console/internal/imgs/hypercloud/delete.svg';
import * as AwaitingIcon from '@console/internal/imgs/hypercloud/awaiting.svg';
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
      return <ProgressStatus {...statusProps} />;

    case 'In Progress':
    case 'Installing':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Signing':
    case 'Updating':
    case 'Upgrading':
      return <StatusIconAndText {...statusProps} icon={<SyncAltIcon />} />;

    case 'Cancelled':
    case 'Deleting':
    case 'Expired':
    case 'Not Ready':
    case 'NotReady':
    case 'Terminating':
    case 'Rejected':
      return <StatusIconAndText {...statusProps} icon={<BanIcon />} />;

    case 'Namespace Deleted':
    case 'Cluster Template Deleted':
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
      return <ErrorStatus {...statusProps}>{children}</ErrorStatus>;

    case 'Accepted':
    case 'Success':
    case 'Active':
    case 'Bound':
    case 'Complete':
    case 'Completed':
    case 'Created':
    case 'Enabled':
    case 'Succeeded':
    case 'Ready':
    case 'Up to date':
    case 'Provisioned as node':
    case 'Approved':
    case 'Success':
      return <SuccessStatus {...statusProps} />;

    case 'Info':
      return <InfoStatus {...statusProps}>{children}</InfoStatus>;

    case 'Unknown':
      return <StatusIconAndText {...statusProps} icon={<UnknownIcon />} />;
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

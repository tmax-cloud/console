import * as React from 'react';
import {
  AngleDoubleRightIcon,
  BanIcon,
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  PendingIcon,
  SyncAltIcon
} from '@patternfly/react-icons';
import {
  getRunStatusColor,
  runStatus
} from '../../../../utils/pipeline-augment';

interface StatusIconProps {
  status: string;
  height?: number;
  width?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, ...props }) => {
  
  switch (status) {
    case 'InProgress':
      return <SyncAltIcon {...props} className="fa-spin" />;
    case runStatus['In Progress']:
      return <SyncAltIcon {...props} className="fa-spin" />;
    case runStatus.Running:
      return <SyncAltIcon {...props} className="fa-spin" />;

    case runStatus.Succeeded:
      return <CheckCircleIcon {...props} />;

    // case runStatus.Failed:
    //   return <ExclamationCircleIcon {...props} />;
    default:
      return <ExclamationCircleIcon {...props} />;
    // case runStatus.Idle:
    // case runStatus.Pending:
    //   return <PendingIcon {...props} />;

    // case runStatus.Cancelled:
    //   return <BanIcon {...props} />;

    // case runStatus.Skipped:
    //   return <AngleDoubleRightIcon {...props} />;

    // default:
    //   return <CircleIcon {...props} />;
  }
};

export const ColoredStatusIcon: React.FC<StatusIconProps> = ({
  status,
  ...others
}) => {
  let iconColor;
  switch (status) {
    case 'Succeeded':
      iconColor = '#4D8AFF';
      break;
    // case 'Failed':
    //   iconColor = '#FD5461';
    //   break;
    case 'Running':
      iconColor = '#4BBBCF';
      break;
    default:
      iconColor = '#FD5461';
      break;
  }
  return (
    <div
      style={{
        // color: status
        //   ? getRunStatusColor(status).pftoken.value
        //   : getRunStatusColor(runStatus.Cancelled).pftoken.value
        color: iconColor
      }}
    >
      <StatusIcon status={status} {...others} />
    </div>
  );
};

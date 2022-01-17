import * as React from 'react';
import { Popover } from '@patternfly/react-core';
import { Status } from '@console/shared';

// TODO: 에러 상세 메시지 국문화 적용
const ErrorPopover: React.FC<ErrorPopoverProps> = props => {
  const { status, reason, children } = props;
  return (
    <Popover headerContent={<div>에러 상세</div>} bodyContent={<div>{reason}</div>} maxWidth="30rem" position="right">
      <div style={{ width: 'fit-content', cursor: 'pointer', color: '#0066CC' }}>{children || <Status status={status} />}</div>
    </Popover>
  );
};

export const ErrorPopoverStatus: React.FC<Props> = props => {
  const { error, status, reason, children } = props;
  const normal = children ? <>{children}</> : <Status status={status} />;
  return error ? <ErrorPopover status={status} reason={reason} children={children} /> : normal;
};

interface ErrorPopoverProps {
  status?: string;
  reason: string;
  children?: React.ReactNode;
}

interface ErrorPopoverStatusProps {
  error: boolean;
}

type Props = ErrorPopoverProps & ErrorPopoverStatusProps;

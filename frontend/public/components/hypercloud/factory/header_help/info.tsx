import * as React from 'react';
import { HeaderCellInfoWrapper } from './HeaderCellInfoWrapper';
import { IFormatterValueType, ITransform } from '@patternfly/react-table';
import './table.css'
import { TooltipProps } from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';

export const info = ({ tooltip, tooltipProps, popover, popoverProps, className, ariaLabel }: ThInfoType) => {
  const infoObj: ITransform = (value: IFormatterValueType) => ({
    className: "pf-m-help",
    children: tooltip ? (
      <HeaderCellInfoWrapper
        variant="tooltip"
        info={tooltip}
        tooltipProps={tooltipProps}
        ariaLabel={ariaLabel}
        className={className}
      >
        {value as React.ReactNode}
      </HeaderCellInfoWrapper>
    ) : (
      <HeaderCellInfoWrapper
        variant="popover"
        info={popover}
        popoverProps={popoverProps}
        ariaLabel={ariaLabel}
        className={className}
      >
        {value as React.ReactNode}
      </HeaderCellInfoWrapper>
    )
  });

  return infoObj;
};


export interface ThInfoType {
  tooltip?: React.ReactNode;
  tooltipProps?: Omit<TooltipProps, 'content'>;
  popover?: React.ReactNode;
  popoverProps?: Omit<PopoverProps, 'bodyContent'>;
  ariaLabel?: string;
  className?: string;
}

import * as React from 'react';
import LongArrowAltUpIcon from '@patternfly/react-icons/dist/js/icons/long-arrow-alt-up-icon';
import LongArrowAltDownIcon from '@patternfly/react-icons/dist/js/icons/long-arrow-alt-down-icon';
import ArrowsAltVIcon from '@patternfly/react-icons/dist/js/icons/arrows-alt-v-icon';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table';
import { SortByDirection } from '@patternfly/react-table';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { Tooltip } from '@patternfly/react-core';
import './help.scss';
export interface SortColumnProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  isSortedBy?: boolean;
  onSort?: Function;
  sortDirection?: string;
  tooltipHelp?: React.ReactNode;
}

export const SortColumn: React.FunctionComponent<SortColumnProps> = ({ children = null, className = '', tooltipHelp, isSortedBy = false, onSort = null, sortDirection = '', ...props }: SortColumnProps) => {
  let SortedByIcon;
  if (isSortedBy) {
    SortedByIcon = sortDirection === SortByDirection.asc ? LongArrowAltUpIcon : LongArrowAltDownIcon;
  } else {
    SortedByIcon = ArrowsAltVIcon;
  }
  return (
    <button {...props} className={css(className)} onClick={event => onSort && onSort(event)}>
      {children}
      <span className={css(styles.tableSortIndicator)}>
        <SortedByIcon />
      </span>
      <Tooltip content={tooltipHelp['tooltip']}>
        <HelpIcon className="help-icon" />
      </Tooltip>
    </button>
  );
};

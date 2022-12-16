import * as React from 'react';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table';
import buttonStyles from '@patternfly/react-styles/css/components/Button/button';
import { SortByDirection } from '@patternfly/react-table';
import { SortColumn } from './sortColumn';

export const sortableHelp = (label: React.ReactNode, { tooltip, columnIndex, column, property }: IExtra) => {
  const {
    extraParams: { sortBy, onSort },
  } = column;
  const extraData = {
    columnIndex,
    column,
    property,
  };
  const isSortedBy = sortBy && columnIndex === sortBy.index;
  /**
   * @param {React.MouseEvent} event - React mouse event
   */
  console.log('$$$$', typeof label, typeof columnIndex, typeof column, typeof property);
  function sortClicked(event) {
    let reversedDirection;

    if (!isSortedBy) {
      reversedDirection = SortByDirection.asc;
    } else {
      reversedDirection = sortBy.direction === SortByDirection.asc ? SortByDirection.desc : SortByDirection.asc;
    } // tslint:disable-next-line:no-unused-expression

    onSort && onSort(event, columnIndex, reversedDirection, extraData);
  }

  return {
    className: css(styles.tableSort, isSortedBy && styles.modifiers.selected),
    'aria-sort': isSortedBy ? `${sortBy.direction}ending` : 'none',
    children: React.createElement(
      SortColumn,
      {
        isSortedBy: isSortedBy,
        sortDirection: isSortedBy ? sortBy.direction : '',
        onSort: sortClicked,
        className: css(buttonStyles.button, buttonStyles.modifiers.plain),
      },
      label,
    ),
  };
};

export interface IExtra {
  columnIndex?: number;
  column?: any;
  property?: string;
  tooltip?: React.ReactNode;
}

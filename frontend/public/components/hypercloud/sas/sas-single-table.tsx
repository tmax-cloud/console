import * as React from 'react';
import * as _ from 'lodash-es';
import { Table as PfTable, TableHeader as PfTableHeader, TableBody as PfTableBody, sortable, SortByDirection } from '@patternfly/react-table';
import { TFunction } from 'i18next';
import { sortableHelp } from '../utils/sortTip';
import { useTranslation } from 'react-i18next';

const makeTableHeader = (header: Header[], t: TFunction) => {
  const _header: Header[] = header.map(value => ({
    ...value,
    title: t(value.title),
    transforms: _.isUndefined(value.tooltip) ? (_.isUndefined(value.transforms) ? [sortable] : value.transforms) : [sortableHelp({ tooltip: t(value.tooltip) })],
    props: value.props,
  }));
  return () => {
    return _header;
  };
};

export const SingleSasTable: React.FC<SingleExpandableTableProps> = ({ header, itemList, rowRenderer }) => {
  const [tableRows, setTableRows] = React.useState([]);
  const { t } = useTranslation();
  const headerFunc = makeTableHeader(header, t);
  const [sortBy, setSortBy] = React.useState<PFSortState>({});
  React.useEffect(() => {
    const preData = [];
    itemList
      .reduce((result, item, index: number) => {
        return result.then(async () => {
          preData.push({
            isOpen: false,
            cells: rowRenderer(index, item),
          });
        });
      }, Promise.resolve())
      .then(() => {
        setTableRows(_.cloneDeep(preData));
      });
  }, [itemList]);

  const sortRows = async ({ index, sortField, direction }, outerTableRow) => {
    const sortedRows = outerTableRow.sort((a, b) => {
      const compA = typeof a.cells[index].title === 'object' ? a.cells[index].title.props[sortField] : a.cells[index].title;
      const compB = typeof b.cells[index].title === 'object' ? b.cells[index].title.props[sortField] : b.cells[index].title;
      return compA < compB ? -1 : compA > compB ? 1 : 0;
    });
    const newOuterTableRow = direction === SortByDirection.asc ? sortedRows : sortedRows.reverse();
    setTableRows(newOuterTableRow);
  };

  const onSort = (_event, index, direction, extraData) => {
    const sortField = extraData.column.data;
    sortRows({ index, sortField, direction }, tableRows);
    setSortBy({ index, sortField, direction });
  };

  return (
    <PfTable aria-label="Compound expandable table" rows={tableRows} cells={headerFunc()} onSort={onSort} sortBy={sortBy}>
      <PfTableHeader />
      <PfTableBody />
    </PfTable>
  );
};

type Header = {
  title: string;
  sortField?: string;
  sortFunc?: string;
  transforms?: any;
  props?: { className: string };
  tooltip?: string;
};

type SingleExpandableTableProps = {
  itemList: any[];
  rowRenderer: (index, obj) => any[];
  innerRenderer?: (parentItem) => any;
  header: Header[];
  compoundParent?: number;
  customSorts?: { [key: string]: any };
};
type PFSortState = {
  index?: number;
  sortField?: any;
  direction?: SortByDirection;
};

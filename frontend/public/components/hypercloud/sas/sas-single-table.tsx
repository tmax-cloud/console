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

export const SingleSasTable: React.FC<SingleExpandableTableProps> = ({ header, itemList, rowRenderer, innerRenderer, compoundParent }) => {
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
    //tableRows의 홀수 행만 outerTable의 값 : index는 0,2....
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
  itemList: any[]; // outer table의 itemList
  rowRenderer: (index, obj) => any[]; // outer table의 row 한줄에 들어갈 요소들을 배열 형태로 return하는 renderer 함수
  innerRenderer?: (parentItem) => any; // inner table을 render하는 함수(ExpandableInnerTable 컴포넌트 사용해야됨)
  header: Header[]; // header column들의 배열. 펼침 기능을 사용할 column object에는 cellTransforms: [compoundExpand] 속성 넣어줘야 함.
  compoundParent?: number; // table 펼칠 수 있는 column의 index
  customSorts?: { [key: string]: any };
};
type PFSortState = {
  index?: number;
  sortField?: any;
  direction?: SortByDirection;
};

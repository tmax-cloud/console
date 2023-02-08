import * as React from 'react';
import * as _ from 'lodash-es';
import { Table as PfTable, TableHeader as PfTableHeader, TableBody as PfTableBody, ICell, sortable, SortByDirection } from '@patternfly/react-table';
import { TFunction } from 'i18next';
import { sortableHelp } from './sortTip';
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

export const SingleExpandableTable: React.FC<SingleExpandableTableProps> = ({ header, itemList, rowRenderer, innerRenderer, compoundParent }) => {
  const [tableRows, setTableRows] = React.useState([]);
  const { t } = useTranslation();
  const headerFunc = makeTableHeader(header, t);
  const [sortBy, setSortBy] = React.useState<PFSortState>({});
  const [outerTableRows, setOuterTableRows] = React.useState([]);

  // itemList : KafkaMirrorMaker2 원본 리소스 리스트
  React.useEffect(() => {
    const preData = [];
    itemList
      .reduce((result, item, index: number) => {
        return result.then(async () => {
          const innerTable = await innerRenderer(item);
          if (innerTable) {
            preData.push({
              isOpen: false,
              cells: rowRenderer(index, item, innerTable.props?.data?.length),
            });

            if (innerTable.props?.data?.length > 0) {
              const parentValue = index * 2;
              preData.push({
                parent: parentValue,
                compoundParent,
                cells: [
                  {
                    title: innerTable,
                    props: { colSpan: header.length, className: 'pf-m-no-padding' },
                  },
                ],
              });
            } else {
              const parentValue = index * 2;
              preData.push({
                parent: parentValue,
                compoundParent,
                cells: [
                  {
                    title: <div>...No Data...</div>,
                    props: { colSpan: header.length, className: 'pf-m-no-padding' },
                  },
                ],
              });
            }
          }
        });
      }, Promise.resolve())
      .then(() => {
        setTableRows(_.cloneDeep(preData));
      });
  }, [compoundParent, header.length, innerRenderer, itemList, rowRenderer]);
  //
  const onExpand = (_event, rowIndex, colIndex, isOpen, _rowData, _extraData) => {
    const rows = _.cloneDeep(tableRows);
    if (!isOpen) {
      rows[rowIndex].cells.forEach((cell: ICell) => {
        if (cell.props) {
          cell.props.isOpen = false;
        }
      });
      (rows[rowIndex].cells[colIndex] as ICell).props.isOpen = true;
      rows[rowIndex].isOpen = true;
    } else {
      (rows[rowIndex].cells[colIndex] as ICell).props.isOpen = false;
      rows[rowIndex].isOpen = rows[rowIndex].cells.some((cell: ICell) => cell.props && cell.props.isOpen);
    }
    setTableRows(rows);
  };

  const sortRows = ({ index, sortField, direction }, outerTableRows) => {
    const sortedRows = outerTableRows.sort((a, b) => {
      const compA = typeof a.cells[index].title === 'object' ? a.cells[index].title.props[sortField] : a.cells[index].title,
        compB = typeof b.cells[index].title === 'object' ? b.cells[index].title.props[sortField] : b.cells[index].title;
      return compA < compB ? -1 : compA > compB ? 1 : 0;
    });
    setOuterTableRows(direction === SortByDirection.asc ? sortedRows : sortedRows.reverse());
  };

  const onSort = (_event, index, direction, extraData) => {
    const sortField = extraData.column.data;
    //tableRows의 홀수 행만 outerTable의 값 : index는 0,2....
    _.cloneDeep(tableRows).map((row, idx) => {
      if (idx % 2 === 0) {
        outerTableRows.push(row);
      }
    });
    sortRows({ index, sortField, direction }, outerTableRows);
    setSortBy({ index, sortField, direction });
  };

  return (
    <PfTable aria-label="Compound expandable table" onExpand={onExpand} rows={tableRows} cells={headerFunc()} onSort={onSort} sortBy={sortBy}>
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
  rowRenderer: (index, obj, itemCount: number) => any[]; // outer table의 row 한줄에 들어갈 요소들을 배열 형태로 return하는 renderer 함수
  innerRenderer: (parentItem) => any; // inner table을 render하는 함수(ExpandableInnerTable 컴포넌트 사용해야됨)
  header: Header[]; // header column들의 배열. 펼침 기능을 사용할 column object에는 cellTransforms: [compoundExpand] 속성 넣어줘야 함.
  compoundParent: number; // table 펼칠 수 있는 column의 index
  customSorts?: { [key: string]: any };
};
type PFSortState = {
  index?: number;
  sortField?: any;
  direction?: SortByDirection;
};

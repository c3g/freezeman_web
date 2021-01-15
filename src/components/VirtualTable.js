import React, { useState, useEffect, useRef } from 'react';

import {Table} from "antd";
import 'antd/dist/antd.css';
import "antd/es/pagination/style/css";
import "antd/es/table/style/css";

import {VariableSizeGrid} from 'react-window';
import ResizeObserver from 'rc-resize-observer';
import classNames from 'classnames';

const pageSize = 20;

function VirtualTable ({
   columns,
   items,
   itemsByID,
   rowKey = 'id',
   loading,
   totalCount,
   page,
   filters,
   sortBy,
   onLoad,
   onChangeSort,
 }) {
  const scroll = {y: 400};
  const tableHeight = scroll.y;
  const rowHeight = 50;
  const [tableWidth, setTableWidth] = useState(0);
  const widthColumnCount = columns.filter(({ width }) => !width).length;
  const mergedColumns = columns.map((column) => {
    if (column.width) {
      return column;
    }

    return { ...column, width: Math.floor(tableWidth / widthColumnCount) };
  });
  const gridRef = useRef();
  const [connectObject] = useState(() => {
    const obj = {};
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => null,
      set: (scrollLeft) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({
            scrollLeft,
          });
        }
      },
    });
    return obj;
  });

  const resetVirtualGrid = () => {
    if(gridRef.current){
      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        shouldForceUpdate: false,
      });
    }
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (rawData, { scrollbarSize, ref, onScroll }) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * rowHeight;
    return (
      <VariableSizeGrid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index) => {
          const { width } = mergedColumns[index];
          return totalHeight > scroll.y && index === mergedColumns.length - 1
            ? width - scrollbarSize - 1
            : width;
        }}
        height={tableHeight}
        rowCount={rawData.length}
        rowHeight={() => rowHeight}
        width={tableWidth}
        scrollToFirstRowOnChange={false}
        onScroll={(scroller) => {
          let scrollerHeight = scroller.scrollTop;
          let height = rawData.length * 40;
          let heightPercent = scrollerHeight/height;
          console.log('scroler',scroller);
          if(heightPercent > 0.8){
            // Loading more data by increasing page
            setCurrentPage(currentPage + 1);
          }
        }}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div
            className={classNames('virtual-table-cell', {
              'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
            })}
            style={style}
          >
            {rawData[rowIndex][mergedColumns[columnIndex].dataIndex]}
          </div>
        )}
      </VariableSizeGrid>
    );
  };

  const filtersRef = useRef(filters);
  const sortByRef = useRef(sortBy);
  const [currentPage, setCurrentPage] = useState(1);
  const nextPage = currentPage + 1;
  const nextPageEndIndex = nextPage * pageSize;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex   = Math.min((currentPage) * pageSize, totalCount);

  const isLastPage = endIndex >= totalCount;

  const dataSource = items.map(id => itemsByID[id]);

  const hasUnloadedItems = dataSource.some(d => d === undefined);
  const isCurrentPageUnloaded = ((endIndex - 1) > items.length) || hasUnloadedItems;
  const doesNextPageContainUnloaded = !isLastPage && nextPageEndIndex > items.length && items.length < totalCount;
  const shouldLoadNextChunk =
    !loading && (isCurrentPageUnloaded || doesNextPageContainUnloaded);

  if (shouldLoadNextChunk) {
    let offset

    if (isCurrentPageUnloaded)
      offset = Math.floor(startIndex / page.limit) * page.limit;
    else if (doesNextPageContainUnloaded)
      offset = items.length;

    setTimeout(() => onLoad({ offset }), 0);
  }

  if (sortByRef.current !== sortBy) {
    setCurrentPage(1)
    sortByRef.current = sortBy
  }
  if (filtersRef.current !== filters) {
    setCurrentPage(1)
    filtersRef.current = filters
  }

  const onChangeTable = (pagination, filters, sorter) => {
    const key = sorter.column?.dataIndex
    const order = sorter.order
    if (sortBy.key !== key || sortBy.order !== order)
      onChangeSort(key, order)
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        className="virtual-table"
        size="small"
        bordered={true}
        scroll={scroll}
        columns={mergedColumns}
        pagination={false}
        dataSource={dataSource}
        rowKey={rowKey}
        // loading={loading && isCurrentPageUnloaded}
        loading={isCurrentPageUnloaded || doesNextPageContainUnloaded}
        childrenColumnName={'UNEXISTENT_KEY'}
        onChange={onChangeTable}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
}

export default VirtualTable;
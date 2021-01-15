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
  const dataSource = items.map(id => itemsByID[id]);

  const scroll = { y: 400 };
  const rowHeight = 50;
  const tableHeight = scroll.y;
  const [tableWidth, setTableWidth] = useState(0);

  const mergedColumns = getMergedColumns(columns, tableWidth)

  const gridRef = useRef();

  const resetVirtualGrid = () => {
    if (gridRef.current) {
      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        shouldForceUpdate: false,
      });
    }
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const filtersRef = useRef(filters);
  const sortByRef = useRef(sortBy);
  const [currentPage, setCurrentPage] = useState(1);

  const info =
    getPageInfo(dataSource, loading, currentPage, pageSize, totalCount, page)

  if (info.shouldLoadNextChunk) {
    console.log('load', info.offset)
    setTimeout(() => onLoad({ offset: info.offset }), 0);
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

  const [connectObject] = useState(() => {
    const obj = {};
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => null,
      set: scrollLeft => {
        if (gridRef.current) {
          gridRef.current.scrollTo({
            scrollLeft,
          });
        }
      },
    });
    return obj;
  });

  const renderVirtualList = (rawData, { scrollbarSize, ref }) => {
    ref.current = connectObject;

    const totalHeight = rawData.length * rowHeight;
    const getColumnWidth = index => {
      const { width } = mergedColumns[index];
      return totalHeight > scroll.y && index === mergedColumns.length - 1
        ? width - scrollbarSize - 1
        : width + 1;
    }

    return (
      <VariableSizeGrid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={getColumnWidth}
        height={tableHeight}
        rowCount={totalCount}
        rowHeight={() => rowHeight}
        width={tableWidth}
        scrollToFirstRowOnChange={false}
        onItemsRendered={props => {
          const isOverThreshold =
            props.visibleRowStopIndex > (dataSource.length - 10)
          const shouldLoadNext = !loading && isOverThreshold
          if (shouldLoadNext)
            setCurrentPage(currentPage + 1);
        }}
      >
        {({ columnIndex, rowIndex, style }) => {
          const column = mergedColumns[columnIndex]
          const item = rawData[rowIndex]
          const isLoading = item === undefined
          const field = item?.[column.dataIndex]
          const content =
            !isLoading ?
              (column?.render?.(field, item, rowIndex) ?? field) :
              <div className='ph-item'>
                <div className='ph-row'>
                  <div className='ph-col-12' />
                </div>
              </div>

          return (
            <div
              className={classNames('virtual-table-cell', {
                'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                'virtual-table-cell-loading': isLoading,
              })}
              style={style}
            >
              {content}
            </div>
          )
        }}
      </VariableSizeGrid>
    );
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
        loading={loading && dataSource.length === 0}
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


// Helpers

function getMergedColumns(columns, tableWidth) {
  const widthColumnCount = columns.filter(c => !c.width).length;
  return columns.map(column => {
    if (column.width) {
      return column;
    }
    return { ...column, width: Math.floor(tableWidth / widthColumnCount) }
  })
}

function getPageInfo(dataSource, loading, currentPage, pageSize, totalCount, page) {
  const nextPage = currentPage + 1;
  const nextPageEndIndex = nextPage * pageSize;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex   = Math.min(currentPage * pageSize, totalCount);

  const isLastPage = endIndex >= totalCount;

  // const hasUnloadedItems = dataSource.some(d => d === undefined);
  const hasUnloadedItems = false;
  const isCurrentPageUnloaded = ((endIndex - 1) > dataSource.length) || hasUnloadedItems;
  const doesNextPageContainUnloaded = !isLastPage && nextPageEndIndex > dataSource.length && dataSource.length < totalCount;
  const shouldLoadNextChunk =
    !loading && (isCurrentPageUnloaded || doesNextPageContainUnloaded);

  let offset = dataSource.length

  return {
    shouldLoadNextChunk,
    offset,
  }
}

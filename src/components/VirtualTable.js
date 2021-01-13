import React, { useState, useEffect, useRef } from 'react';

import {Table} from "antd";
import 'antd/dist/antd.css';
import "antd/es/pagination/style/css";
import "antd/es/table/style/css";

import ResizeObserver from 'rc-resize-observer';


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
  const scroll = {y: 600};


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

  const tableBody = document.querySelector(".ant-table-body")
  if(tableBody){
    tableBody.addEventListener("scroll", event => {
      const scroller = event.target;
      let height = scroller.scrollHeight - scroller.clientHeight;
      if(scroller.scrollTop > height - 100){
        // Loading more data by increasing page
        setCurrentPage(currentPage + 1);
      }
      console.log('ITEMS LENGTH', items.length)
      console.log('scrollTop', scroller.scrollTop)
      console.log('height', height)

    })
  }

  return (
    <div>
      <Table
        key={dataSource.length}
        className="virtual-table"
        size="small"
        bordered={true}
        scroll={scroll}
        columns={columns}
        pagination={false}
        //dataSource={hasUnloadedItems ? [] : dataSource}
        dataSource={dataSource}
        rowKey={rowKey}
        scroll={{y: 600}}
        loading={loading && isCurrentPageUnloaded}
        //loading={loading}
        childrenColumnName={'UNEXISTENT_KEY'}
        onChange={onChangeTable}
        // components={{
        //   body: renderVirtualList,
        // }}
      />
      <span> {items.length} ITEMS </span>
    </div>

  );
}

export default VirtualTable;
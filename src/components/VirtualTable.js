import React, { useState, useRef, useCallback } from 'react';
import {debounce} from "debounce";
import {throttle} from "throttle-debounce";
import {Table} from "antd";
import 'antd/dist/antd.css';
import "antd/es/pagination/style/css";
import "antd/es/table/style/css";


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

  const loadNextChunk = useCallback(debounce(() => {
    let offset

    if (isCurrentPageUnloaded)
      offset = Math.floor(startIndex / page.limit) * page.limit;
    else if (doesNextPageContainUnloaded)
      offset = items.length;

    setTimeout(() => onLoad({ offset }), 0);
  }, 200))

  if (shouldLoadNextChunk) {
    loadNextChunk();
  }

  const addData = throttle(2000, () => {
      setCurrentPage(currentPage + 1);
  })

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
      const height = scroller.scrollHeight - scroller.clientHeight;
      const scrollTop = scroller.scrollTop
      // Loading more data by increasing page
      if(scrollTop/height > 0.8  && !isCurrentPageUnloaded && !loading){
        addData();
      }


    })
  }

  return (
    <div>
      <Table
        className="virtual-table"
        size="small"
        bordered={true}
        scroll={scroll}
        columns={columns}
        pagination={false}
        dataSource={dataSource}
        rowKey={rowKey}
        scroll={{y: 600}}
        loading={isCurrentPageUnloaded}
        //loading={loading && isCurrentPageUnloaded}
        childrenColumnName={'UNEXISTENT_KEY'}
        onChange={onChangeTable}
      />
      <span> {items.length} ITEMS </span>
    </div>

  );
}

export default VirtualTable;
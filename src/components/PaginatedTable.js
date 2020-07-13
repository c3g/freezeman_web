import React, { useState } from "react";

import {Pagination, Table} from "antd";
import "antd/es/pagination/style/css";
import "antd/es/table/style/css";

const pageSize = 10;

function PaginatedTable ({
    columns,
    items,
    itemsByID,
    rowKey = 'id',
    loading,
    totalCount,
    page,
    onLoad,
  }) {

  const [currentPage, setCurrentPage] = useState(1);
  const nextPage = currentPage + 1;
  const nextPageEndIndex = nextPage * pageSize;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex   = Math.min((currentPage) * pageSize, totalCount);

  const isLastPage = endIndex >= totalCount;

  const dataSource =
    items.slice(startIndex, endIndex)
      .map(id => itemsByID[id]);

  const hasUnloadedItems = dataSource.some(d => d === undefined);

  const isCurrentPageUnloaded = ((endIndex - 1) > items.length) || hasUnloadedItems;

  const doesNextPageContainUnloaded = !isLastPage && nextPageEndIndex > items.length;

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


  const onChangePage = (page, pageSize) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Table size="small"
        bordered={true}
        pagination={false}
        columns={columns}
        dataSource={hasUnloadedItems ? [] : dataSource}
        rowKey={rowKey}
        loading={loading && isCurrentPageUnloaded}
        childrenColumnName={'UNEXISTENT_KEY'}
      />
      <Pagination
        className="ant-table-pagination ant-table-pagination-right"
        showSizeChanger={false}
        showQuickJumper={true}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        current={currentPage}
        pageSize={pageSize}
        total={totalCount}
        onChange={onChangePage}
      />
    </>
  );
}

export default PaginatedTable;
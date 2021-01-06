import React, {useRef, useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Input, Select, Space} from "antd";
import "antd/es/button/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/space/style/css";
import {SearchOutlined} from "@ant-design/icons";

import {FILTER_TYPE} from "../../constants";

export default function getFilterProps(column, descriptions, filters, setFilter, clearStoreFilters) {
  const description = descriptions[column.dataIndex];
  if (!description)
    return undefined;
  switch (description.type) {
    case FILTER_TYPE.INPUT:
      return getInputFilterProps(column, descriptions, filters, setFilter, clearStoreFilters)
    case FILTER_TYPE.RANGE:
      return undefined // FIXME implement this
    case FILTER_TYPE.SELECT:
      if (description.mode === 'multiple')
        return getSelectMultipleFilterProps(column, descriptions, filters, setFilter, clearStoreFilters)
      else
        return undefined // FIXME implement this
        // return getSelectOneFilterProps(column, descriptions, filters, setFilter, clearStoreFilters)
  }
  throw new Error(`unreachable: ${description.type}`)
}

function getInputFilterProps(column, descriptions, filters, setFilter, clearStoreFilters) {
  const dataIndex = column.dataIndex;
  const description = descriptions[dataIndex];

  const selectRef = useRef()

  const onSearch = (selectedKeys, confirm, dataIndex) => {
    setFilter(dataIndex, selectedKeys[0])
    confirm()
  }

  const onReset = clearFilters => {
    clearStoreFilters()
    clearFilters()
  };

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={selectRef}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => onSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => onSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => onReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: getFilterIcon,
    /* onFilter: (value, record) =>
     *   record[dataIndex]
     *     ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
     *     : '', */
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => selectRef?.current.select(), 100);
      }
    },
    /* render: text =>
     *   this.state.searchedColumn === dataIndex ? (
     *     <Highlighter
     *       highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
     *       searchWords={[this.state.searchText]}
     *       autoEscape
     *       textToHighlight={text ? text.toString() : ''}
     *     />
     *   ) : (
     *     text
     *   ), */
  }
}

function getSelectMultipleFilterProps(column, descriptions, filters, setFilter, clearStoreFilters) {
  const dataIndex = column.dataIndex;
  const description = descriptions[dataIndex];

  const selectRef = useRef()

  const onSearch = (selectedKeys, confirm, dataIndex) => {
    setFilter(dataIndex, selectedKeys)
    confirm()
  }

  const onReset = clearFilters => {
    clearStoreFilters()
    clearFilters()
  };

  const options = description.options || column.options || []

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Space style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => onSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => onReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
        <Select
          ref={selectRef}
          placeholder={`Select ${column.title}`}
          allowClear
          mode='multiple'
          options={options}
          value={selectedKeys}
          onChange={e => setSelectedKeys(e)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
      </div>
    ),
    filterIcon: getFilterIcon,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => selectRef?.current.focus(), 100);
      }
    },
  }
}



function getFilterIcon(filtered) {
  return <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
}

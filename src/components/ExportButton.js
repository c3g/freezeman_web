import React from "react";
import {downloadFromText, downloadFromURL} from "../utils/download";
import csvStringify from "csv-stringify/lib/sync";

import {Button} from "antd";
import "antd/es/button/style/css";

import { DownloadOutlined } from "@ant-design/icons";


export const ExportFromTextButton = ({ exportFunction, filename }) => {
  let name = filename + '_' + new Date().toISOString().slice(0,10) + '.csv'
  const onClick = () => {
    exportFunction()
      .then(res => res.data)
      .then(items => {
        const csvText = csvStringify(items, { header: true })
        downloadFromText(name, csvText)
      })
  }

  return (
    <Button onClick={onClick}>
      <DownloadOutlined />
      Export
    </Button>
  )
}


export const ExportFromURLButton = ({ exportFunction, filename }) => {
  let name = filename + '_' + new Date().toISOString().slice(0,10) + '.csv'
  const onClick = () => {
    exportFunction()
      .then(res => { downloadFromURL(res.url, name) });
  }

  return (
    <Button onClick={onClick}>
      <DownloadOutlined />
      Export
    </Button>
  )
}

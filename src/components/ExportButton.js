import React from "react";
import {downloadFromText} from "../utils/download";
import csvStringify from "csv-stringify/lib/sync";

import {Button} from "antd";
import "antd/es/button/style/css";

import { DownloadOutlined } from "@ant-design/icons";


const ExportButton = ({ exportFunction, filename }) => {
  let name = filename + '_' + new Date().toISOString().slice(0,10) + '.csv'
  const onClick = () => {
    exportFunction()
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

export default ExportButton
import React from "react";
import {downloadFromText} from "../utils/download";
import {Button} from "antd";
import csvStringify from "csv-stringify/lib/sync";
import { DownloadOutlined } from "@ant-design/icons";


const ExportButton = ({ exportFunction, fileName }) => {
  var fileName = fileName + '_' + (new Date()).toJSON() + '.csv'
  const onClick = () => {
    exportFunction()
      .then(items => {
        const csvText = csvStringify(items, { header: true })
        downloadFromText(fileName, csvText)
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
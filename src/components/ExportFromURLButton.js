import React from "react";
import {downloadFromURL} from "../utils/download";

import {Button} from "antd";
import "antd/es/button/style/css";

import { DownloadOutlined } from "@ant-design/icons";
import {withToken} from "../utils/api";


const ExportFromURLButton = ({ url, token, filename }) => {
  let name = filename + '_' + new Date().toISOString().slice(0, 10) + '.csv'
  const onClick = () => {
      withToken(token, url)()
      .then(res => { downloadFromURL(res.url, name) });
  }

  return (
    <Button onClick={onClick}>
      <DownloadOutlined />
      Export
    </Button>
  )
}

export default ExportFromURLButton;
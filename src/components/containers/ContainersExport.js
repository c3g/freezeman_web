import React from 'react'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import api, {withToken}  from "../../utils/api"


export const fetchJSON = (token) => {
  withToken(token, api.containers.listExport)()
    .then(response => {
      console.log(response.data)
    })
    .catch(error => {
      console.log(error)
    })
}


export const ExportCSV = ({csvData=[], fileName, token}) => {
  csvData = fetchJSON(token)

  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  const exportToCSV = (csvData, fileName) => {
    // const ws = XLSX.utils.json_to_sheet(csvData);
    // const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    // const data = new Blob([excelBuffer], {type: fileType});
    // FileSaver.saveAs(data, fileName + '.xlsx');
  }

  return (
    <button onClick={(e) => exportToCSV(csvData,fileName)}>Export</button>
  )
}

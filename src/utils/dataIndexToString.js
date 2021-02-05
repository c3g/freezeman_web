export default function dataIndexToString(dataIndex) {
  return Array.isArray(dataIndex) ?
    dataIndex.join("__") :
    dataIndex
}
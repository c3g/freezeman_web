/*
 * serializeSortByParams.js
 */

const prefixByOrder = {
  'ascend': '',
  'descend': '-',
}

export default function serializeSortByParams(sortBy) {
  let key = sortBy.key
  const order = sortBy.order
  if (key === undefined || order === undefined)
    return undefined

  if (Array.isArray(key))
    key = key.join("__")

  const prefix = prefixByOrder[order]
  return prefix + key
}

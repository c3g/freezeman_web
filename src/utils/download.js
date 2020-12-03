/*
 * download.js
 */


export function downloadFromURL(url, filename) {
  const link = document.createElement('a')
  link.setAttribute('href', url)
  if (filename)
    link.setAttribute('download', filename)

  if (document.createEvent) {
    const event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    link.dispatchEvent(event)
  } else {
    link.click()
  }
}

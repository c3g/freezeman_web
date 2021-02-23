/*
 * create-ethereal-email.js
 */

const cheerio = require('cheerio')
const fetch = require('isomorphic-fetch')
const csvParse = require('csv-parse/lib/sync')
const imap = require('imap-simple')
const simpleParser = require('mailparser').simpleParser

const util = require('util')
util.inspect.defaultOptions =  { colors: true, depth: 9 }

module.exports = { create, readAll, findSignUpLink }

/* const credentials = {
 *   service: 'IMAP',
 *   name: 'Amina Lubowitz',
 *   username: 'amina.lubowitz@ethereal.email',
 *   password: 'TSNxBSTPkYSvN9KTwb',
 *   hostname: 'imap.ethereal.email',
 *   port: '993',
 *   security: 'TLS'
 * }  */

// findSignUpLink(credentials).then(console.log)
// readAll(credentials).then(console.log)
// createEtherealEmail().then(console.log)

async function findSignUpLink(credentials) {
  const messages = await readAll(credentials)
  const message = messages.find(m => m.subject.startsWith('Invitation: virus-seq portal'))
  if (!message)
    throw new Error('Could not find sign up email')
  const $ = cheerio.load(message.html)
  return $('a').attr('href')
}

async function readAll(credentials) {
  const config = {
    user: credentials.username,
    password: credentials.password,
    host: credentials.hostname,
    port: +credentials.port,
    tls: credentials.security === 'TLS',
  }
  const connection = await imap.connect({ imap: config })
  await connection.openBox('INBOX')

  const criteria = [/*'UNSEEN'*/]
  const options = {
    bodies: ['HEADER', 'TEXT', ''],
    markSeen: false
  }

  const items = await connection.search(criteria, options)
  const messages = await Promise.all(items.map(parseMessage))
  // console.log(messages)
  return messages
}

async function create() {
  let retries = 3
  while (retries-- > 0) {
    const request = await fetch('https://ethereal.email/create')
    const requestHtml = await request.text()
    const token = findToken(requestHtml)
    const cookie = request.headers.get('set-cookie')
    // console.log(request.headers)
    // console.log({ token, cookie })

    const responseHtml = await fetch("https://ethereal.email/create", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,fr;q=0.8,es;q=0.7,la;q=0.6",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
      },
      "referrer": "https://ethereal.email/create",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": `_csrf=${token}`,
      "method": "POST",
      "mode": "cors"
    })
    .then(res => res.text())

    // console.log(responseHtml)
    const $ = cheerio.load(responseHtml)
    const data = $('a[download]').attr('href')
    if (!data) {
      // console.error(responseHtml)
      continue
    }
    // console.log($('a[download]').html())
    const endMarker = 'base64,'
    const base64Data = data.slice(data.indexOf(endMarker) + endMarker.length)
    // console.log(base64Data)
    const csvData = Buffer.from(base64Data, 'base64').toString('utf-8')
    const credentials = csvParse(csvData, { columns: true })
    // console.log(credentials)

    /* Example:
    * [
    *   {
    *     Service: 'SMTP',
    *     Name: 'Amina Lubowitz',
    *     Username: 'amina.lubowitz@ethereal.email',
    *     Password: 'TSNxBSTPkYSvN9KTwb',
    *     Hostname: 'smtp.ethereal.email',
    *     Port: '587',
    *     Security: 'STARTTLS'
    *   },
    *   {
    *     Service: 'IMAP',
    *     Name: 'Amina Lubowitz',
    *     Username: 'amina.lubowitz@ethereal.email',
    *     Password: 'TSNxBSTPkYSvN9KTwb',
    *     Hostname: 'imap.ethereal.email',
    *     Port: '993',
    *     Security: 'TLS'
    *   },
    *   {
    *     Service: 'POP3',
    *     Name: 'Amina Lubowitz',
    *     Username: 'amina.lubowitz@ethereal.email',
    *     Password: 'TSNxBSTPkYSvN9KTwb',
    *     Hostname: 'pop3.ethereal.email',
    *     Port: '995',
    *     Security: 'TLS'
    *   }
    * ] */

    const imap = credentials.find(c => c.Service === 'IMAP')

    Object.keys(imap).forEach(key => {
      const newKey = key.toLowerCase()
      imap[newKey] = imap[key]
      delete imap[key]
    })

    return imap
  }

  throw new Error('Could not create ethereal account')
}

function findToken(html) {
  const $ = cheerio.load(html)
  const token = $('[name=_csrf]').attr('value')
  return token
}

function parseMessage(item) {
  return new Promise((resolve, reject) => {
    const all = item.parts.find(p => p.which === '')
    const id = item.attributes.uid
    const idHeader = `Imap-Id: ${id}\r\n`
    simpleParser(idHeader + all.body, (err, mail) => {
      if (err)
        reject(err)
      else
        resolve(mail)
    })
  })
}

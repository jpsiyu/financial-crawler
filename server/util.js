const fs = require('fs')
const CSV = require('csv-string')

// switches
const LOG_OPEN = true
const SAVE_HTML = false
const SAVE_JSON = true
const READ_LOCAL = true

const DATA_PATH = 'server/download/data'
const DATA_TEMP_PATH = 'server/download/dataTemp'
const TEMP_PATH = 'server/download/temp' 
const A_DAY = 24 * 3600 * 1000

function log(...args) {
    if (LOG_OPEN)
        console.log(...args)
}

function saveCrawled(data) {
    if (!SAVE_HTML) return
    fs.writeFile(`${TEMP_PATH}/crawled.html`, data, (err) => {
        if (err) throw err
        log('Html Saved!')
    })
}

function json2local(path, jsonData) {
    if (SAVE_JSON) {
        fs.writeFile(path, jsonData, (err) => {
            if (err)
                log('ERR:', err)
            else
                log('Json Saved')
        })
    }
}

function local2json(path, dayCheck=true) {
    if (!READ_LOCAL) return false
    let data = false
    if (fs.existsSync(path)) {
        const s = fs.statSync(path)
        const diff = Date.now() - (new Date(s.mtime)).getTime()
        const read = dayCheck ? diff < A_DAY : true
        if (read)
            data = fs.readFileSync(path, 'utf8')
    }
    return data
}

function serverMsg(res, msg, ok=true) {
    log('server msg sended')
    res.status(200).json({ msg, ok })
}

function csvStr2Json(csvStr) {
    let jsonObj = {}
    jsObj = CSV.parse(csvStr)
    jsonObj = JSON.stringify(jsObj)
    return jsonObj
}

function checkTickerValid(ticker) {
    let pass = true
    if (isNaN(ticker) || ticker.length != 6) {
        pass = false
    } 
    return pass
}

module.exports = {
    log,
    saveCrawled,
    serverMsg,
    csvStr2Json,
    json2local,
    local2json,
    checkTickerValid,
    DATA_PATH,
    DATA_TEMP_PATH,
}
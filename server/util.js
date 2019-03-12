const fs = require('fs')
const buildUrl = require('build-url')
const CSV = require('csv-string')

// switches
const LOG_OPEN = true
const SAVE_HTML = false
const SAVE_JSON = true
const READ_LOCAL = false

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


/*
    code: Tick's symbol
    reportType: is = Income Statement, cf = Cash Flow, bs = Balance Sheet
    period: 12 for annual reporting, 3 for quarterly reporting
    dataType: this doesn't seem to change and is always A
    order: asc or desc (ascending or descending)
    columnYear: 5 or 10 are the only two values supported
    number: The units of the response data. 1 = None 2 = Thousands 3 = Millions 4 = Billions
    api detail: https://gist.github.com/hahnicity/45323026693cdde6a116
*/
function financialUrl(url, code, reportType = 'is', period = 12, dataType = 'A', order = 'asc', columnYear = 10, number = 3) {
    queryParams = {
        't': code,
        'reportType': reportType,
        'period': period,
        'dataType': dataType,
        'order': order,
        'columnYear': columnYear,
        'number': number
    }
    const res = buildUrl(url, { queryParams })
    return res
}

function keyRatioUrl(url, ticker) {
    queryParams = {
        't': ticker
    }
    const res = buildUrl(url, { queryParams })
    return res
}

function csvStr2Json(csvStr) {
    let jsonObj = {}
    jsObj = CSV.parse(csvStr)
    jsonObj = JSON.stringify(jsObj)
    return jsonObj
}

function quoteUrl(ticker) {
    return `https://www.marketwatch.com/investing/stock/${ticker}?countrycode=cn`
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
    financialUrl,
    csvStr2Json,
    json2local,
    local2json,
    keyRatioUrl,
    quoteUrl,
    checkTickerValid,
    DATA_PATH,
    DATA_TEMP_PATH,
}
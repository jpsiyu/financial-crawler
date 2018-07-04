const fs = require('fs')
const buildUrl = require('build-url')

// switches
const logOpen = true
const saveHtml = false

function log(...args){
    if(logOpen)
        console.log(...args)
}

function saveCrawled(data){
    if(!saveHtml) return
    fs.writeFile('temp/crawled.html', data, (err)=>{
        if(err) throw err
        log('File Saved!')
    })
}

function serverMsg(res, msg){
    res.status(200).json({msg})
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
function financialUrl(url, code, reportType='is', period=12, dataType='A', order='asc', columnYear=10, number=3){
    queryParams = {
        't': code,
        'reportType': reportType,
        'period': period,
        'dataType': dataType,
        'order': order,
        'columnYear': columnYear,
        'number': number
    }
    const res = buildUrl(url, {queryParams})
    return res
}

module.exports = {
    log: log,
    saveCrawled: saveCrawled,
    serverMsg: serverMsg,
    financialUrl: financialUrl,
}
const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const util = require('./util.js')
const path = require('path')

const DATA_PATH = 'server/data'

const app = express()
app.use(express.static(path.resolve(__dirname, '../dist')))

app.use((req, res, next) => {
    util.log(`A ${req.method} method to ${req.url}`)
    next()
})

app.get('/quote', (req, res) => {
    const ticker = '000423'
    const localPath = `${DATA_PATH}/${ticker}-quote.json`
    data = util.local2json(localPath)
    if(data){
        util.log('Read From Local...')
        util.serverMsg(res, data)
        return 
    }

    util.log('Crawb The Website...')
    const url = `https://www.msn.com/en-us/money/stockdetails/fi-137.1.${ticker}.SHE?symbol=000423&form=PRFIHQ`
    request(url ,(err, response, body) => {
        util.log('Handle Response...')
        let msg = []
        if(!err){
            const $ = cheerio.load(body)
            util.saveCrawled($.html())
            const rows = [] 
            const ul = $('ul.today-trading-container')
            ul.find('li').each((index, obj)=>{
                li = $(obj)
                keyTab = li.children().first()
                valueTab = keyTab.next()
                rows.push([keyTab.text(), valueTab.text()])
            })
            msg = JSON.stringify(rows)
            util.json2local(localPath, msg)
        }else{
            util.log('ERR:', err)
            util.log('Tips: Try Again With VPN Off!')
            msg = JSON.stringify(msg)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/key_ratio', (req, res) => {
    const ticker = '000423'
    const localPath = `${DATA_PATH}/${ticker}-key-ratio.json`
    let data = util.local2json(localPath)
    if(data){
        util.log('Read From Local...')
        util.serverMsg(res, data)
        return 
    }

    const url = 'http://financials.morningstar.com/ajax/exportKR2CSV.html'
    const combinedUrl = util.keyRatioUrl(url, ticker)
    request(combinedUrl, (error, response, body) => {
        let msg = []
        if(!error){
            msg = util.csvStr2Json(body)
            util.json2local(localPath, msg)
        }else{
            util.log('ERR:', error)
            msg = JSON.stringify(msg)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/income_statement', (req, res) => {
    const ticker = '000423'
    const localPath = `${DATA_PATH}/${ticker}-income-statement.json`
    data = util.local2json(localPath)
    if(data){
        util.log('Read From Local...')
        util.serverMsg(res, data)
        return 
    }
    const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
    const combinedUrl = util.financialUrl(url, ticker)
    request(combinedUrl, (error, response, body) => {
        let msg = []
        if(!error){
            msg = util.csvStr2Json(body)
            util.json2local(localPath, msg)
        }else{
            util.log('ERR:', error)
            msg = JSON.stringify(msg)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/balance_sheet', (req, res) => {
    const ticker = '000423'
    const localPath = `${DATA_PATH}/${ticker}-balance-sheet.json`
    data = util.local2json(localPath)
    if(data){
        util.log('Read From Local...')
        util.serverMsg(res, data)
        return 
    }
    const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
    const combinedUrl = util.financialUrl(url, ticker, reportType='bs')
    request(combinedUrl, (error, response, body) => {
        let msg = []
        if(!error){
            msg = util.csvStr2Json(body)
            util.json2local(localPath, msg)
        }else{
            util.log('ERR:', error)
            msg = JSON.stringify(msg)
        }
        util.serverMsg(res, msg)
    })
})


app.get('/cashflow', (req, res) => {
    const ticker = '000423'
    const localPath = `${DATA_PATH}/${ticker}-cashflow.json`
    data = util.local2json(localPath)
    if(data){
        util.log('Read From Local...')
        util.serverMsg(res, data)
        return 
    }
    const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
    const combinedUrl = util.financialUrl(url, ticker, reportType='cf')
    request(combinedUrl, (error, response, body) => {
        let msg = []
        if(!error){
            msg = util.csvStr2Json(body)
            util.json2local(localPath, msg)
        }else{
            util.log('ERR:', error)
            msg = JSON.stringify(msg)
        }
        util.serverMsg(res, msg)
    })
})

app.use((req, res, next) => {
    res.status(404).json('404 - Page Not Found...')
})

app.use((err, req, res, next) => {
    console.log(JSON.stringify(err, null,  2))
    res.status(500).json('500 - Internal Server Error...')
})

app.listen('3000', () => console.log('Server Listening On Port 3000..'))
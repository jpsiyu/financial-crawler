const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const util = require('./util.js')

const app = express()

app.get('/quote', (req, res) => {
    const url = 'https://www.msn.com/en-us/money/stockdetails/fi-137.1.000423.SHE?symbol=000423&form=PRFIHQ'
    request(url ,(err, response, html) => {
        util.log('Handle Response...')
        let msg = {}
        if(!err){
            const $ = cheerio.load(html)
            util.saveCrawled($.html())
            ul = $('ul.today-trading-container')
            ul.find('li').each((index, obj)=>{
                li = $(obj)
                keyTab = li.children().first()
                valueTab = keyTab.next()
                msg[keyTab.text()] = valueTab.text()
            })
        }else{
            util.log('ERR:', err)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/key_ratio', (req, res) => {
    const url = 'https://www.msn.com/en-us/money/stockdetails/analysis/fi-137.1.000423.SHE'
    request(url, (err, response, html) => {
        util.log('Handle Response...')
        let msg = {}
        if(!err){
            const $ = cheerio.load(html)
            util.saveCrawled($.html())
            div = $('div.stock-highlights-left-container')
            divTable = div.find('div.table-data-rows')
            divTable.find('ul.level0').each((index, obj)=>{
                ul = $(obj)
                keyTab = ul.children().first()
                valueTab = keyTab.next()
                msg[keyTab.text().trim()] = valueTab.text().trim()
            })
        }else{
            util.log('ERR:', err)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/income_statement', (req, res) => {
    const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
    const combinedUrl = util.financialUrl(url, '000423')
    request(combinedUrl, (error, response, body) => {
        let msg = {}
        if(!error){
            msg = util.csvStr2Json(body)
        }else{
            util.log('ERR:', error)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/balance_sheet', (req, res) => {
    const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
    const combinedUrl = util.financialUrl(url, '000423', reportType='bs')
    request(combinedUrl, (error, response, body) => {
        let msg = {}
        if(!error){
            msg = util.csvStr2Json(body)
        }else{
            util.log('ERR:', error)
        }
        util.serverMsg(res, msg)
    })
})


app.get('/cashflow', (req, res) => {
    const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
    const combinedUrl = util.financialUrl(url, '000423', reportType='cf')
    request(combinedUrl, (error, response, body) => {
        let msg = {}
        if(!error){
            msg = util.csvStr2Json(body)
        }else{
            util.log('ERR:', error)
        }
        util.serverMsg(res, msg)
    })
})

app.get('/', (req, res) => {
    res.status(200).json('Hello There...')
})

app.get('*', (req, res) => {
    res.status(404).json('Page Not Found...')
})

app.get('*', (error, req, res) => {
    res.status(500).json('Internal Server Error...')
})

app.listen('3000', () => console.log('Server Listening On Port 3000..'))
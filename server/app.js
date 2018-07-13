const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const util = require('./util.js')
const path = require('path')
const bodyParser = require('body-parser')

const DATA_PATH = 'server/data'

const MSNQuote = require('./crawler/MSNQuote')
const MSKeyRatio = require('./crawler/MSKeyRatio')
const MSReport = require('./crawler/MSReport')

const app = express()
app.use(express.static(path.resolve(__dirname, '../dist')))
app.use(express.static(path.resolve(__dirname, '../client/public')))
app.use(bodyParser.json())

app.use((req, res, next) => {
    util.log(`${req.method},${req.url}`)
    next()
})

const pipeline = (req, res, handler) => {
    if(!handler.checkTickerValid()) {
        util.serverMsg(res, JSON.stringify([]))
        return
    }

    const data = handler.loadLocal()
    if(data){
        util.log('Read From Local')
        util.serverMsg(res, data)
        return 
    }
    handler.crawlWebSite((ok, data) => {
        util.log('Crawb The Website...')
        util.serverMsg(res, data, ok)
    })
}

app.get('/quote', (req, res) => {
    const ticker = req.query.ticker
    const msnQuote = new MSNQuote(ticker)
    pipeline(req, res, msnQuote)
})

app.get('/key_ratio', (req, res) => {
    const ticker = req.query.ticker
    const msKeyRatio = new MSKeyRatio(ticker)
    pipeline(req, res, msKeyRatio)
})

app.get('/income_statement', (req, res) => {
    const ticker = req.query.ticker
    const income = new MSReport(ticker, 'is')
    pipeline(req, res, income)
})

app.get('/balance_sheet', (req, res) => {
    const ticker = req.query.ticker
    const balance = new MSReport(ticker, 'bs')
    pipeline(req, res, balance)
})


app.get('/cashflow', (req, res) => {
    const ticker = req.query.ticker
    const cashflow = new MSReport(ticker, 'cf')
    pipeline(req, res, cashflow)
})

app.use((req, res, next) => {
    res.status(404).json('404 - Page Not Found...')
})

app.use((err, req, res, next) => {
    util.log('Err:', err)
    res.status(500).json('500 - Internal Server Error...')
})

app.listen('3000', () => console.log('Server Listening On Port 3000..'))
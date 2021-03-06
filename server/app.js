const express = require('express')
const util = require('./util.js')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const pjson = require('../package.json')

const MWQuote = require('./crawler/MWQuote')
const MSKeyRatio = require('./crawler/MSKeyRatio')
const MSReport = require('./crawler/MSReport')
const GuChengTicker = require('./crawler/GuChengTicker')

const app = express()
app.use(express.static(path.resolve(__dirname, '../dist')))
app.use(express.static(path.resolve(__dirname, '../client/public')))

app.use(bodyParser.json())
app.use(cors())

app.use((req, res, next) => {
    util.log(`${req.method},${req.originalUrl}`)
    next()
})

const pipeline = (req, res, handler) => {
    if (!handler.checkTickerValid()) {
        util.serverMsg(res, JSON.stringify([]))
        return
    }

    const data = handler.loadLocal()
    if (data) {
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
    const mwQuote = new MWQuote(ticker)
    pipeline(req, res, mwQuote)
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

app.get('/tickers', (req, res) => {
    pipeline(req, res, tickerStore)
})

app.get('/ticker_name', (req, res) => {
    const ticker = req.query.ticker
    const tickerName = tickerStore.getTickerName(ticker)
    const msg = JSON.stringify({ ticker, tickerName })
    util.serverMsg(res, msg)
})

app.use((req, res, next) => {
    res.status(404).json('404 - Page Not Found...')
})

app.use((err, req, res, next) => {
    util.log('Err:', err)
    res.status(500).json('500 - Internal Server Error...')
})

const tickerStore = new GuChengTicker()
tickerStore.loadLocal()

app.listen(pjson.port, () => console.log(`Server Listening On Port ${pjson.port}..`))
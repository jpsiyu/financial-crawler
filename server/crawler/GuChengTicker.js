const Crawler = require('./crawler')
const util = require('../util')
const cheerio = require('cheerio')
const request = require('request')

class GuChengTicker extends Crawler {
    constructor() {
        super(undefined)
        this.localPath = `${util.DATA_PATH}/em-tickers.json`
        this.data = undefined
    }

    checkTickerValid() {
        return true
    }

    loadLocal() {
        const data = util.local2json(this.localPath, false)
        this.data = JSON.parse(data)
        return data
    }

    crawlWebSite(callback) {
        const url = 'https://hq.gucheng.com/gpdmylb.html'
        request(url, (err, response, body) => {
            let data = {}
            if (!err) {
                const $ = cheerio.load(body, { decodeEntities: true })
                util.saveCrawled($.html())
                const div = $('div.stock_sub')
                div.find('a').each((i, aObj) => {
                    const a = $(aObj)
                    const t = a.text().trim()
                    const {name, ticker} = this.parseTicker(t) 
                    data[ticker] = name
                })
            } else {
                util.log('ERR:', err)
            }
            const jsonData = JSON.stringify(data)
            const ok = !err
            if(ok) util.json2local(this.localPath, jsonData)
            callback(ok, jsonData)
        })
    }

    parseTicker(str){
        const name = str.slice(0, -8)
        const ticker = str.slice(-7, -1)
        return {name, ticker}
    }

    getTickerName(ticker){
        return this.data[ticker.toString()]
    }
}

module.exports = GuChengTicker


const Crawler = require('./crawler')
const util = require('../util')
const cheerio = require('cheerio')
const request = require('request')

class MWQuote extends Crawler {
    constructor(ticker) {
        super(ticker)
        this.localPath = `${util.DATA_TEMP_PATH}/${ticker}-quote.json`
    }

    checkTickerValid() {
        return util.checkTickerValid(this.ticker)
    }

    loadLocal() {
        const data = util.local2json(this.localPath)
        return data
    }

    quoteUrl(ticker) {
        return `https://www.marketwatch.com/investing/stock/${ticker}?countrycode=cn`
    }

    crawlWebSite(callback) {
        const url = this.quoteUrl(this.ticker)
        request(url, (err, response, body) => {
            let data = []
            if (!err) {
                const $ = cheerio.load(body)
                util.saveCrawled($.html())
                const ul = $('ul.list--kv')
                ul.find('li').each((index, obj) => {
                    let li = $(obj)
                    let keyTab = li.children().first()
                    let valueTab = keyTab.next()
                    data.push([keyTab.text(), valueTab.text()])
                })
            } else {
                util.log('ERR:', err)
            }

            data = JSON.stringify(data)
            const ok = !err
            if (ok) util.json2local(this.localPath, data)
            callback(ok, data)
        })
    }
}

module.exports = MWQuote
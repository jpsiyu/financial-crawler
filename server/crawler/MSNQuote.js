const Crawler = require('./crawler')
const util = require('../util')
const cheerio = require('cheerio')

class MSNQuote extends Crawler {
    constructor(ticker) {
        super(ticker)
        this.localPath = `${util.DATA_PATH}/${ticker}-quote.json`
    }

    checkTickerValid() {
        return util.checkTickerValid(this.ticker)
    }

    loadLocal() {
        const data = util.local2json(this.localPath)
        return data
    }

    crawlWebSite(callback) {
        const url = util.quoteUrl(this.ticker)
        request(url, (err, response, body) => {
            let data = []
            if (!err) {
                const $ = cheerio.load(body)
                util.saveCrawled($.html())
                const ul = $('ul.today-trading-container')
                ul.find('li').each((index, obj) => {
                    li = $(obj)
                    keyTab = li.children().first()
                    valueTab = keyTab.next()
                    data.push([keyTab.text(), valueTab.text()])
                })
            } else {
                util.log('ERR:', err)
            }

            data = JSON.stringify(data)
            const ok = !err
            if(ok) util.json2local(localPath, data)
            callback(ok, data)
        })
    }
}

module.exports = MSNQuote
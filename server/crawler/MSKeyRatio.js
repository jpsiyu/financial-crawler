const Crawler = require('./crawler')
const util = require('../util')
const request = require('request')

class MSKeyRatio extends Crawler {
    constructor(ticker) {
        super(ticker)
        this.localPath = `${util.DATA_PATH}/${ticker}-key-ratio.json`
    }
    checkTickerValid() {
        return util.checkTickerValid(this.ticker)
    }

    loadLocal() {
        const data = util.local2json(this.localPath)
        return data
    }

    crawlWebSite(callback) {
        const url = 'http://financials.morningstar.com/ajax/exportKR2CSV.html'
        const combinedUrl = util.keyRatioUrl(url, this.ticker)
        request(combinedUrl, (error, response, body) => {
            let data = []
            let ok = false
            if(body === ''){
                util.log('Err: Body Empty')
                data = JSON.stringify([])
            }else if (!error) {
                data = util.csvStr2Json(body)
                util.json2local(this.localPath, data)
                ok = true
            } else {
                util.log('ERR:', error)
                data = JSON.stringify([])
            }
            callback(ok, data)
        })
    }
}

module.exports = MSKeyRatio
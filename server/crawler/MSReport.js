const Crawler = require('./crawler')
const util = require('../util')

class MSReport extends Crawler {
    constructor(ticker, reportType) {
        super(ticker)
        this.reportType = reportType
        this.localPath = this.getLocalPath()
    }

    getLocalPath() {
        let path = ''
        switch (this.reportType) {
            case 'is':
                path = `${util.DATA_PATH}/${this.ticker}-income-statement.json`
                break
            case 'bs':
                path = `${util.DATA_PATH}/${this.ticker}-balance-sheet.json`
                break
            case 'cf':
                path = `${util.DATA_PATH}/${this.ticker}-cashflow.json`
                break
            default:
                util.log('Not Support Report Type: ' + this.reportType)
                break
        }
        return path
    }

    checkTickerValid() {
        return util.checkTickerValid(this.ticker)
    }

    loadLocal() {
        const data = util.local2json(this.localPath)
        return data
    }

    crawlWebSite(callback) {
        const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
        const combinedUrl = util.financialUrl(url, ticker, reportType = this.reportType)
        request(combinedUrl, (error, response, body) => {
            let data = []
            let ok = false
            if (!error) {
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

module.exports = MSReport
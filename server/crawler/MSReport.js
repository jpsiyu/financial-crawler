const Crawler = require('./crawler')
const util = require('../util')
const request = require('request')
const buildUrl = require('build-url')

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
                path = `${util.DATA_TEMP_PATH}/${this.ticker}-income-statement.json`
                break
            case 'bs':
                path = `${util.DATA_TEMP_PATH}/${this.ticker}-balance-sheet.json`
                break
            case 'cf':
                path = `${util.DATA_TEMP_PATH}/${this.ticker}-cashflow.json`
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
    financialUrl(url, code, reportType = 'is', period = 12, dataType = 'A', order = 'asc', columnYear = 10, number = 3) {
        const queryParams = {
            't': code,
            'reportType': reportType,
            'period': period,
            'dataType': dataType,
            'order': order,
            'columnYear': columnYear,
            'number': number
        }
        const res = buildUrl(url, { queryParams })
        return res
    }

    crawlWebSite(callback) {
        const url = 'http://financials.morningstar.com/ajax/ReportProcess4CSV.html'
        const combinedUrl = this.financialUrl(url, this.ticker, this.reportType)
        util.log('************', url, combinedUrl)
        request(combinedUrl, (error, response, body) => {
            let data = []
            let ok = false
            if (body === '') {
                util.log('Err: Body Empty')
                data = JSON.stringify([])
            } else if (!error) {
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
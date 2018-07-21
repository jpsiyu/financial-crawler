import macro from '../lib/macro'
import tool from '../lib/tool'
import regression from 'regression'
import store from '../store'
import { Record, RecordManager } from './record'

class DcfCalculator {
    constructor() {
        this.riskFree = 0.036
        this.riskPremium = 0.035
        this.perpetuityGrowth = 0.03

        this.health = macro.DATA_EMPTY
        this.lose = {}
        this.recordMgr = new RecordManager()
    }

    startAnalyse() {
        const all = store.getState()
        const data = {
            quote: all.quote,
            income: all.income,
            balance: all.balance,
            cashflow: all.cashflow
        }
        this.check(data)
    }

    check(data) {
        const { quote, income, balance, cashflow } = data
        if (tool.empty(quote) || tool.empty(income) || tool.empty(balance) || tool.empty(cashflow)) {
            this.health = macro.DATA_EMPTY
            return
        }

        this.recordMgr.add('Beta', new Record(quote['Beta']))
        this.recordMgr.add('Market Cap.', new Record(quote['Market Cap.']))
        this.recordMgr.add('Shares Outstanding', new Record(quote['Shares Outstanding']))

        const recordLDebt = new Record(balance['Long-term debt'])
        recordLDebt.replaceZeros(5)
        const recordSDebt = new Record(balance['Short-term debt'])
        recordSDebt.replaceZeros(5)
        this.recordMgr.add('Short-term debt', recordSDebt)
        this.recordMgr.add('Long-term debt', recordLDebt)

        this.recordMgr.add('Provision for income taxes', new Record(income['Provision for income taxes']))
        this.recordMgr.add('Income before taxes', new Record(income['Income before taxes']))
        this.recordMgr.add('Operating income', new Record(income['Operating income']))
        this.recordMgr.add('Interest Expense', new Record(income['Interest Expense']))

        this.recordMgr.add('Year', new Record(cashflow['Fiscal year ends in December. CNY in millions except per share data.']))
        this.recordMgr.add('Free cash flow', new Record(cashflow['Free cash flow']))

        const lose = this.recordMgr.getLose()
        if (!tool.empty(lose)) {
            this.health = macro.DATA_LOSE
            this.lose = lose
        } else {
            this.health = macro.DATA_PERFECT
            this.modelInit()
        }
    }


    modelInit() {
        const lDebt = this.recordMgr.get('Long-term debt')
        const sDebt = this.recordMgr.get('Short-term debt')
        const debt = lDebt.lastAsNum() + sDebt.lastAsNum()
        this.bookDebt = debt
        this.marketDebt = debt

        const incomeTax = this.recordMgr.get('Provision for income taxes')
        incomeTax.sliceLastAsNum()
        const incomeRecord = this.recordMgr.get('Income before taxes')
        incomeRecord.sliceLastAsNum()

        const len = incomeTax.data.length

        let taxRate = 0
        for (let i = 0; i < len; i++) {
            let taxPay = incomeTax.data[i]
            let income = incomeRecord.data[i]
            let rate = taxPay / income
            taxRate += rate
        }
        this.taxRate = tool.toFloat((taxRate / len))

        this.beta = this.recordMgr.get('Beta').firstAsNum()
        this.marketEquity = this.recordMgr.get('Market Cap.').firstAsNum(true)
        this.fcfPass = {
            'Year': this.recordMgr.get('Year').sliceLastAsYear(),
            'Free cash flow': this.recordMgr.get('Free cash flow').sliceLastAsNum()
        }
        this.operatingIncome = this.recordMgr.get('Operating income').sliceLastAsNum()
        this.shareOutstanding = this.recordMgr.get('Shares Outstanding').firstAsNum(true)

    }

    costOfEquity() {
        const res = this.riskFree + this.riskPremium * this.beta
        return parseFloat(res.toFixed(4))
    }

    costOfDebtPreTax() {
        return 0.07
    }

    costOfDebtAfterTax() {
        const preTax = this.costOfDebtPreTax()
        const afterTax = preTax * (1 - this.taxRate)
        return parseFloat(afterTax.toFixed(4))
    }

    calCAGR() {
        const start = this.operatingIncome[0]
        const end = this.operatingIncome[this.operatingIncome.length - 1]
        const year = this.operatingIncome.length
        const cagr = Math.pow((end / start), (1 / year)) - 1
        return tool.toFloat(cagr, 4)
    }

    wacc() {
        const res = (this.marketEquity * this.costOfEquity() + this.marketDebt * this.costOfDebtAfterTax()) /
            (this.marketEquity + this.marketDebt)
        return parseFloat(res.toFixed(4))
    }

    predictRegression(num = 5) {
        let data = []
        for (let i = 0; i < this.fcfPass['Year'].length; i++) {
            data.push([this.fcfPass['Year'][i], this.fcfPass['Free cash flow'][i]])
        }
        const result = regression.linear(data)
        const k = result.equation[0]
        const b = result.equation[1]
        const startYear = parseInt(this.fcfPass['Year'][0])
        const lastYear = parseInt(this.fcfPass['Year'][this.fcfPass['Year'].length - 1])
        const endYear = lastYear + num

        const predictData = {
            fullX: [],
            fullPredictY: [],
            fullHistoryY: [],
            futureX: [],
            futureY: [],
        }
        for (let i = startYear, j = 0; i <= endYear; i++ , j++) {
            predictData.fullX.push(i)
            let predictValue = parseFloat((k * i + b).toFixed(2))
            predictData.fullPredictY.push(predictValue)
            let value = (j >= this.fcfPass['Year'].length) ? 0 : this.fcfPass['Free cash flow'][j]
            predictData.fullHistoryY.push(value)
            if (i > lastYear) {
                predictData.futureX.push(i)
                predictData.futureY.push(predictValue)
            }
        }
        return predictData
    }

    predictOperatingGrowth(num = 5) {
        let fcfSum = 0
        const fcfValue = this.fcfPass['Free cash flow']
        for (let i = 0; i < fcfValue.length; i++) {
            fcfSum += fcfValue[i]
        }
        const fcfMean = tool.toFloat(fcfSum / fcfValue.length)

        const startYear = parseInt(this.fcfPass['Year'][0])
        const lastYear = parseInt(this.fcfPass['Year'][this.fcfPass['Year'].length - 1])
        const endYear = lastYear + num

        const predictData = {
            fullX: [],
            fullPredictY: [],
            fullHistoryY: [],
            futureX: [],
            futureY: [],
        }
        const cagr = this.calCAGR()
        const calWithCagr = (year) => {
            return tool.toFloat(fcfMean * Math.pow((cagr + 1), year))
        }

        for (let i = startYear, j = 0; i <= endYear; i++ , j++) {
            predictData.fullX.push(i)
            let predictValue = calWithCagr(j + 1)
            if (j >= this.fcfPass['Year'].length) {
                predictData.fullPredictY.push(predictValue)
                predictData.fullHistoryY.push(0)
                predictData.futureX.push(i)
                predictData.futureY.push(predictValue)
            } else {
                predictData.fullPredictY.push(0)
                predictData.fullHistoryY.push(this.fcfPass['Free cash flow'][j])
            }
        }
        return predictData
    }

    terminalValue(fcfEnd, num = 5) {
        const wacc = this.wacc()
        const res = fcfEnd * (1 + this.perpetuityGrowth) / (wacc - this.perpetuityGrowth)
        return parseFloat(res.toFixed(2))
    }

    fillFcfReport(fcfReport) {
        fcfReport['Terminal'] = []
        fcfReport['Sum'] = []
        fcfReport['Discount'] = []
        const wacc = this.wacc()
        const l = fcfReport['Year'].length
        for (let i = 0; i < l; i++) {
            let year = fcfReport['Year'][i]
            let predict = fcfReport['Predict'][i]
            let termValue = 0
            if (i == (l - 1)) {
                termValue = this.terminalValue(predict, l)
            }
            let sum = tool.toFloat(predict + termValue)
            let discount = tool.toFloat((sum / Math.pow(1 + wacc, i + 1)))
            fcfReport['Terminal'].push(termValue)
            fcfReport['Sum'].push(sum)
            fcfReport['Discount'].push(discount)
        }
    }

    valuationReport(fcfReport) {
        const valuationReport = {}
        let totalValue = 0
        for (let i = 0; i < fcfReport['Discount'].length; i++) {
            totalValue += fcfReport['Discount'][i]
        }
        totalValue = tool.toFloat(totalValue)
        const intrinsic = tool.toFloat(totalValue - this.marketDebt)
        const valuePerShare = parseFloat((intrinsic / this.shareOutstanding).toFixed(2))
        valuationReport['Total Value'] = [totalValue]
        valuationReport['Market Price Debt'] = [this.marketDebt]
        valuationReport['Intrinsic Value'] = [intrinsic]
        valuationReport['Shares Outstanding'] = [this.shareOutstanding]
        valuationReport['Value Per Share'] = [valuePerShare]
        return valuationReport
    }

    settingReport() {
        const report = {
            'Beta': [this.beta],
            'Risk Free': [this.riskFree],
            'Risk Premium': [this.riskPremium],
            'Cost Of Equity': [this.costOfEquity()],
            'Cost Of Debt PreTax': [this.costOfDebtPreTax()],
            'Tax Rate': [this.taxRate],
            'Cost Of Debt': [this.costOfDebtAfterTax()],
            'Market Price Equity': [this.marketEquity],
            'Market Price Debt': [this.marketDebt],
            'Perpetuity Growth': [this.perpetuityGrowth],
            'Cagr': [this.calCAGR()],
            'Wacc': [this.wacc()]
        }
        return report
    }

}

export default DcfCalculator
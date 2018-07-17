import macro from '../lib/macro'
import tool from '../lib/tool'
import regression from 'regression'
import store from '../store'

class DcfCalculator {
    constructor() {
        this.riskFree = 0.036
        this.riskPremium = 0.035
        this.perpetuityGrowth = 0.03

        this.health = macro.DATA_EMPTY
        this.lose = {}
        this.measureData = null
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

        const measureData = {}
        const lose = {}

        // measure quote data
        let measureList = [
            'Beta',
            'Market Cap.',
            'Shares Outstanding'
        ]
        measureList.forEach(key => {
            let value = quote[key]
            if (!value || value.length === 0) lose[key] = []
            else if (value[0] == '' || value[0] == '-') lose[key] = value
            else measureData[key] = key == 'Beta' ? tool.toFloat(value[0]) : tool.toMillion(value[0])
        })

        // measure balance data
        measureList = [
            'Short-term debt',
            'Other long-term liabilities'
        ]
        measureList.forEach(key => {
            let value = balance[key]
            if (!value || value.length === 0) lose[key] = []
            else measureData[key] = tool.toFloat(value[value.length - 1])
        })

        // measure income data
        measureList = [
            'Provision for income taxes',
            'Income before taxes',
            'Operating income',
        ]
        measureList.forEach(key => {
            let value = income[key]
            if (!value || value.length === 0) lose[key] = []
            else measureData[key] = tool.toNumList(value).slice(0, -1)
        })

        // measure cashflow data
        measureList = [
            'Fiscal year ends in December. CNY in millions except per share data.',
            'Free cash flow'
        ]
        measureList.forEach((key, i) => {
            let value = cashflow[key]
            if (!value || value.length === 0) lose[key] = []
            else {
                if (i === 0) measureData['Year'] = tool.sliceYearList(value).slice(0, -1)
                else measureData[key] = tool.toNumList(value).slice(0, -1)
            }
        })

        if (!tool.empty(lose)) {
            this.health = macro.DATA_LOSE
            this.lose = lose
        } else {
            this.health = macro.DATA_PERFECT
            this.measureData = measureData
            this.modelInit()
        }
    }


    modelInit() {
        const debt = this.measureData['Short-term debt'] + this.measureData['Other long-term liabilities']

        const len = this.measureData['Provision for income taxes'].length
        let rateSum = 0
        for (let i = 0; i < len; i++) {
            let taxPay = this.measureData['Provision for income taxes'][i]
            let income = this.measureData['Income before taxes'][i]
            let rate = taxPay / income
            rateSum += rate
        }
        const taxRate = tool.toFloat((rateSum / len))

        this.beta = this.measureData['Beta']
        this.taxRate = taxRate
        this.marketEquity = this.measureData['Market Cap.']
        this.marketDebt = debt
        this.fcfPass = {
            'Year': this.measureData['Year'],
            'Free cash flow': this.measureData['Free cash flow']
        }
        this.operatingIncome = this.measureData['Operating income']
        this.shareOutstanding = this.measureData['Shares Outstanding']
    }

    costOfEquity() {
        const res = this.riskFree + this.riskPremium * this.beta
        return parseFloat(res.toFixed(4))
    }

    costOfDebtPreTax() {
        return 0.03
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